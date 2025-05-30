from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
import os
import json
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types
from generator_code import RouteOptimizer
from utils import query_database, get_database_outputs
import base64
import requests
from io import BytesIO
from PIL import Image
import imagehash
from supabase import create_client
from supabase import create_client

load_dotenv()
api = os.getenv("API_KEY")
gen_key = os.getenv("GEN_API")
class_url = os.getenv("CLASS_URL")
class_key = os.getenv("CLASS_KEY")
search_id = os.getenv("SEARCH_ID")
SUPABASE_URL = os.getenv("SUPABASE_URL").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY").strip()
MONGO_URL = os.getenv("MONGO_URL")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
genai_client = genai.Client(api_key=gen_key)

app = Flask(__name__)
CORS(app)

client = MongoClient(MONGO_URL)
db = client['routeOptimizer']

inputs_collection = db['inputs']
outputs_collection = db['outputs']

VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"

@app.route('/generate_location_hint', methods=['POST'])
def generate_location_hint():
    try:
        data = request.json
        location_name = data.get('location_name')
        previous_hint_id = data.get('previous_hint_id', None)
        user_response = data.get('user_response', None)
        reject_count = data.get('reject_count', 0)
        accept_count = data.get('accept_count', 0)

        # Final answer reached
        if previous_hint_id == "final":
            return jsonify({
                "hint": {
                    "id": "final",
                    "text": f"The answer is {location_name}.",
                    "type": "factual"
                },
                "is_final": True,
                "reject_count": reject_count,
                "accept_count": accept_count
            })
        
        if reject_count >= 3 or accept_count >= 3:
            return jsonify({
                "hint": {
                    "id": "final",
                    "text": f"The answer is {location_name}.",
                    "type": "factual"
                },
                "is_final": True,
                "reject_count": reject_count,
                "accept_count": accept_count
            })
        
        # Starting the quiz
        if previous_hint_id is None:
            hint_tree = generate_hint_tree_from_gemini(location_name)
            
            return jsonify({
                "hint": {
                    "id": "1",
                    "text": hint_tree["tree"]["1"]["text"],
                    "type": hint_tree["tree"]["1"]["type"]
                },
                "is_final": False,
                "reject_count": reject_count,
                "accept_count": accept_count
            })
        
        else:
            hint_tree = generate_hint_tree_from_gemini(location_name)
            
            next_hint_id = None
            if user_response == "understood":
                next_hint_id = hint_tree["tree"][previous_hint_id]["on_understood"]
            elif user_response == "confused":  # need to make hint easier
                next_hint_id = hint_tree["tree"][previous_hint_id]["on_confused"]
            
            if next_hint_id is None or reject_count >= 3 or accept_count >= 3:
                return jsonify({
                    "hint": {
                        "id": "final",
                        "text": f"The answer is {location_name}.",
                        "type": "factual"
                    },
                    "is_final": True,
                    "reject_count": reject_count,
                    "accept_count": accept_count
                })
            
            return jsonify({
                "hint": {
                    "id": next_hint_id,
                    "text": hint_tree["tree"][next_hint_id]["text"],
                    "type": hint_tree["tree"][next_hint_id]["type"]
                },
                "is_final": False,
                "reject_count": reject_count,
                "accept_count": accept_count
            })
    
    except Exception as e:
        print(f"Error generating location hint: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Error processing hint generation request"
        }), 500

def generate_fallback_hint_tree(location_name):
    # just in case gemini decides to fail us
    return {
        "place_id": location_name.lower().replace(' ', '_'),
        "tree": {
            "1": {
                "text": f"This is a popular destination to visit.",
                "type": "symbolic",
                "on_understood": "2A",
                "on_confused": "2B"
            },
            "2A": {
                "text": f"It's a famous landmark people often photograph.",
                "type": "symbolic",
                "on_understood": "3A",
                "on_confused": "2B"
            },
            "2B": {
                "text": f"It's a notable location in this area.",
                "type": "location",
                "on_understood": "3B",
                "on_confused": "3C"
            },
            "3A": {
                "text": f"It's an attraction that draws many tourists.",
                "type": "factual",
                "on_understood": "4A",
                "on_confused": "3C"
            },
            "3B": {
                "text": f"You can find it on most travel itineraries.",
                "type": "location",
                "on_understood": "4B",
                "on_confused": "3C"
            },
            "3C": {
                "text": f"It's a must-see destination in this region.",
                "type": "factual",
                "on_understood": "4C",
                "on_confused": "final"
            },
            "4A": {
                "text": f"It's known as one of the highlights of this area.",
                "type": "factual",
                "on_understood": "final",
                "on_confused": "final"
            },
            "4B": {
                "text": f"It appears on postcards and souvenirs from here.",
                "type": "location",
                "on_understood": "final",
                "on_confused": "final"
            },
            "4C": {
                "text": f"It's almost certainly {location_name}.",
                "type": "factual",
                "on_understood": "final",
                "on_confused": "final"
            }
        }
    }

