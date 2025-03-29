from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
from generator_code import RouteOptimizer  # Import your RouteOptimizer class

# Load API keys from .env
load_dotenv()
api = os.getenv("API_KEY")
class_url = os.getenv("CLASS_URL")
class_key = os.getenv("CLASS_KEY")
search_id = os.getenv("SEARCH_ID")

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize RouteOptimizer
optimizer = RouteOptimizer(api_key = api, class_url = class_url, class_key = class_key, search_id = search_id)
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
    app.run(debug=True)
