from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types
from generator_code import RouteOptimizer
from utils import query_database, get_database_outputs
from supabase import create_client
from PIL import Image
import imagehash
import base64
import os
import json
import re
from io import BytesIO

# Load environment variables
load_dotenv()

# Environment configuration
api = os.getenv("API_KEY")
gen_key = os.getenv("GEN_API")
class_url = os.getenv("CLASS_URL")
class_key = os.getenv("CLASS_KEY")
search_id = os.getenv("SEARCH_ID")
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
MONGO_URL = os.getenv("MONGO_URL")

# Initialize services
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
genai_client = genai.Client(api_key=gen_key)
optimizer = RouteOptimizer(api_key=api, gen_api=gen_key, class_url=class_url, class_key=class_key, search_id=search_id)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client['routeOptimizer']
inputs_collection = db['inputs']
outputs_collection = db['outputs']


@app.route('/generate_location_hint', methods=['POST'])
def generate_location_hint():
    try:
        data = request.json
        location_name = data.get('location_name')
        previous_hint_id = data.get('previous_hint_id')
        user_response = data.get('user_response')
        reject_count = data.get('reject_count', 0)
        accept_count = data.get('accept_count', 0)

        if previous_hint_id == "final" or reject_count >= 3 or accept_count >= 3:
            return jsonify({"hint": {"id": "final", "text": f"The answer is {location_name}.", "type": "factual"}, "is_final": True})

        hint_tree = generate_hint_tree_from_gemini(location_name)

        if previous_hint_id is None:
            hint = hint_tree["tree"]["1"]
            return jsonify({"hint": {"id": "1", **hint}, "is_final": False})

        current = hint_tree["tree"].get(previous_hint_id)
        next_hint_id = current.get("on_understood" if user_response == "understood" else "on_confused")

        if next_hint_id is None:
            return jsonify({"hint": {"id": "final", "text": f"The answer is {location_name}.", "type": "factual"}, "is_final": True})

        next_hint = hint_tree["tree"][next_hint_id]
        return jsonify({"hint": {"id": next_hint_id, **next_hint}, "is_final": False})

    except Exception as e:
        return jsonify({"error": str(e), "message": "Error processing hint generation request"}), 500


def generate_hint_tree_from_gemini(location_name):
    prompt = f"""Generate hints for a location quiz about {location_name}. Return only JSON:
    {{"place_id": "{location_name.lower().replace(' ', '_')}", "tree": {{"1": {{"text": "...", "type": "symbolic", "on_understood": "2A", "on_confused": "2B"}}, ...}}}}"""
    try:
        response = genai_client.models.generate_content(
            model='gemini-2.0-flash-001',
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2, max_output_tokens=1000)
        )
        text = re.search(r'({.*})', response.text, re.DOTALL).group(1)
        return json.loads(text)
    except:
        return generate_fallback_hint_tree(location_name)


def generate_fallback_hint_tree(location_name):
    return {"place_id": location_name.lower().replace(' ', '_'), "tree": {"1": {"text": "Popular destination", "type": "symbolic", "on_understood": "2A", "on_confused": "2B"}}}


@app.route('/get_inputs', methods=['GET'])
def get_inputs():
    try:
        inputs = list(inputs_collection.find())
        for doc in inputs:
            doc['_id'] = str(doc['_id'])
        return jsonify({"inputs": inputs})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get_outputs', methods=['GET'])
def get_outputs():
    try:
        outputs = list(outputs_collection.find())
        for doc in outputs:
            doc['_id'] = str(doc['_id'])
        return jsonify({"outputs": outputs})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get_data_from_parameters', methods=['POST'])
def get_data_from_parameters():
    parameters = request.json
    input_id = query_database(inputs_collection, parameters)
    if input_id:
        outputs = get_database_outputs(outputs_collection, input_id)
        return jsonify({"routes": outputs})
    return jsonify({"routes": []})


@app.route('/optimize_route', methods=['POST'])
def optimize_route():
    try:
        data = request.json
        address = data.get("address")
        lati, long = optimizer.starting_point(data.get("use_current_location", False), address)
        if lati is None:
            return jsonify({"error": "Invalid address"}), 400
        places = optimizer.nearby_places_multi_keyword(
            base_keywords=data.get("keyword", []), maxresult=20, lat=lati, lon=long, radius=data.get("radius", 10))
        final_places = optimizer.sorted_place_details(places, accessible=data.get("accessibility", False))
        optimized_routes = optimizer.optimize_routes(
            lat=lati, lng=long, places=final_places, time_limit=data.get("time_limit", 500),
            max_groups=5, visit_duration_per_location=data.get("time_per_location", 0),
            user_modes=data.get("modes", ["driving"]))
        return jsonify({"routes": json.loads(optimized_routes)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/check_user_location', methods=['POST'])
def check_user_location():
    try:
        data = request.json
        is_at_location = optimizer.is_user_at_location(
            data.get("target_lat"), data.get("target_lon"), data.get("tolerance", 0.01))
        return jsonify({"is_at_location": is_at_location})
    except:
        return jsonify({"error": "Failed to verify location"}), 500


@app.route('/add_sample_image', methods=['POST'])
def add_sample_image():
    data = request.json
    location_name = data.get('location_name')
    image_base64 = data.get('image_data')
    image_path_url = data.get('image_path')
    if not location_name or not image_base64 or not image_path_url:
        return jsonify({"error": "Missing parameters"}), 400
    try:
        image_data = base64.b64decode(image_base64)
        image = Image.open(BytesIO(image_data))
        phash = str(imagehash.phash(image.convert('L')))
        insert_data = {"location_name": location_name.strip(), "image_hash": phash, "image_path": image_path_url}
        response = supabase.table("checkpoints").insert(insert_data).execute()
        return jsonify({"success": True, "data": response.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