def generate_hint_tree_from_gemini(location_name):
    try:
        prompt = f"""Generate hints for a location quiz about {location_name}. 
        Structure the response as a JSON object with the following format:
        {{
          "place_id": "{location_name.lower().replace(' ', '_')}",
          "tree": {{
            "1": {{
              "text": "[First hint - should be vague/symbolic]",
              "type": "symbolic",
              "on_understood": "2A",
              "on_confused": "2B"
            }},
            "2A": {{
              "text": "[Second level hint for those who recognized something from hint 1]",
              "type": "symbolic",
              "on_understood": "3A",
              "on_confused": "2B"
            }},
            "2B": {{
              "text": "[Second level hint for those who didn't recognize hint 1]",
              "type": "location",
              "on_understood": "3B",
              "on_confused": "3C"
            }},
            "3A": {{
              "text": "[More specific hint]",
              "type": "factual",
              "on_understood": "4A",
              "on_confused": "3C"
            }},
            "3B": {{
              "text": "[More specific location-based hint]",
              "type": "location",
              "on_understood": "4B",
              "on_confused": "3C"
            }},
            "3C": {{
              "text": "[More direct hint]",
              "type": "factual",
              "on_understood": "4C",
              "on_confused": "final"
            }},
            "4A": {{
              "text": "[Almost revealing hint]",
              "type": "factual",
              "on_understood": "final",
              "on_confused": "final"
            }},
            "4B": {{
              "text": "[Almost revealing location hint]",
              "type": "location",
              "on_understood": "final",
              "on_confused": "final"
            }},
            "4C": {{
              "text": "[Very obvious hint]",
              "type": "factual",
              "on_understood": "final",
              "on_confused": "final"
            }}
          }}
        }}
        Only return the JSON with no other text."""
        
        response = genai_client.models.generate_content(
            model='gemini-2.0-flash-001',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=1000,
            )
        )
        
        generated_text = response.text
        
        # sometimes gemini adds extra fluff around the JSON
        import re
        json_match = re.search(r'({.*})', generated_text, re.DOTALL)
        if json_match:
            generated_text = json_match.group(1)
        
        hint_tree = json.loads(generated_text)
        return hint_tree
        
    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")
        return generate_fallback_hint_tree(location_name)

