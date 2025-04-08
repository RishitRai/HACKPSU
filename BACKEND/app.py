from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
from generator_code import RouteOptimizer  # Import your RouteOptimizer class

# Load API keys from .env
load_dotenv()
api = os.getenv("API_KEY")
gen_key = os.getenv("GEN_API")
class_url = os.getenv("CLASS_URL")
class_key = os.getenv("CLASS_KEY")
search_id = os.getenv("SEARCH_ID")

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

client = MongoClient("mongodb+srv://drb6015:XlRnI99WeoVaYAyj@cluster0.2cs7k8r.mongodb.net/")
db = client['routeOptimizer']  # Replace with your database name

inputs_collection = db['inputs']  # Collection for inputs
outputs_collection = db['outputs']  # Collection for outputs

@app.route('/get_inputs', methods=['GET'])
def get_inputs():
    """
    API Endpoint to retrieve data from the 'inputs' collection.
    """
    try:
        # Query the 'inputs' collection
        inputs_data = inputs_collection.find()  # Fetch all documents

        # Format the data into a list
        inputs_list = []
        for input_doc in inputs_data:
            input_doc['_id'] = str(input_doc['_id'])  # Convert ObjectId to string for JSON compatibility
            inputs_list.append(input_doc)

        # Return the data as JSON response
        return jsonify({"inputs": inputs_list}), 200

    except Exception as e:
        # Handle errors
        return jsonify({"error": str(e)}), 500


@app.route('/get_outputs', methods=['GET'])
def get_outputs():
    """
    API Endpoint to retrieve data from the 'outputs' collection, handling nested objects and arrays.
    """
    try:
        # Query the 'outputs' collection
        outputs_data = outputs_collection.find()  # Fetch all documents

        # Process the data for readability
        outputs_list = []
        for output_doc in outputs_data:
            formatted_doc = {
                "_id": str(output_doc["_id"]),  # Convert MongoDB ObjectId to string
                "input_id": str(output_doc.get("input_id", "")),  # Convert input_id if present
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
                                "Name": sub_route.get("Name", ""),
                                "Origin": sub_route.get("Origin", ""),
                            }
                            for sub_route in route.get("Route", [])
                        ],
                    }
                    for route in output_doc.get("routes", [])
                ],
            }
            outputs_list.append(formatted_doc)

        # Return the processed data as JSON response
        return jsonify({"outputs": outputs_list}), 200

    except Exception as e:
        # Handle errors
        return jsonify({"error": str(e)}), 500



# Initialize RouteOptimizer
optimizer = RouteOptimizer(api_key = api, gen_api = gen_key, class_url = class_url, class_key = class_key, search_id = search_id)
@app.route('/optimize_route', methods=['POST'])
def optimize_route():
    """
    API endpoint to take frontend inputs and return optimized travel routes.
    """
    try:
        data = request.json  # Get JSON input from frontend

        # Extract parameters from frontend request
        address = data.get("address")
        keywords = data.get("keywords", [])
        radius = data.get("radius", 30000)
        accessibility = data.get("accessibility", False)
        user_modes = data.get("modes", ["driving"])
        use_current_location = data.get("use_current_location", False)
        time_per_location = data.get("time_per_location", 0)
        time_limit = data.get("time_limit", 500)

        # Extract Latitude & Longitude
        lati, long = optimizer.starting_point(use_current_location, address)
        if lati is None or long is None:
            return jsonify({"error": "Invalid address"}), 400

        # Fetch nearby places
        places_response = optimizer.nearby_places_multi_keyword(base_keywords=keywords, maxresult= 20, lat=lati, lon=long, radius=radius)
        final_places = optimizer.sorted_place_details(places_response, accessible=accessibility)

        # Optimize routes
        optimized_routes = optimizer.optimize_routes(
            lat=lati,
            lng=long,
            places=final_places,
            time_limit=time_limit,
            max_groups= 5,
            visit_duration_per_location=time_per_location,
            user_modes=user_modes
        )

        return jsonify({"routes": json.loads(optimized_routes)})  # Send response to frontend

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/check_user_location', methods=['POST'])
def check_user_location():
    """
    API endpoint to check if the user is at a specific location.
    """
    try:
        data = request.json  # Get JSON input from frontend

        # Extract target location and tolerance from the request
        target_lat = data.get("target_lat")
        target_lon = data.get("target_lon")
        tolerance = data.get("tolerance", 0.01)  # Default tolerance is 0.01 degrees (~1.1 km)

        if target_lat is None or target_lon is None:
            return jsonify({"error": "Target latitude and longitude are required"}), 400

        # Call the function to check if the user is at the location
        is_at_location = optimizer.is_user_at_location(target_lat, target_lon, tolerance)

        return jsonify({"is_at_location": is_at_location})  # Return the result to the frontend

    except Exception as e:
        return jsonify({"error": str(e)}), 500    


# Run Flask App
if __name__ == "__main__":
    app.run(debug=True, host = '100.64.7.174')
    #app.run(debug=True)
