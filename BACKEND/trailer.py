from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb+srv://drb6015:XlRnI99WeoVaYAyj@cluster0.2cs7k8r.mongodb.net/")
db = client['routeOptimizer']

# Define collections
inputs_collection = db['inputs']
outputs_collection = db['outputs']

# Input Document
input_data = {
    "address": "164 E 87th St, New York, NY",
    "keyword": ["attraction", "entertainment"],
    "rad": 10,
    "disabled": True,
    "mode": ["driving", "walking"],
    "use_current_location": False,
    "time_per_location": 0
}

# Insert the input
input_id = inputs_collection.insert_one(input_data).inserted_id
print(f"Input Document ID: {input_id}")

# Output Document
output_data = {
    "input_id": input_id,
    "routes": [
        {
            "Cluster Description": "Where cobblestone whispers meet modern marvels, a vibrant tapestry unfolds. History breathes in the shadow of innovation, creating a captivating contrast. Artistic energy pulses through the streets, igniting imagination and inspiring discovery. Culinary adventures await around every corner, tantalizing taste buds with global flavors. This is a place where memories are made, stories are shared, and the spirit of exploration thrives.",
            "Cluster ID": 2,
            "Cluster Name": "Nexus Point",
            "Estimated Travel Distance (km)": 40.4,
            "Estimated Travel Time (min)": 86.2,
            "Popularity": 76,
            "Ratings": 3.9,
            "Route": [
                {
                    "Destination": "40.6731042,-73.8326167",
                    "Estimated Travel Distance (km)": 29.7,
                    "Estimated Travel Time (min)": 58.5,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7797404,-73.9545392/40.6731042,-73.8326167/?travelmode=driving",
                    "Image URL": "https://lh3.googleusercontent.com/p/AF1QipPj3xsS7NcAjNlYXRRAOGMJCs2C_Qd6Tcbkebns=s296-w296-h168-n-k-no-v1",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Serpent's Whisper Trail",
                    "Name": "Resorts World New York City",
                    "Origin": "40.7797404,-73.9545392"
                },
                {
                    "Destination": "40.671521399999996,-73.83334119999999",
                    "Estimated Travel Distance (km)": 1.7,
                    "Estimated Travel Time (min)": 4.9,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.6731042,-73.8326167/40.671521399999996,-73.83334119999999/?travelmode=driving",
                    "Image URL": None,
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Chronarium Ascent",
                    "Name": "NYRA Bets",
                    "Origin": "40.6731042,-73.8326167"
                },
                {
                    "Destination": "40.6978544,-73.9052185",
                    "Estimated Travel Distance (km)": 9.0,
                    "Estimated Travel Time (min)": 22.7,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.671521399999996,-73.83334119999999/40.6978544,-73.9052185/?travelmode=driving",
                    "Image URL": "https://musicart.xboxlive.com/7/ce186e00-0000-0000-0000-000000000002/504/image.jpg?w=720",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Serpent's Coil",
                    "Name": "TV Eye",
                    "Origin": "40.671521399999996,-73.83334119999999"
                }
            ],
            "Total Estimated Time (min)": 86.2
        },
        {
            "Cluster Description": "No description available.",
            "Cluster ID": 0,
            "Cluster Name": "Unnamed Cluster",
            "Estimated Travel Distance (km)": 52.1,
            "Estimated Travel Time (min)": 221.6,
            "Popularity": 97,
            "Ratings": 4.0,
            "Route": [
                {
                    "Destination": "40.744627699999995,-73.98683969999999",
                    "Estimated Travel Distance (km)": 7.2,
                    "Estimated Travel Time (min)": 23.1,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7797404,-73.9545392/40.744627699999995,-73.98683969999999/?travelmode=driving",
                    "Image URL": None,
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Ciphered Meridian",
                    "Name": "Big Deal Speakeasy Casino Events",
                    "Origin": "40.7797404,-73.9545392"
                },
                {
                    "Destination": "40.7585273,-73.9746311",
                    "Estimated Travel Distance (km)": 2.3,
                    "Estimated Travel Time (min)": 11.1,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.744627699999995,-73.98683969999999/40.7585273,-73.9746311/?travelmode=driving",
                    "Image URL": "https://lh3.googleusercontent.com/ouEP_cI84UH2tAMk0ODHoCVw2NVttWylqywfVctGhhDPRgJSDeNxuiBm3Hxq8eEmJIiR5GSEceiDyGesarcbYcRAO7iyqZ68sC-ghbZI-qDtX2y9Tbo",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Obsidian Cipher",
                    "Name": "Casino Parties By Show Biz Productions",
                    "Origin": "40.744627699999995,-73.98683969999999"
                },
                {
                    "Destination": "40.7401386,-73.9869142",
                    "Estimated Travel Distance (km)": 2.7,
                    "Estimated Travel Time (min)": 12.6,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7585273,-73.9746311/40.7401386,-73.9869142/?travelmode=driving",
                    "Image URL": "https://people.com/thmb/YHn6P4fF6JgssTgfTrVEPArEBUg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(736x365:738x367)/roman-coins-1-051425-3b90c8b22aaa4c11b1e70919f4e71f99.jpg",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Obsidian Cipher Trail",
                    "Name": "Treasure Chest",
                    "Origin": "40.7585273,-73.9746311"
                },
                {
                    "Destination": "40.7614327,-73.97762159999999",
                    "Estimated Travel Distance (km)": 2.9,
                    "Estimated Travel Time (min)": 16.1,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7401386,-73.9869142/40.7614327,-73.97762159999999/?travelmode=driving",
                    "Image URL": "http://www.google.com/intl/cs/culturalinstitute/about/images/project/artproject/main.jpg",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Serpent's Coil.",
                    "Name": "The Museum of Modern Art",
                    "Origin": "40.7401386,-73.9869142"
                },
                {
                    "Destination": "40.781264,-73.9603267",
                    "Estimated Travel Distance (km)": 3.4,
                    "Estimated Travel Time (min)": 21.8,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7614327,-73.97762159999999/40.781264,-73.9603267/?travelmode=driving",
                    "Image URL": "https://lh3.googleusercontent.com/ci/AL18g_QIPj4vzVJTs83RMgwrZsF8q8T2VVDf5cXlS-bWv7Up6IHDak0TmoDJcIRGzgZeiu6yLeQv4JM",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Cipher's Ascent",
                    "Name": "Neue Galerie New York",
                    "Origin": "40.7614327,-73.97762159999999"
                },
                {
                    "Destination": "40.7426002,-74.0065704",
                    "Estimated Travel Distance (km)": 7.1,
                    "Estimated Travel Time (min)": 25.3,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.781264,-73.9603267/40.7426002,-74.0065704/?travelmode=driving",
                    "Image URL": None,
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Cipher Stone Trail",
                    "Name": "ARTECHOUSE NYC",
                    "Origin": "40.781264,-73.9603267"
                },
                {
                    "Destination": "40.726336599999996,-73.9912901",
                    "Estimated Travel Distance (km)": 3.6,
                    "Estimated Travel Time (min)": 18.9,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7426002,-74.0065704/40.726336599999996,-73.9912901/?travelmode=driving",
                    "Image URL": None,
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Serpent's Coil Expedition",
                    "Name": "Gotham Dispensary | Bowery",
                    "Origin": "40.7426002,-74.0065704"
                },
                {
                    "Destination": "40.783428,-73.958326",
                    "Estimated Travel Distance (km)": 10.2,
                    "Estimated Travel Time (min)": 31.0,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.726336599999996,-73.9912901/40.783428,-73.958326/?travelmode=driving",
                    "Image URL": "https://lh5.googleusercontent.com/p/AF1QipPd_fCUAkSqTWWYGFganNlYOgKDD5pksBX6qxU5=w672-h672-p-k-no",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Serpent's Echo Trail",
                    "Name": "Salon 94",
                    "Origin": "40.726336599999996,-73.9912901"
                },
                {
                    "Destination": "40.749454,-73.980048",
                    "Estimated Travel Distance (km)": 4.6,
                    "Estimated Travel Time (min)": 19.9,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.783428,-73.958326/40.749454,-73.980048/?travelmode=driving",
                    "Image URL": "https://cdn.apartmenttherapy.info/image/upload/f_auto,q_auto:eco,c_fit,w_730,h_498/at%2Fhouse%20tours%2F2023-House-Tours%2F2023-November%2Fgrace-p%2Ftours-jacksonhole-grace-p-9",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Serpent's Coil",
                    "Name": "Scandinavia House",
                    "Origin": "40.783428,-73.958326"
                },
                {
                    "Destination": "40.745866,-74.006985",
                    "Estimated Travel Distance (km)": 3.7,
                    "Estimated Travel Time (min)": 19.6,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.749454,-73.980048/40.745866,-74.006985/?travelmode=driving",
                    "Image URL": "https://www.google.com/logos/doodles/2019/celebrating-ruth-asawa-5174763654742016-2x.png",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Obsidian Cipher",
                    "Name": "David Zwirner",
                    "Origin": "40.749454,-73.980048"
                },
                {
                    "Destination": "40.75857500000001,-73.980023",
                    "Estimated Travel Distance (km)": 4.4,
                    "Estimated Travel Time (min)": 22.4,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.745866,-74.006985/40.75857500000001,-73.980023/?travelmode=driving",
                    "Image URL": "https://cloudimages.broadwayworld.com/columnpiccloud/1250-09299d6a3b9ac8505933d55ac162b70a.jpg",
                    "Mode of Transport": "driving",
                    "Mystery Name": "The Obsidian Cipher Trail",
                    "Name": "Christie's New York",
                    "Origin": "40.745866,-74.006985"
                }
            ],
            "Total Estimated Time (min)": 221.6
        },
        {
            "Cluster Description": "No description available.",
            "Cluster ID": 1,
            "Cluster Name": "Unnamed Cluster",
            "Estimated Travel Distance (km)": 26.9,
            "Estimated Travel Time (min)": 78.2,
            "Popularity": 84,
            "Ratings": 4.1,
            "Route": [
                {
                    "Destination": "40.683995499999995,-73.99207059999999",
                    "Estimated Travel Distance (km)": 15.7,
                    "Estimated Travel Time (min)": 32.6,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7797404,-73.9545392/40.683995499999995,-73.99207059999999/?travelmode=driving",
                    "Image URL": "https://lsco.scene7.com/is/image/lsco/A93110007-dynamic1-pdp?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500",
                    "Mode of Transport": "driving",
                    "Mystery Name": "Mystical Place",
                    "Name": "Marked Cards",
                    "Origin": "40.7797404,-73.9545392"
                },
                {
                    "Destination": "40.718246,-73.9891093",
                    "Estimated Travel Distance (km)": 5.1,
                    "Estimated Travel Time (min)": 20.7,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.683995499999995,-73.99207059999999/40.718246,-73.9891093/?travelmode=driving",
                    "Image URL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRTRfgkRopMnouB5i00WIwI3XO7BzeKLoSktP4C47agr8CL_2xe8D0vzEl15EgBgHMT82KjLVTXB6jqRQ",
                    "Mode of Transport": "driving",
                    "Mystery Name": "Mystical Place",
                    "Name": "International Center of Photography Museum",
                    "Origin": "40.683995499999995,-73.99207059999999"
                },
                {
                    "Destination": "40.7189604,-73.9883548",
                    "Estimated Travel Distance (km)": 0.3,
                    "Estimated Travel Time (min)": 1.8,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.718246,-73.9891093/40.7189604,-73.9883548/?travelmode=driving",
                    "Image URL": "https://stephaniessweets.com/wp-content/uploads/2025/02/IMG_6811.jpg",
                    "Mode of Transport": "driving",
                    "Mystery Name": "Mystical Place",
                    "Name": "Sour Mouse",
                    "Origin": "40.718246,-73.9891093"
                },
                {
                    "Destination": "40.6784339,-73.9833056",
                    "Estimated Travel Distance (km)": 5.8,
                    "Estimated Travel Time (min)": 23.0,
                    "Google Maps Link": "https://www.google.com/maps/dir/40.7189604,-73.9883548/40.6784339,-73.9833056/?travelmode=driving",
                    "Image URL": None,
                    "Mode of Transport": "driving",
                    "Mystery Name": "Mystical Place",
                    "Name": "Littlefield",
                    "Origin": "40.7189604,-73.9883548"
                }
            ],
            "Total Estimated Time (min)": 78.2
        }
    ]
}

output_id = outputs_collection.insert_one(output_data).inserted_id
print(f"Output Document ID: {output_id}")

