import requests
import numpy as np
import faiss
import json
import time
from dotenv import load_dotenv
import os
from google import genai
from google.genai import types

#from urllib.parse import urlencode

class RouteOptimizer:
    def __init__(self, api_key, gen_api, class_url, class_key, search_id):
        self.api_key = api_key
        self.class_url = class_url
        self.class_key = class_key
        self.search_id = search_id
        self.genai_client = genai.Client(api_key=gen_api)

    def extract_lat_lng(self, input_address, data_type='json'):
        """
        Extracts latitude and longitude from an address using Google Geocoding API.
        """
        endpoint = f"https://maps.googleapis.com/maps/api/geocode/{data_type}" 
        params = {
            "address": input_address,
            "key": self.api_key
        }

        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()

            data = response.json()
            if "results" in data and data["results"]:
                latlng = data["results"][0]["geometry"]["location"]
                return latlng.get("lat"), latlng.get("lng")
            else:
                return None, None
        except:
            return None, None
        
    def starting_point(self, use_current, starting_point):
        if use_current:
            current_location = self.get_current_location_google()
        else:
            current_location = self.extract_lat_lng(starting_point)
        return current_location
        

    def nearby_places_multi_keyword(self, base_keywords, maxresult, lat, lon, radius):
        """
        Fetches nearby places using multiple base keywords (categories).
        
        Parameters:
        - api_key: Google Places API key
        - base_keywords: List of base keywords (categories)
        - maxresult: Max number of places to return
        - lat, lon: Latitude and Longitude
        - radius: Search radius (meters)
        
        Returns:
        - List of places (up to maxresult)
        """
        if lat is None or lon is None:
            return []
        
        endpoint_places = "https://places.googleapis.com/v1/places:searchNearby"
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.displayName,places.accessibilityOptions,places.location,places.currentOpeningHours,places.id"
        }
        
        keyword_map = {
            "attraction": ["tourist_attraction", "museum", "landmark", "art_gallery", "town_square"],
            "nature": ["park", "natural_feature", "zoo", "aquarium", "beach", "rv_park"],
            "entertainment": ["amusement_park", "casino", "bowling_alley", "movie_theater", "stadium", "night_club"],
            "food": ["restaurant", "cafe", "bar", "bakery", "liquor_store", "meal_takeaway"],
            "shopping": ["shopping_mall", "clothing_store", "shoe_store", "jewelry_store", "supermarket", "department_store", "gift shop"],
            "religious": ["church", "mosque", "synagogue", "hindu_temple"]
        }
        
        # Ensure base_keywords is a list
        if not isinstance(base_keywords, list):
            base_keywords = [base_keywords]

        # Collect all related keywords for each base keyword
        keywords_set = set()
        for base_keyword in base_keywords:
            related_keywords = keyword_map.get(base_keyword, [base_keyword])
            keywords_set.update(related_keywords)

        keywords = list(keywords_set)
        
        all_places = []
        seen_ids = set()
        
        for keyword in keywords:
            data = {
                "includedTypes": [keyword],
                "maxResultCount": 20,
                "locationRestriction": {
                    "circle": {
                        "center": {
                            "latitude": lat,
                            "longitude": lon
                        },
                        "radius": radius
                    }
                }
            }
            
            try:
                response = requests.post(endpoint_places, headers=headers, json=data)
                response.raise_for_status()
                
                response_data = response.json()
                
                if "places" in response_data and response_data["places"]:
                    for place in response_data["places"]:
                        place_id = place.get("id")
                        if place_id and place_id not in seen_ids:
                            seen_ids.add(place_id)
                            all_places.append(place)
                            
                            if len(all_places) >= maxresult:
                                break
                else:
                    # If no places are found for a keyword, just continue
                    continue
                    
                time.sleep(2)  # delay between requests to avoid rate limits
            except:
                continue
        
        return all_places[:maxresult]


    def sorted_place_details(self, response_data, accessible = False):
        """
        Extracts relevant details from the given API response.
        """
        extracted_data = []

        if not response_data:
            return []

        for place in response_data:
            name = place.get("displayName", {}).get("text", None)
            latitude = place.get("location", {}).get("latitude", None)
            longitude = place.get("location", {}).get("longitude", None)
            open_now = place.get("currentOpeningHours", {}).get("openNow", None)
            next_closing_time = place.get("currentOpeningHours", {}).get("nextCloseTime", None)

            if open_now is True:
                open_status = "Yes"
            elif open_now is False:
                open_status = "No"
            else:
                open_status = None

            accessibility = place.get("accessibilityOptions", {})

            # Check for weelchair accessibility
            if accessible:
                access = (
                    accessibility.get("wheelchairAccessibleParking", False) or
                    accessibility.get("wheelchairAccessibleEntrance", False) or
                    accessibility.get("wheelchairAccessibleRestroom", False) or
                    accessibility.get("wheelchairAccessibleSeating", False)
                )
                if not access:
                    continue

            extracted_data.append({
                "Place Name": name,
                "Location": {"Latitude": latitude, "Longitude": longitude} if latitude is not None and longitude is not None else None,
                "Open Now": open_status,
                "Next Closing Time": next_closing_time,
                "Accessibility Options": {
                    "Wheelchair Accessible Parking": "Yes" if accessibility.get("wheelchairAccessibleParking", False) else "No",
                    "Wheelchair Accessible Entrance": "Yes" if accessibility.get("wheelchairAccessibleEntrance", False) else "No",
                    "Wheelchair Accessible Restroom": "Yes" if accessibility.get("wheelchairAccessibleRestroom", False) else "No",
                    "Wheelchair Accessible Seating": "Yes" if accessibility.get("wheelchairAccessibleSeating", False) else "No"
                }
            })

        return extracted_data

    def location_extractor(self, place):
        """
        Extracts lat/lon as a string for Google Maps API.
        """
        try:
            location = place.get("Location", None)
            if location and isinstance(location, dict):
                lat, lon = location.get("Latitude"), location.get("Longitude")
                if lat is not None and lon is not None:
                    return f"{lat},{lon}"
        except:
            return None

    def cluster_locations_faiss(self, places, max_groups):
        """
        Clusters locations using FAISS.
        """
        valid_places = []
        valid_locations = []
        
        # Get valid locations first
        for place in places:
            loc = self.location_extractor(place)
            if loc is not None:
                valid_places.append(place)
                valid_locations.append(loc)
        
        if not valid_locations:
            return {}

        # Convert to numpy array for FAISS
        location_array = []
        for latlon in valid_locations:
            try:
                lat, lon = map(float, latlon.split(','))
                location_array.append([lat, lon])
            except ValueError:
                continue
                
        if not location_array:
            return {}
            
        locations_np = np.array(location_array, dtype=np.float32)
        num_clusters = min(max_groups, len(locations_np))
        
        # Need at least one cluster
        if num_clusters < 1:
            return {}
        
        # Initialize and train FAISS kmeans
        kmeans = faiss.Kmeans(d=2, k=num_clusters, niter=20, verbose=False)
        kmeans.train(locations_np)
        
        # Get cluster assignments
        _, labels = kmeans.index.search(locations_np, 1)
        labels = labels.flatten()
        
        # Group places by cluster
        clusters = {}
        for i, label in enumerate(labels):
            label_int = int(label)
            if label_int not in clusters:
                clusters[label_int] = []
            clusters[label_int].append(valid_places[i])
        
        return clusters

    def transport_mode(self, distance_km, user_modes = None):
        """
        Dynamically selects the best mode of transport based on distance.
        """
        if user_modes is None or not user_modes:
            user_modes = ["driving"]
        
        if distance_km <= 1.5 and "walking" in user_modes:
            return "walking"
        elif 1.5 < distance_km <= 5 and "bicycling" in user_modes:
            return "bicycling"
        elif distance_km > 5 and "transit" in user_modes:
            return "transit"
        else:
            if "driving" in user_modes:
                return "driving"  
            else:
                return user_modes[0]



    def compute_total_distance_time(self, places, user_modes = None):
        """
        Computes the total distance and time required to cover all locations in order.
        """
        if user_modes is None:
            user_modes = ["driving"]
        
        url = "https://routes.googleapis.com/directions/v2:computeRoutes"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "routes.distanceMeters,routes.duration"
        }

        # Get valid locations
        locations = []
        for place in places:
            loc = self.location_extractor(place)
            if loc:
                locations.append(loc)

        if len(locations) < 2:
            return []

        segment_data = []
        
        for i in range(len(locations) - 1):
            try:
                origin_parts = locations[i].split(",")
                dest_parts = locations[i + 1].split(",")
                
                data = {
                    "origin": {
                        "location": {
                            "latLng": {
                                "latitude": float(origin_parts[0]),
                                "longitude": float(origin_parts[1])
                            }
                        }
                    },
                    "destination": {
                        "location": {
                            "latLng": {
                                "latitude": float(dest_parts[0]),
                                "longitude": float(dest_parts[1])
                            }
                        }
                    },
                    "routingPreference": "TRAFFIC_AWARE"
                }
                
                response = requests.post(url, headers = headers, json = data)
                response.raise_for_status()
                route_data = response.json()
                
                if "routes" in route_data and route_data["routes"]:
                    route = route_data["routes"][0]
                    distance_meters = route.get("distanceMeters", 0)
                    
                    # Handle duration which might be a string with 's' suffix or a number
                    duration_str = route.get("duration", "0")
                    if isinstance(duration_str, str) and duration_str.endswith('s'):
                        duration_seconds = int(duration_str[:-1])
                    else:
                        duration_seconds = int(duration_str)
                    
                    distance_km = round(distance_meters / 1000, 2)
                    duration_min = round(duration_seconds / 60, 2)
                    
                    # Determine transportation mode based on distance
                    mode = self.transport_mode(distance_km, user_modes)
                    
                    segment_data.append({
                        "name": places[i + 1]["Place Name"],
                        "origin": locations[i],
                        "destination": locations[i + 1],
                        "distance": distance_km,
                        "time": duration_min,
                        "mode": mode
                    })  
                time.sleep(1)  # Rate limiting
                
            except:
                continue
        
        return segment_data


    def get_current_location_google(self):
        """
        Fetches the user's current location using the Google Geolocation API.
        """
        url = "https://www.googleapis.com/geolocation/v1/geolocate"
        params = {"key": self.api_key}
        
        try:
            response = requests.post(url, params=params, json={})
            response.raise_for_status()  # Raise an error if the request fails
            data = response.json()

            location = data.get("location", {})
            latitude = location.get("lat")
            longitude = location.get("lng")
            if latitude is not None and longitude is not None:
                return latitude, longitude
            else:
                return None, None
        except:
            return None, None


    def name_generator(self, cluster_places):
        """
        Generates a unique, catchy, and creative name for a cluster of places.
        """
        # Combine place names into a single string for the prompt
        place_names = ", ".join([place["Name"] for place in cluster_places if place.get("Name")])
        
        # Refined prompt to generate a catchy name directly
        prompt = f"Generate a unique, catchy, and creative name for a cluster of places: {place_names}. The name should be short, memorable, and reflect the essence of this group."

        try:
            # Use the Gemini model for content generation
            response = self.genai_client.models.generate_content(
                model='gemini-2.0-flash-001',  # Adjust the model version if necessary
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction="Generate just one unique and catchy name for the given cluster of places without any description.",
                    max_output_tokens=50,  # Allow a slightly longer output to get full descriptions
                    temperature=0.7,       # Control randomness
                ),
            )
            
            # Return the generated name
            return response.text.strip() if response.text else "Unnamed Cluster"
        except:
            return "Unnamed Cluster" 
    
    def description_generator(self, cluster_places):
        """
        Generates a unique, catchy, and creative description for a cluster of places.
        """
        place_names = ", ".join([place["Name"] for place in cluster_places if place.get("Name")])
        prompt = f"Generate a creative description for a cluster of places: {place_names}. The description should have 5 sentences and should be memorable, and reflect the essence of this group. Do not include options, lists, or additional formatting."

        try:
            response = self.genai_client.models.generate_content(
                model='gemini-2.0-flash-001',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction="Generate a catchy and creative description for the given cluster of places without any additional formatting or options.",
                    max_output_tokens=100,
                    temperature=0.7,
                ),
            )
            generated_text = response.text.strip() if response.text else "No description available."
            clean_text = generated_text.split("\n")[0]
            return clean_text
        except Exception as e:
            return "No description available."
        


    def get_place_image(self, query):
        """
        Fetches an image URL for a place using Google Custom Search API.

        Parameters:
        - api_key: Google API Key
        - cx: Custom Search Engine ID
        - query: Search query (e.g., place name)

        Returns:
        - Image URL (if available) or None
        """
        search_url = "https://www.googleapis.com/customsearch/v1"
        
        params = {
            "key": self.api_key,
            "cx": self.search_id,
            "q": query,
            "searchType": "image",  # Fetch image results
            "num": 1  # Get only one image
        }

        try:
            response = requests.get(search_url, params=params)
            response.raise_for_status()
            data = response.json()

            if "items" in data and len(data["items"]) > 0:
                return data["items"][0]["link"]  # Get the first image URL
            else:
                return None

        except:
            return None 


    def maps_link(self, places, user_modes=None):
        """
        Generates a Google Maps link for navigation with appropriate transport modes.
        """
        if user_modes is None:
            user_modes = ["driving"]
            
        if len(places) < 2:
            return "Not enough locations for a route"
        
        locations = []
        for place in places:
            if isinstance(place, str):
                locations.append(place)
            else:
                loc = self.location_extractor(place)
                if loc:
                    locations.append(loc)
        
        if len(locations) < 2:
            return "Not enough valid locations for a route"
        
        # Standard Google Maps directions URL format:
        origin = locations[0]
        destination = locations[-1]
        waypoints = locations[1:-1] if len(locations) > 2 else []
        travel_mode = user_modes[0] if user_modes else "driving"
        
        # Construct URL path rather than query string for directions
        path = "/".join(locations)
        final_url = f"https://www.google.com/maps/dir/{path}/?travelmode={travel_mode}"
        return final_url


    def optimize_routes(self, lat, lng, places, time_limit, max_groups, visit_duration_per_location, user_modes = None):
        """
        Optimizes travel routes using FAISS clustering and Google Routes API.
        Includes estimated time spent at locations.
        """
        if user_modes is None:
            user_modes = ["driving"]
        
        if lat is not None and lng is not None:
            current_location = {"Latitude": lat, "Longitude": lng}
        
        if lat is None or lng is None:
            return None
        
        # Format current location to match `places` structure
        starting_point = {
            "Place Name": "Your Starting Location",
            "Location": current_location,
            "Open Now": None,
            "Next Closing Time": None,
            "Accessibility Options": {
                "Wheelchair Accessible Parking": "N/A",
                "Wheelchair Accessible Entrance": "N/A",
                "Wheelchair Accessible Restroom": "N/A",
                "Wheelchair Accessible Seating": "N/A"
            }
        }
        
        places_with_locations = [place for place in places if place.get("Location")]
        
        clusters = self.cluster_locations_faiss(places_with_locations, max_groups)
        optimized_routes = []
        
        for cluster_id, group in clusters.items():
            if len(group) < 2:
                continue
            
            if starting_point not in group:
                group.insert(0, starting_point)

            travel_info = self.compute_total_distance_time(group, user_modes)
            
            if not travel_info:
                continue
            
            # Calculate totals
            travel_distance = sum(numl["distance"] for numl in travel_info)
            travel_time = sum(numl["time"] for numl in travel_info)
            visit_time = visit_duration_per_location * len(group)
            total_time = travel_time + visit_time
            
            if total_time > time_limit:
                continue


            routes = []
            for segment in travel_info:
                place_name = segment["name"]
                image_url = self.get_place_image(place_name)

                route_entry = {
                    "Name": segment["name"],
                    "Origin": segment["origin"],
                    "Destination": segment["destination"],
                    "Estimated Travel Distance (km)": round(segment["distance"], 1),
                    "Estimated Travel Time (min)": round(segment["time"], 1),
                    "Mode of Transport": segment["mode"],
                    "Google Maps Link": self.maps_link([segment["origin"], segment["destination"]], [segment["mode"]]),
                    "Image URL": image_url
                }
                routes.append(route_entry)

            optimized_routes.append({
                "Cluster ID": cluster_id,
                "Cluster Name": self.name_generator(group),
                "Cluster Description": self.description_generator(group),
                "Estimated Travel Distance (km)": round(travel_distance, 1),
                "Estimated Travel Time (min)": round(travel_time, 1),
                "Total Estimated Time (min)": round(total_time, 1),
                "Route": routes
            })
        return json.dumps(optimized_routes, indent = 4)
    
    def is_user_at_location(self, target_lat, target_lon, tolerance=0.01):
        """""
        Checks if the user is at the specified location within a given tolerance.

        Parameters:
        - target_lat: Latitude of the target location.
        - target_lon: Longitude of the target location.
        - tolerance: Allowed distance (in degrees) for the user to be considered "at" the location.

        Returns:
        - True if the user is at the location, False otherwise.
        """
        try:
            # Get the user's current location
            current_lat, current_lon = self.get_current_location_google()
            if current_lat is None or current_lon is None:
                return False

            # Check if the current location is within the tolerance range of the target location
            if abs(current_lat - target_lat) <= tolerance and abs(current_lon - target_lon) <= tolerance:
                return True
            else:
                return False
        except Exception as e:
            print(f"Error checking user location: {e}")
            return False

    
# Apis & Keys
load_dotenv()
api = os.getenv("API_KEY")
gen_key = os.getenv("GEN_API")
class_url = os.getenv("CLASS_URL")
class_key = os.getenv("CLASS_KEY")
search_id = os.getenv("SEARCH_ID")

# Input
address = "164 E 87th St, New York, NY"
keyword = ["attraction", "entertainment"]
rad = 30000
disabled = True
mode = ["driving", "walking"]
use_current_location = False
time_per_location = 0


# Initialize RouteOptimizer

optimizer = RouteOptimizer(api_key=api, gen_api = gen_key, class_url=class_url, class_key=class_key, search_id=search_id)
lati, long = optimizer.starting_point(use_current_location, address)
places_response = optimizer.nearby_places_multi_keyword(base_keywords = keyword, maxresult = 20, lat = lati, lon = long, radius = rad)
final_places = optimizer.sorted_place_details(places_response, accessible = disabled)
optimized_routes = optimizer.optimize_routes(
    lat = lati,
    lng = long,
    places = final_places, 
    time_limit = 500, 
    max_groups = 10,  
    visit_duration_per_location = time_per_location, 
    user_modes = mode
)
print(optimized_routes)