# Retrieves the input ID based on the parameters
def query_database(inputs_collection, parameters):
    query = {
        "address": parameters["address"],
        "keywords": {"$all": parameters["keyword"]},
        "radius": parameters["radius"],
        "accessibility": parameters["accessibility"],
        "modes": {"$all": parameters["modes"]},
        "use_current_location": parameters["use_current_location"],
        "time_per_location": parameters["time_per_location"],
        "time_limit": parameters["time_limit"]
    }
    
    #print("Query sent to MongoDB:", query)  # Debugging log

    result = inputs_collection.find_one(query)

    if result:
        input_id = result["_id"]  # Return the input ID
        return input_id
    else:
        return None

# Retrieves outputs corresponding to the input ID
def get_database_outputs(outputs_collection, input_id):
    #print("Fetching outputs for input ID:", input_id)  # Debugging log

    # Get the outputs based on the input ID
    outputs_data = outputs_collection.find({"input_id": input_id})

    formatted_outputs = []
    for output_doc in outputs_data:  # Iterate through the documents in the cursor
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
        formatted_outputs.append(formatted_doc)

    if not formatted_outputs:
        #print("No outputs found for the given input ID.")
        return []

    return formatted_outputs