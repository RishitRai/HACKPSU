from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
import os
import json
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types
from generator_code import RouteOptimizer  # Import your RouteOptimizer class
from utils import query_database, get_database_outputs
import base64
import requests
from io import BytesIO
from PIL import Image
import imagehash
from supabase import create_client
from supabase import create_client

# Load API keys from .env
load_dotenv()
api = os.getenv("API_KEY")
gen_key = os.getenv("GEN_API")
class_url = os.getenv("CLASS_URL")
class_key = os.getenv("CLASS_KEY")
search_id = os.getenv("SEARCH_ID")
SUPABASE_URL = os.getenv("SUPABASE_URL").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY").strip()

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
genai_client = genai.Client(api_key=gen_key)

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

client = MongoClient("mongodb+srv://drb6015:XlRnI99WeoVaYAyj@cluster0.2cs7k8r.mongodb.net/")
db = client['routeOptimizer']  # Replace with your database name

inputs_collection = db['inputs']  # Collection for inputs
outputs_collection = db['outputs']  # Collection for outputs


# Vision API configuration
VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"

@app.route('/verify_location_image', methods=['POST'])
def verify_location_image():
    """
    API endpoint to verify a location based on image.
    Takes an image and compares it with the expected location attributes.
    """
    try:
        data = request.json
        image_base64 = data.get('image')
        location_name = data.get('location_name')
        location_lat = data.get('location_lat')
        location_lng = data.get('location_lng')
        
        if not image_base64 or not location_name:
            return jsonify({"error": "Missing required parameters"}), 400
        
        # Prepare the Vision API request for both label and landmark detection
        vision_request = {
            "requests": [
                {
                    "image": {
                        "content": image_base64  # The API accepts base64 directly
                    },
                    "features": [
                        {"type": "LABEL_DETECTION", "maxResults": 10},
                        {"type": "LANDMARK_DETECTION", "maxResults": 5}
                    ]
                }
            ]
        }
        
        # Send request to Vision API
        response = requests.post(
            f"{VISION_API_URL}?key={api}",
            json=vision_request
        )
        
        if response.status_code != 200:
            print(f"Vision API error: {response.text}")
            return jsonify({
                "error": "Vision API request failed",
                "status_code": response.status_code
            }), 500
        
        # Process the API response
        vision_data = response.json()
        
        # Extract label annotations
        labels = []
        if 'labelAnnotations' in vision_data['responses'][0]:
            labels = vision_data['responses'][0]['labelAnnotations']
        
        # Extract landmark annotations
        landmarks = []
        if 'landmarkAnnotations' in vision_data['responses'][0]:
            landmarks = vision_data['responses'][0]['landmarkAnnotations']
        
        # Check if any landmarks are found
        landmark_match = False
        for landmark in landmarks:
            # Check if landmark name matches or is similar to expected location
            if location_name.lower() in landmark['description'].lower():
                landmark_match = True
                break
        
        # Check if relevant labels are present that match the location type
        relevant_labels = []
        relevant_labels = []
        location_keywords = location_name.lower().split()
        
        for label in labels:
            if any(keyword in label['description'].lower() for keyword in location_keywords):
                relevant_labels.append(label['description'])
        
        # For demo purposes, we'll consider it a match if:
        # 1. A landmark is explicitly recognized, OR
        # 2. At least 1 relevant labels match the location name
        is_match = landmark_match or len(relevant_labels) >= 1

        print(f"Final verification result: {'MATCH' if is_match else 'NO MATCH'}")
        print(f"Match criteria: landmark_match={landmark_match}, relevant_labels={len(relevant_labels)}")
        
        return jsonify({
            "is_match": is_match,
            "landmark_detected": landmark_match,
            "relevant_labels": relevant_labels,
            "confidence": 0.85 if is_match else 0.4,
            "debug": {
                "total_labels_detected": len(labels),
                "total_landmarks_detected": len(landmarks)
            }
        })
        
    except Exception as e:
        print(f"Error in image verification: {e}")
        return jsonify({
            "error": str(e),
            "message": "Error processing image verification request"
        }), 500
    





# Add this function to your Flask app (paste-2.txt)

@app.route('/generate_location_hint', methods=['POST'])
def generate_location_hint():
    """
    API endpoint to generate hints for a location quiz using Gemini API.
    Takes a location name, previous hint ID (if any), and user's response (understood/confused)
    Returns the next appropriate hint from a hierarchical tree structure.
    """
    try:
        data = request.json
        location_name = data.get('location_name')
        previous_hint_id = data.get('previous_hint_id', None)
        user_response = data.get('user_response', None)  # "understood" or "confused"
        reject_count = data.get('reject_count', 0)
        accept_count = data.get('accept_count', 0)

        # Handle the case when previous_hint_id is "final"
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
        
        # Check if we've reached the maximum number of accepts/rejects
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
        
        # If this is the first hint request or no previous hint
        if previous_hint_id is None:
            # Generate initial hint tree from Gemini
            hint_tree = generate_hint_tree_from_gemini(location_name)
            
            # Return the first hint (root of the tree)
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
        
        # If we have a previous hint, determine the next hint based on user response
        else:
            # Get the entire hint tree first
            hint_tree = generate_hint_tree_from_gemini(location_name)
            
            # Find the next hint ID based on previous hint and user response
            next_hint_id = None
            if user_response == "understood":
                next_hint_id = hint_tree["tree"][previous_hint_id]["on_understood"]
            elif user_response == "confused":
                next_hint_id = hint_tree["tree"][previous_hint_id]["on_confused"]
            
            # If there's no next hint or we've reached the limit, return final answer
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
            
            # Otherwise, return the next hint
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

