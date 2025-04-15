"""from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb+srv://drb6015:XlRnI99WeoVaYAyj@cluster0.2cs7k8r.mongodb.net/")
db = client['routeOptimizer']

# Define Inputs Collection
inputs_collection = db['inputs']

# Sample Input Document
input_data = {
    "address": "164 E 87th St, New York, NY",
    "keywords": ["food", "shopping"],
    "radius": 3000,
    "accessibility": True,
    "modes": ["walking"],
    "use_current_location": False,
    "time_per_location": 0,
    "time_limit": 300
}

input_id = inputs_collection.insert_one(input_data).inserted_id
print(f"Input Document ID: {input_id}")
outputs_collection = db['outputs']

# Sample Output Document
output_data = {
    "input_id": input_id,
    "routes": [
        {
            "Cluster Description": "Where history whispers and innovation roars, find a tapestry woven with threads of the past and vibrant hues of the future. This corner of the world pulses with an energy that ignites creativity and fosters connection. Explore hidden gems where culinary artistry tantalizes your senses and artistic expression knows no bounds. Let the spirit of adventure guide you through cobblestone streets and sun-drenched plazas, each revealing a unique story. Discover a destination where memories are made and dreams take flight.",
            "Cluster ID": 1,
            "Cluster Name": "Nexus Point",
            "Estimated Travel Distance (km)": 5.8,
            "Estimated Travel Time (min)": 37.2,
            "Route": [
                {
                    "Destination": "40.7604228,-73.9760834",
                    "Estimated Travel Distance (km)": 3.3,
                    "Estimated Travel Time (min)": 14.1,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7797404,-73.9545392/40.7604228,-73.9760834/?travelmode=walking",
                    "Image URL": None,
                    "Mode of Transport": "walking",
                    "Name": "UNIQLO 5th Avenue",
                    "Origin": "40.7797404,-73.9545392"
                },
                {
                    "Destination": "40.7597394,-73.9768133",
                    "Estimated Travel Distance (km)": 1.2,
                    "Estimated Travel Time (min)": 9.3,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7604228,-73.9760834/40.7597394,-73.9768133/?travelmode=walking",
                    "Image URL": "https://news.google.com/api/attachments/CC8iK0NnNUJVbTgwUjFwMGRXcHNZM1JQVFJEVkFSakFBaWdLTWdhRlE0YXdKUWc=-w350-h175-p-df-rw",
                    "Mode of Transport": "walking",
                    "Name": "Nike House of Innovation NYC",
                    "Origin": "40.7604228,-73.9760834"
                },
                {
                    "Destination": "40.760055799999996,-73.976351",
                    "Estimated Travel Distance (km)": 0.5,
                    "Estimated Travel Time (min)": 5.2,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7597394,-73.9768133/40.760055799999996,-73.976351/?travelmode=walking",
                    "Image URL": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGqGZUiVNrkT9p7FkIzNjA-Ao01LTHlTq4xFyQbJSDHPRXRKczzfwStgpZAlU",
                    "Mode of Transport": "walking",
                    "Name": "ZARA",
                    "Origin": "40.7597394,-73.9768133"
                },
                {
                    "Destination": "40.759437899999995,-73.976776",
                    "Estimated Travel Distance (km)": 0.1,
                    "Estimated Travel Time (min)": 1.1,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.760055799999996,-73.976351/40.759437899999995,-73.976776/?travelmode=walking",
                    "Image URL": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcS8jr6rXA_LI43YNHCDvquPd0m0DmHxh4AyGCJms24gErjDa_nyseOiUEafhI0",
                    "Mode of Transport": "walking",
                    "Name": "Victoria's Secret & PINK by Victoria's Secret",
                    "Origin": "40.760055799999996,-73.976351"
                },
                {
                    "Destination": "40.7602799,-73.97621199999999",
                    "Estimated Travel Distance (km)": 0.7,
                    "Estimated Travel Time (min)": 6.8,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.759437899999995,-73.976776/40.7602799,-73.97621199999999/?travelmode=walking",
                    "Image URL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR7g3eg2KhGDooDjY3-oXn3Gto7dUqLr1X-7wZME5_94fGoIBqFS0r0d9HEp4s",
                    "Mode of Transport": "walking",
                    "Name": "Abercrombie & Fitch",
                    "Origin": "40.759437899999995,-73.976776"
                },
                {
                    "Destination": "40.7595534,-73.9760409",
                    "Estimated Travel Distance (km)": 0.1,
                    "Estimated Travel Time (min)": 0.8,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7602799,-73.97621199999999/40.7595534,-73.9760409/?travelmode=walking",
                    "Image URL": None,
                    "Mode of Transport": "walking",
                    "Name": "Cartier Fifth Avenue Mansion",
                    "Origin": "40.7602799,-73.97621199999999"
                }
            ],
            "Total Estimated Time (min)": 37.2
        },
        {
            "Cluster Description": "Step into a realm where history whispers and innovation roars. This collection of destinations offers a symphony of experiences, from ancient echoes to modern marvels. Discover hidden gems nestled beside iconic landmarks, each telling a unique story. Let your curiosity guide you through vibrant streets and tranquil corners, where the past and future intertwine. Prepare to be captivated by the unexpected beauty and boundless adventures that await.",
            "Cluster ID": 4,
            "Cluster Name": "Nexus Point",
            "Estimated Travel Distance (km)": 6.3,
            "Estimated Travel Time (min)": 24.1,
            "Route": [
                {
                    "Destination": "40.762268,-73.967247",
                    "Estimated Travel Distance (km)": 2.8,
                    "Estimated Travel Time (min)": 10.2,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7797404,-73.9545392/40.762268,-73.967247/?travelmode=walking",
                    "Image URL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSrctTLc4er6JONQ11LgMACqXO1rstmTgG8Tsdy1-ptamOo7P0kPIJkCADLXnM",
                    "Mode of Transport": "walking",
                    "Name": "Bloomingdale's",
                    "Origin": "40.7797404,-73.9545392"
                },
                {
                    "Destination": "40.768116,-73.96144919999999",
                    "Estimated Travel Distance (km)": 1.3,
                    "Estimated Travel Time (min)": 5.0,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.762268,-73.967247/40.768116,-73.96144919999999/?travelmode=walking",
                    "Image URL": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR5NlF3sKsQTlDyNdPgEL0NcJSJPYDcMbjL_msO1McBjpbZeKLBEdT4xzMZ4bk",
                    "Mode of Transport": "walking",
                    "Name": "Target",
                    "Origin": "40.762268,-73.967247"
                },
                {
                    "Destination": "40.7613523,-73.9696701",
                    "Estimated Travel Distance (km)": 1.4,
                    "Estimated Travel Time (min)": 5.3,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.768116,-73.96144919999999/40.7613523,-73.9696701/?travelmode=walking",
                    "Image URL": None,
                    "Mode of Transport": "walking",
                    "Name": "Saks OFF 5TH",
                    "Origin": "40.768116,-73.96144919999999"
                },
                {
                    "Destination": "40.7660188,-73.96995249999999",
                    "Estimated Travel Distance (km)": 0.7,
                    "Estimated Travel Time (min)": 3.5,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7613523,-73.9696701/40.7660188,-73.96995249999999/?travelmode=walking",
                    "Image URL": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/59/79/bd/5979bd34-b7eb-e4e5-673f-7001de236d10/logo_gmail_2020q4_color-0-1x_U007emarketing-0-0-0-6-0-0-0-0-85-220-0.png/1200x600wa.png",
                    "Mode of Transport": "walking",
                    "Name": "Hermès",
                    "Origin": "40.7613523,-73.9696701"
                }
            ],
            "Total Estimated Time (min)": 24.1
        },
        {
            "Cluster Description": "Nestled where the river whispers secrets to ancient stones, this is a tapestry woven with history, art, and vibrant life. Cobblestone streets lead to sun-drenched plazas, each echoing tales of bygone eras. The air hums with creativity, from artisan workshops to galleries brimming with masterpieces. Indulge in flavors both familiar and exotic, a culinary journey for every palate. Discover a place where time slows down, inviting you to savor every moment and create memories that linger long after you'",
            "Cluster ID": 0,
            "Cluster Name": "Nexus Point",
            "Estimated Travel Distance (km)": 4.5,
            "Estimated Travel Time (min)": 21.0,
            "Route": [
                {
                    "Destination": "40.766245000000005,-73.981246",
                    "Estimated Travel Distance (km)": 3.7,
                    "Estimated Travel Time (min)": 16.8,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7797404,-73.9545392/40.766245000000005,-73.981246/?travelmode=walking",
                    "Image URL": None,
                    "Mode of Transport": "walking",
                    "Name": "Nordstrom NYC Flagship",
                    "Origin": "40.7797404,-73.9545392"
                },
                {
                    "Destination": "40.7702294,-73.9824884",
                    "Estimated Travel Distance (km)": 0.8,
                    "Estimated Travel Time (min)": 4.3,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.766245000000005,-73.981246/40.7702294,-73.9824884/?travelmode=walking",
                    "Image URL": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR5NlF3sKsQTlDyNdPgEL0NcJSJPYDcMbjL_msO1McBjpbZeKLBEdT4xzMZ4bk",
                    "Mode of Transport": "walking",
                    "Name": "Target",
                    "Origin": "40.766245000000005,-73.981246"
                }
            ],
            "Total Estimated Time (min)": 21.0
        },
        {
            "Cluster Description": "Where history whispers and innovation roars, discover a tapestry of experiences woven together. From cobblestone streets echoing with tales of yore to gleaming skyscrapers piercing the clouds, a captivating contrast awaits. Indulge in culinary delights that tantalize every taste bud, a symphony of flavors dancing on your palate. Explore vibrant arts scenes that ignite the imagination, fueling creativity and inspiring wonder. This is a destination where memories are made, adventures unfold, and the spirit of discovery thrives.",
            "Cluster ID": 3,
            "Cluster Name": "Nexus Point",
            "Estimated Travel Distance (km)": 3.6,
            "Estimated Travel Time (min)": 17.4,
            "Route": [
                {
                    "Destination": "40.7634824,-73.9740152",
                    "Estimated Travel Distance (km)": 2.9,
                    "Estimated Travel Time (min)": 12.0,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7797404,-73.9545392/40.7634824,-73.9740152/?travelmode=walking",
                    "Image URL": None,
                    "Mode of Transport": "walking",
                    "Name": "Bergdorf Goodman",
                    "Origin": "40.7797404,-73.9545392"
                },
                {
                    "Destination": "40.761703,-73.97433319999999",
                    "Estimated Travel Distance (km)": 0.6,
                    "Estimated Travel Time (min)": 5.5,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7634824,-73.9740152/40.761703,-73.97433319999999/?travelmode=walking",
                    "Image URL": "https://www.google.com/logos/doodles/2023/celebrating-the-big-mango-6753651837110047-2x.png",
                    "Mode of Transport": "walking",
                    "Name": "MANGO",
                    "Origin": "40.7634824,-73.9740152"
                }
            ],
            "Total Estimated Time (min)": 17.4
        },
        {
            "Cluster Description": "Where history whispers on cobblestone streets and innovation sparks in modern studios. This vibrant nexus pulses with artistic energy, culinary delights, and a spirit of boundless discovery. From landmark architecture to hidden gem boutiques, every corner tells a unique story. It's a place where the past and future collide, creating an unforgettable tapestry of experiences. Prepare to be captivated by its charm and invigorated by its dynamism.",
            "Cluster ID": 2,
            "Cluster Name": "Apex Collective",
            "Estimated Travel Distance (km)": 9.2,
            "Estimated Travel Time (min)": 29.7,
            "Route": [
                {
                    "Destination": "40.7803915,-73.9770625",
                    "Estimated Travel Distance (km)": 2.7,
                    "Estimated Travel Time (min)": 8.8,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7797404,-73.9545392/40.7803915,-73.9770625/?travelmode=walking",
                    "Image URL": "https://kstatic.googleusercontent.com/files/0df80ab0ad7cc9a3d4a19b068da05a98f4a17ec4182738214b1bd8ac8263ab4a965de25694a9e4220c627ec3016bfce7b5cd3aa0b6afc1eb5a24d25ed2a3a788",
                    "Mode of Transport": "walking",
                    "Name": "Grand Bazaar NYC",
                    "Origin": "40.7797404,-73.9545392"
                },
                {
                    "Destination": "40.7791136,-73.9550867",
                    "Estimated Travel Distance (km)": 2.8,
                    "Estimated Travel Time (min)": 9.4,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7803915,-73.9770625/40.7791136,-73.9550867/?travelmode=walking",
                    "Image URL": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR5NlF3sKsQTlDyNdPgEL0NcJSJPYDcMbjL_msO1McBjpbZeKLBEdT4xzMZ4bk",
                    "Mode of Transport": "walking",
                    "Name": "Target",
                    "Origin": "40.7803915,-73.9770625"
                },
                {
                    "Destination": "40.7941168,-73.96637050000001",
                    "Estimated Travel Distance (km)": 3.7,
                    "Estimated Travel Time (min)": 11.5,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7791136,-73.9550867/40.7941168,-73.96637050000001/?travelmode=walking",
                    "Image URL": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR5NlF3sKsQTlDyNdPgEL0NcJSJPYDcMbjL_msO1McBjpbZeKLBEdT4xzMZ4bk",
                    "Mode of Transport": "walking",
                    "Name": "Target",
                    "Origin": "40.7791136,-73.9550867"
                }
            ],
            "Total Estimated Time (min)": 29.7
        }
    ]
}

output_id = outputs_collection.insert_one(output_data).inserted_id
print(f"Output Document ID: {output_id}")"""



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