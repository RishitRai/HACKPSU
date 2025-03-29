import requests

def generate_cluster_name_gemini(cluster_places, gemini_api_key):
    """
    Generates a unique and catchy name for a cluster of places using Gemini AI API.

    Parameters:
    - cluster_places: List of places in the cluster.
    - gemini_api_key: API key for Gemini AI.

    Returns:
    - A string representing the cluster name.
    """
    # Combine place names into a single string for the prompt
    place_names = ", ".join([place.get("Place Name", "Unknown") for place in cluster_places if place.get("Place Name")])
    
    # Define the prompt
    prompt = f"Generate a unique and catchy name for a group of places: {place_names}. The name should reflect the theme or purpose of the group."

    # Gemini AI API endpoint
    gemini_endpoint = "https://gemini.googleapis.com/v1/generateText"

    # API request payload
    payload = {
        "prompt": prompt,
        "maxTokens": 50,  # Limit the response length
        "temperature": 0.7  # Adjust creativity level
    }

    # API headers
    headers = {
        "Authorization": f"Bearer {gemini_api_key}",
        "Content-Type": "application/json"
    }

    try:
        # Make the API request
        response = requests.post(gemini_endpoint, headers=headers, json=payload)
        response.raise_for_status()  # Raise an error for failed requests

        # Parse the response
        result = response.json()
        cluster_name = result.get("text", "Unnamed Cluster").strip()

        return cluster_name

    except Exception as e:
        print(f"Error generating cluster name: {e}")
        return "Unnamed Cluster"


# Test cases
if __name__ == "__main__":
    # Mock API key (replace with your actual API key)
    gemini_api_key = "AIzaSyDE1g7OqleOmdBUVpSd0CRVE9KNBSEN61A"

    # Test case 1: Valid cluster with multiple places
    cluster_places_1 = [
        {"Place Name": "Central Park"},
        {"Place Name": "Times Square"},
        {"Place Name": "Statue of Liberty"}
    ]
    print("Test Case 1:")
    print(generate_cluster_name_gemini(cluster_places_1, gemini_api_key))

    # Test case 2: Cluster with one place
    cluster_places_2 = [
        {"Place Name": "Eiffel Tower"}
    ]
    print("\nTest Case 2:")
    print(generate_cluster_name_gemini(cluster_places_2, gemini_api_key))

    # Test case 3: Empty cluster
    cluster_places_3 = []
    print("\nTest Case 3:")
    print(generate_cluster_name_gemini(cluster_places_3, gemini_api_key))

    # Test case 4: Cluster with missing place names
    cluster_places_4 = [
        {"Place Name": None},
        {"Place Name": "Grand Canyon"},
        {}
    ]
    print("\nTest Case 4:")
    print(generate_cluster_name_gemini(cluster_places_4, gemini_api_key))