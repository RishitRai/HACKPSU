# Retrieves the input ID based on the parameters
def query_database(inputs_collection, parameters):
    # Build query dynamically to handle empty arrays
    query = {
        "address": parameters["address"],
        "radius": parameters["radius"],
        "accessibility": parameters["accessibility"],
        "use_current_location": parameters["use_current_location"],
        "time_per_location": parameters["time_per_location"],
        "time_limit": parameters["time_limit"]
    }
    
    # Only add array fields if they're not empty
    if parameters.get("keyword") and len(parameters["keyword"]) > 0:
        query["keywords"] = {"$all": parameters["keyword"]}
    else:
        # If keywords is empty, match documents where keywords field is empty or doesn't exist
        query["keywords"] = {"$in": [[], None]}
    
    if parameters.get("modes") and len(parameters["modes"]) > 0:
        query["modes"] = {"$all": parameters["modes"]}
    else:
        # If modes is empty, match documents where modes field is empty or doesn't exist
        query["modes"] = {"$in": [[], None]}
    
    print("Query sent to MongoDB:", query)  # Debugging log

    try:
        result = inputs_collection.find_one(query)
        
        if result:
            input_id = result["_id"]  # Return the input ID
            print(f"Found matching input with ID: {input_id}")
            return input_id
        else:
            print("No matching input found in database")
            return None
            
    except Exception as e:
        print(f"Error querying database: {str(e)}")
        return None

# Retrieves outputs corresponding to the input ID
def get_database_outputs(outputs_collection, input_id):
    print("Fetching outputs for input ID:", input_id)  # Debugging log

    try:
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
                                "Mystery Name": sub_route.get("Mystery Name", "Mystery Place"),
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
            print("No outputs found for the given input ID.")
            return []

        print(f"Found {len(formatted_outputs)} output documents")
        return formatted_outputs
        
    except Exception as e:
        print(f"Error fetching outputs from database: {str(e)}")
        return []