def generate_hint_tree_from_gemini(location_name):
    """
    Uses Gemini API to generate a structured hint tree for a location.
    """
    try:
        # Construct the prompt for Gemini
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
        
        # Call Gemini API using the client library
        response = genai_client.models.generate_content(
            model='gemini-2.0-flash-001',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=1000,
            )
        )
        
        # Extract generated text from response
        generated_text = response.text
        
        # Extract just the JSON part if there's any extra text
        import re
        json_match = re.search(r'({.*})', generated_text, re.DOTALL)
        if json_match:
            generated_text = json_match.group(1)
        
        # Parse the JSON
        hint_tree = json.loads(generated_text)
        return hint_tree
        
    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")
        return generate_fallback_hint_tree(location_name)

def generate_fallback_hint_tree(location_name):
    """
    Generate a fallback hint tree if the Gemini API fails.
    """
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

# @app.route('/get_data_by_parameters', methods=['POST'])
# def get_data_by_parameters():
#     try:
#         # Parse JSON parameters from the client
#         parameters = request.json
#         print("Received parameters:", parameters)

#         # Step 1: Query the database for the input ID
#         input_id = query_database(inputs_collection, parameters)

#         if input_id:
#             # Step 2: Fetch the associated outputs
#             outputs = get_outputs(outputs_collection, input_id)
#             return jsonify({"data": outputs}), 200
#         else:
#             # No matching input found in the database
#             return jsonify({"error": "No matching input found"}), 404
#     except Exception as e:
#         print("Error processing request:", e)
#         return jsonify({"error": str(e)}), 500


@app.route('/get_data_from_parameters', methods=['POST'])
def get_data_from_parameters():
    # Get JSON input from the client
    parameters = request.json
    #print("Received parameters:", parameters)
    input_id = query_database(inputs_collection, parameters)

    if input_id:
        outputs = get_database_outputs(outputs_collection, input_id)
        return jsonify({"routes": outputs})
    else:
        return jsonify({"routes": "[]"})




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
        keywords = data.get("keyword", [])
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

    except:
        return False   
    
def calculate_phash(image_base64_string):
    # ... (implementation from previous response)
    print("[DEBUG] calculate_phash: Received image_base64_string")
    try:
        image_data = base64.b64decode(image_base64_string)
        print("[DEBUG] calculate_phash: Image successfully decoded from base64.")
        image = Image.open(BytesIO(image_data))
        hash_val = imagehash.phash(image.convert('L')) # pHash works well on greyscale
        print(f"[DEBUG] calculate_phash: pHash calculated: {str(hash_val)}")
        return str(hash_val)
    except Exception as e:
        print(f"[ERROR] calculate_phash: Error calculating pHash: {e}")
        return None