@app.route('/get_inputs', methods=['GET'])
def get_inputs():
    try:
        inputs_data = inputs_collection.find()

        inputs_list = []
        for input_doc in inputs_data:
            input_doc['_id'] = str(input_doc['_id'])
            inputs_list.append(input_doc)

        return jsonify({"inputs": inputs_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/get_outputs', methods=['GET'])
def get_outputs():
    try:
        outputs_data = outputs_collection.find()

        # this formatting gets messy with nested structures
        outputs_list = []
        for output_doc in outputs_data:
            formatted_doc = {
                "_id": str(output_doc["_id"]),
                "input_id": str(output_doc.get("input_id", "")),
                "routes": [
                    {
                        "Cluster Description": route.get("Cluster Description", ""),
                        "Cluster ID": route.get("Cluster ID", 0),
                        "Cluster Name": route.get("Cluster Name", ""),
                        "Estimated Travel Distance (km)": route.get("Estimated Travel Distance (km)", 0),
                        "Estimated Travel Time (min)": route.get("Estimated Travel Time (min)", 0),
                        "Ratings": route.get("Ratings", 0),
                        "Popularity": route.get("Popularity", 0),
                        "Route": [
                            {
                                "Destination": sub_route.get("Destination", ""),
                                "Estimated Travel Distance (km)": sub_route.get("Estimated Travel Distance (km)", 0),
                                "Estimated Travel Time (min)": sub_route.get("Estimated Travel Time (min)", 0),
                                "Google Maps Link": sub_route.get("Google Maps Link", ""),
                                "Image URL": sub_route.get("Image URL", None),
                                "Mode of Transport": sub_route.get("Mode of Transport", ""),
                                "Name": sub_route.get("Name", "New Place"),
                                "Mystery Name": sub_route.get("Mystery Name", "Mystery Place"),
                                "Origin": sub_route.get("Origin", ""),
                            }
                            for sub_route in route.get("Route", [])
                        ],
                    }
                    for route in output_doc.get("routes", [])
                ],
            }
            outputs_list.append(formatted_doc)

        return jsonify({"outputs": outputs_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_data_from_parameters', methods=['POST'])
def get_data_from_parameters():
    parameters = request.json
    input_id = query_database(inputs_collection, parameters)

    if input_id:
        outputs = get_database_outputs(outputs_collection, input_id)
        return jsonify({"routes": outputs})
    else:
        return jsonify({"routes": "[]"})

optimizer = RouteOptimizer(api_key = api, gen_api = gen_key, class_url = class_url, class_key = class_key, search_id = search_id)

@app.route('/optimize_route', methods=['POST'])
def optimize_route():
    try:
        data = request.json

        address = data.get("address")
        keywords = data.get("keyword", [])
        radius = data.get("radius", 10)
        accessibility = data.get("accessibility", False)
        user_modes = data.get("modes", ["driving"])
        use_current_location = data.get("use_current_location", False)
        time_per_location = data.get("time_per_location", 0)
        time_limit = data.get("time_limit", 500)

        lati, long = optimizer.starting_point(use_current_location, address)
        if lati is None or long is None:
            return jsonify({"error": "Invalid address"}), 400

        # this can take a while depending on the API
        places_response = optimizer.nearby_places_multi_keyword(base_keywords=keywords, maxresult= 20, lat=lati, lon=long, radius=radius)
        final_places = optimizer.sorted_place_details(places_response, accessible=accessibility)

        optimized_routes = optimizer.optimize_routes(
            lat=lati,
            lng=long,
            places=final_places,
            time_limit=time_limit,
            max_groups= 5,
            visit_duration_per_location=time_per_location,
            user_modes=user_modes
        )

        return jsonify({"routes": json.loads(optimized_routes)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/check_user_location', methods=['POST'])
def check_user_location():
    try:
        data = request.json

        target_lat = data.get("target_lat")
        target_lon = data.get("target_lon")
        tolerance = data.get("tolerance", 0.01)  # roughly 1km

        if target_lat is None or target_lon is None:
            return jsonify({"error": "Target latitude and longitude are required"}), 400

        is_at_location = optimizer.is_user_at_location(target_lat, target_lon, tolerance)

        return jsonify({"is_at_location": is_at_location})

    except:
        return False   
    
def calculate_phash(image_base64_string):
    print("[DEBUG] calculate_phash: Received image_base64_string")
    try:
        image_data = base64.b64decode(image_base64_string)
        print("[DEBUG] calculate_phash: Image successfully decoded from base64.")
        image = Image.open(BytesIO(image_data))
        hash_val = imagehash.phash(image.convert('L'))  # greyscale works better for pHash
        print(f"[DEBUG] calculate_phash: pHash calculated: {str(hash_val)}")
        return str(hash_val)
    except Exception as e:
        print(f"[ERROR] calculate_phash: Error calculating pHash: {e}")
        return None

@app.route('/verify_location_image_supabase', methods=['POST'])
def verify_location_image_supabase():
    print("[DEBUG] /verify_location_image_supabase: Received request.")
    YOUR_TABLE_NAME = "checkpoints"

    if not supabase:
        print("[ERROR] /verify_location_image_supabase: Supabase client not initialized.")
        return jsonify({"error": "Supabase client not initialized.", "is_match": False, "confidence": 0.0}), 500

    try:
        data = request.json
        image_base64 = data.get('image')
        location_name = data.get('location_name')

        print(f"[DEBUG] /verify_location_image_supabase: Location Name: {location_name}")
        if not image_base64 or not location_name:
            print("[ERROR] /verify_location_image_supabase: Missing 'image' or 'location_name'.")
            return jsonify({"error": "Missing required parameters: image and location_name"}), 400

        uploaded_image_hash_str = calculate_phash(image_base64)
        if not uploaded_image_hash_str:
            print("[ERROR] /verify_location_image_supabase: Could not calculate pHash for uploaded image.")
            return jsonify({"error": "Failed to process uploaded image.", "is_match": False, "confidence": 0.0}), 500
        
        uploaded_phash = imagehash.hex_to_hash(uploaded_image_hash_str)
        print(f"[DEBUG] /verify_location_image_supabase: Uploaded image pHash: {uploaded_image_hash_str}")

        # trying fuzzy match first
        print(f"[DEBUG] /verify_location_image_supabase: Fetching reference hashes for '{location_name}' from table '{YOUR_TABLE_NAME}'")
        response = supabase.table(YOUR_TABLE_NAME).select('image_hash, image_path').ilike('location_name', f'%{location_name}%').execute()
        
        if not response.data:
            print(f"[WARN] /verify_location_image_supabase: No sample images found in Supabase for location containing '{location_name}'. Trying exact match.")
            response = supabase.table(YOUR_TABLE_NAME).select('image_hash, image_path').eq('location_name', location_name).execute()
            if not response.data:
                 print(f"[WARN] /verify_location_image_supabase: Still no sample images found for exact location_name '{location_name}'.")
                 return jsonify({
                    "error": f"No sample images found for location: {location_name}",
                    "is_match": False, "confidence": 0.0, "matching_info": []
                }), 404
        
        print(f"[DEBUG] /verify_location_image_supabase: Found {len(response.data)} reference image(s) for '{location_name}'.")

        min_distance = float('inf')
        best_match_info = None
        matching_samples_details = []
        hash_length = len(uploaded_image_hash_str) * 4 

        for sample in response.data:
            sample_hash_str = sample.get('image_hash')
            if not sample_hash_str:
                print(f"[WARN] /verify_location_image_supabase: Sample (ID potentially {sample.get('id', 'N/A')}) is missing 'image_hash' in DB.")
                continue
            
            print(f"[DEBUG] /verify_location_image_supabase: Comparing with DB sample hash: {sample_hash_str}")
            try:
                reference_phash = imagehash.hex_to_hash(sample_hash_str)
                distance = uploaded_phash - reference_phash
                print(f"[DEBUG] /verify_location_image_supabase: Hamming distance: {distance}")

                current_confidence = max(0.0, (hash_length - distance) / hash_length)
                sample_name = f"Reference for {location_name}"
                
                current_match_detail = {
                    "name": sample_name,
                    "score": current_confidence,
                    "distance": distance,
                    "reference_hash": sample_hash_str,
                    "image_url": sample.get('image_path')
                }
                matching_samples_details.append(current_match_detail)

                if distance < min_distance:
                    min_distance = distance
                    best_match_info = current_match_detail
            except Exception as e:
                print(f"[ERROR] /verify_location_image_supabase: Error comparing with hash '{sample_hash_str}': {e}")
                continue
        
        match_threshold = 45 
        is_match = min_distance <= match_threshold
        final_confidence = best_match_info['score'] if best_match_info else 0.0

        print(f"[INFO] /verify_location_image_supabase: Min distance: {min_distance}, Is Match: {is_match}, Confidence: {final_confidence}")
        matching_samples_details.sort(key=lambda x: x['score'], reverse=True)

        return jsonify({
            "is_match": is_match,
            "confidence": final_confidence,
            "matching_info": [best_match_info] if best_match_info and is_match else matching_samples_details[:1],
            "debug": {
                "location_searched": location_name,
                "uploaded_image_hash": uploaded_image_hash_str,
                "samples_found_count": len(response.data),
                "min_distance_found": min_distance if min_distance != float('inf') else "N/A",
                "match_threshold": match_threshold,
            }
        })
        
    except Exception as e:
        print(f"[FATAL ERROR] /verify_location_image_supabase: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({ "error": str(e), "message": "Error processing image verification request" }), 500

@app.route('/add_sample_image', methods=['POST'])
def add_sample_image():
    print("[DEBUG] /add_sample_image: Received request.")
    YOUR_TABLE_NAME = "checkpoints"

    if not supabase:
        print("[ERROR] /add_sample_image: Supabase client not initialized.")
        return jsonify({"error": "Supabase client not initialized."}), 500

    try:
        data = request.json
        location_name = data.get('location_name')
        image_base64 = data.get('image_data')
        # expecting the URL after uploading to supabase storage
        image_path_url = data.get('image_path')

        print(f"[DEBUG] /add_sample_image: Location: {location_name}, Image Path URL: {image_path_url}")

        if not location_name or not image_base64 or not image_path_url:
            print("[ERROR] /add_sample_image: Missing 'location_name', 'image_data' (for hash calc), or 'image_path' (URL).")
            return jsonify({"error": "Missing required parameters: location_name, image_data, and image_path"}), 400
        
        image_phash = calculate_phash(image_base64)
        if not image_phash:
            print("[ERROR] /add_sample_image: Could not calculate pHash for sample image.")
            return jsonify({"error": "Failed to process sample image for hashing."}), 500
        
        print(f"[DEBUG] /add_sample_image: Calculated pHash for sample: {image_phash}")

        insert_data = {
            'location_name': location_name.strip(),
            'image_hash': image_phash,
            'image_path': image_path_url,
        }
        print(f"[DEBUG] /add_sample_image: Inserting data into Supabase table '{YOUR_TABLE_NAME}': {insert_data}")
        
        response = supabase.table(YOUR_TABLE_NAME).insert(insert_data).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"[ERROR] /add_sample_image: Supabase insert error: {response.error}")
            return jsonify({ "success": False, "message": "Failed to add sample image.", "error_details": str(response.error) }), 500

        print(f"[INFO] /add_sample_image: Sample image added successfully. Response: {response.data}")
        return jsonify({ "success": True, "message": "Sample image details added successfully!", "data": response.data })
        
    except Exception as e:
        print(f"[FATAL ERROR] /add_sample_image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({ "error": str(e), "message": "Error adding sample image" }), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')