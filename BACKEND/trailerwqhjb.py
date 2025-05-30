

from pymongo import MongoClient
from bson import ObjectId

# Connect to MongoDB
client = MongoClient("mongodb+srv://drb6015:XlRnI99WeoVaYAyj@cluster0.2cs7k8r.mongodb.net/")
db = client["routeOptimizer"]  # Replace with your database name
inputs_collection = db['inputs']  # Collection for inputs
outputs_collection = db['outputs']  # Collection for outputs

# Retrieves the input ID based on the parameters
def query_database(parameters):
    query = {
        "address": parameters["address"],
        "keywords": {"$all": parameters["keywords"]},
        "radius": parameters["radius"],
        "accessibility": parameters["accessibility"],
        "modes": {"$all": parameters["modes"]},
        "use_current_location": parameters["use_current_location"],
        "time_per_location": parameters["time_per_location"],
        "time_limit": parameters["time_limit"]
    }
        # print("Query sent to MongoDB:", query)

    result = inputs_collection.find_one(query)

    if result:
        input_id = result["_id"]
        return input_id
    else:
        return None

# Retrieves outputs corresponding to the input ID
def get_outputs(input_id):
    # print("Input ID Checking:", input_id)
    
    # Get the outputs based on the input ID
    outputs_data = list(outputs_collection.find({"input_id": input_id}))

    formatted_doc = {
        "_id": str(outputs_data["_id"]),  # Convert MongoDB ObjectId to string
        "input_id": str(outputs_data.get("input_id", "")),  # Convert input_id if present
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
            for route in outputs_data.get("routes", [])
        ],
    }

    return formatted_doc

# Test input (parameters)
test_input = {
    "address": "164 E 87th St, New York, NY",
    "keywords": ["shopping"],
    "radius": 3000,
    "accessibility": True,
    "modes": ["walking"],
    "use_current_location": False,
    "time_per_location": 0,
    "time_limit": 300
}


input_id = query_database(test_input) # Query the database to retrieve input ID

if input_id:
    outputs = get_outputs(input_id) # Retrieve outputs associated with the input ID
else:
    print("No associated outputs found.")