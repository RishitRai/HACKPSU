def query_database(inputs_collection, parameters):
    query = {
        "address": parameters["address"],
        "radius": parameters["radius"],
        "accessibility": parameters["accessibility"],
        "use_current_location": parameters["use_current_location"],
        "time_per_location": parameters["time_per_location"],
        "time_limit": parameters["time_limit"]
    }
    
    # arrays need special handling or mongo gets confused
    if parameters.get("keyword") and len(parameters["keyword"]) > 0:
        query["keywords"] = {"$all": parameters["keyword"]}
    else:
        query["keywords"] = {"$in": [[], None]}
    
    if parameters.get("modes") and len(parameters["modes"]) > 0:
        query["modes"] = {"$all": parameters["modes"]}
    else:
        query["modes"] = {"$in": [[], None]}
    
    print("Query sent to MongoDB:", query)

    try:
        result = inputs_collection.find_one(query)
        
        if result:
            input_id = result["_id"]
            print(f"Found matching input with ID: {input_id}")
            return input_id
        else:
            print("No matching input found in database")
            return None
            
    except Exception as e:
        print(f"Error querying database: {str(e)}")
        return None

def get_database_outputs(outputs_collection, input_id):
    print("Fetching outputs for input ID:", input_id)

    try:
        outputs_data = outputs_collection.find({"input_id": input_id})

        formatted_outputs = []
        # this nested structure is a pain to format
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
                                "Name": sub_route.get("Name", ""),
                                "Mystery Name": sub_route.get("Mystery Name", "Mystery Place"),  # fallback name
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
        return[]