# --- Modified Supabase Image Verification Endpoint ---
@app.route('/verify_location_image_supabase', methods=['POST'])
def verify_location_image_supabase():
    print("[DEBUG] /verify_location_image_supabase: Received request.")
    YOUR_TABLE_NAME = "checkpoints" # <--- CHANGE THIS TO YOUR ACTUAL TABLE NAME

    if not supabase:
        print("[ERROR] /verify_location_image_supabase: Supabase client not initialized.")
        return jsonify({"error": "Supabase client not initialized.", "is_match": False, "confidence": 0.0}), 500

    try:
        data = request.json
        image_base64 = data.get('image')
        location_name = data.get('location_name')

        print(f"[DEBUG] /verify_location_image_supabase: Location Name: {location_name}")
        if not image_base64 or not location_name:
            # ... (error handling)
            print("[ERROR] /verify_location_image_supabase: Missing 'image' or 'location_name'.")
            return jsonify({"error": "Missing required parameters: image and location_name"}), 400

        uploaded_image_hash_str = calculate_phash(image_base64)
        if not uploaded_image_hash_str:
            # ... (error handling)
            print("[ERROR] /verify_location_image_supabase: Could not calculate pHash for uploaded image.")
            return jsonify({"error": "Failed to process uploaded image.", "is_match": False, "confidence": 0.0}), 500
        
        uploaded_phash = imagehash.hex_to_hash(uploaded_image_hash_str)
        print(f"[DEBUG] /verify_location_image_supabase: Uploaded image pHash: {uploaded_image_hash_str}")

        # Fetch reference image hashes from Supabase
        # Assuming you added 'image_hash' column and use 'image_path' for URL
        print(f"[DEBUG] /verify_location_image_supabase: Fetching reference hashes for '{location_name}' from table '{YOUR_TABLE_NAME}'")
        # Select 'image_hash' and 'image_path' (and 'description' if you add it)
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
            sample_hash_str = sample.get('image_hash') # Essential: Get the stored hash
            if not sample_hash_str:
                print(f"[WARN] /verify_location_image_supabase: Sample (ID potentially {sample.get('id', 'N/A')}) is missing 'image_hash' in DB.")
                continue
            
            print(f"[DEBUG] /verify_location_image_supabase: Comparing with DB sample hash: {sample_hash_str}")
            try:
                reference_phash = imagehash.hex_to_hash(sample_hash_str)
                distance = uploaded_phash - reference_phash
                print(f"[DEBUG] /verify_location_image_supabase: Hamming distance: {distance}")

                current_confidence = max(0.0, (hash_length - distance) / hash_length)
                # Use image_path for the URL, and a generic name if no description column
                sample_name = f"Reference for {location_name}" # Or sample.get('description') if you add that column
                
                current_match_detail = {
                    "name": sample_name,
                    "score": current_confidence,
                    "distance": distance,
                    "reference_hash": sample_hash_str,
                    "image_url": sample.get('image_path') # Use image_path
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
            # ... (debug info as before)
            "debug": {
                "location_searched": location_name,
                "uploaded_image_hash": uploaded_image_hash_str,
                "samples_found_count": len(response.data),
                "min_distance_found": min_distance if min_distance != float('inf') else "N/A",
                "match_threshold": match_threshold,
            }
        })
        
    except Exception as e:
        # ... (error handling as before)
        print(f"[FATAL ERROR] /verify_location_image_supabase: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({ "error": str(e), "message": "Error processing image verification request" }), 500

# --- Endpoint to add sample images (modified for 'image_path' and 'image_hash') ---
@app.route('/add_sample_image', methods=['POST'])
def add_sample_image():
    print("[DEBUG] /add_sample_image: Received request.")
    YOUR_TABLE_NAME = "checkpoints" # <--- CHANGE THIS TO YOUR ACTUAL TABLE NAME

    if not supabase:
        print("[ERROR] /add_sample_image: Supabase client not initialized.")
        return jsonify({"error": "Supabase client not initialized."}), 500

    try:
        data = request.json
        location_name = data.get('location_name')
        image_base64 = data.get('image_data')  # Base64 of the image to calculate hash
        # This image_path would be the public URL obtained AFTER uploading the image to Supabase Storage bucket.
        # Your frontend or another process should handle uploading to Storage and then provide this URL.
        image_path_url = data.get('image_path') # Expecting the public URL from Supabase Storage

        print(f"[DEBUG] /add_sample_image: Location: {location_name}, Image Path URL: {image_path_url}")

        if not location_name or not image_base64 or not image_path_url:
            print("[ERROR] /add_sample_image: Missing 'location_name', 'image_data' (for hash calc), or 'image_path' (URL).")
            return jsonify({"error": "Missing required parameters: location_name, image_data, and image_path"}), 400
        
        image_phash = calculate_phash(image_base64)
        if not image_phash:
            # ... (error handling)
            print("[ERROR] /add_sample_image: Could not calculate pHash for sample image.")
            return jsonify({"error": "Failed to process sample image for hashing."}), 500
        
        print(f"[DEBUG] /add_sample_image: Calculated pHash for sample: {image_phash}")

        insert_data = {
            'location_name': location_name.strip(),
            'image_hash': image_phash,         # Store the calculated hash
            'image_path': image_path_url,      # Store the public URL to the image in Storage
            # 'description': data.get('description', '') # Uncomment if you add a description column
        }
        print(f"[DEBUG] /add_sample_image: Inserting data into Supabase table '{YOUR_TABLE_NAME}': {insert_data}")
        
        response = supabase.table(YOUR_TABLE_NAME).insert(insert_data).execute()
        
        if hasattr(response, 'error') and response.error:
            # ... (error handling)
            print(f"[ERROR] /add_sample_image: Supabase insert error: {response.error}")
            return jsonify({ "success": False, "message": "Failed to add sample image.", "error_details": str(response.error) }), 500

        print(f"[INFO] /add_sample_image: Sample image added successfully. Response: {response.data}")
        return jsonify({ "success": True, "message": "Sample image details added successfully!", "data": response.data })
        
    except Exception as e:
        # ... (error handling as before)
        print(f"[FATAL ERROR] /add_sample_image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({ "error": str(e), "message": "Error adding sample image" }), 500



# Run Flask App
if __name__ == "__main__":
    app.run(debug=True, host = '0.0.0.0')
    #app.run(debug=True)