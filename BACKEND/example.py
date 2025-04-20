from google import genai
from google.genai import types

# Initialize API
gen_api = "AIzaSyB_VzdpZJN8U7sPTx3cEXnj7cpnY3KPQrs"
genai_client = genai.Client(api_key=gen_api)

def name_generator(cluster_places):
    # Combine all place names
    place_names = ", ".join([place["Name"] for place in cluster_places if place.get("Name")])

    # Create the prompt
    prompt = f"""Generate one unique, catchy, and creative name for a cluster of places: {place_names}. The name should be short, memorable, and reflect the essence of this group. Just return the name, no explanation."""

    try:
        # Generate the response
        response = genai_client.models.generate_content(
            model='gemini-2.0-flash-001',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="Generate just one unique and catchy name for the given cluster of places without any description.",
                temperature=0.7,
                max_output_tokens=50,
            )
        )

        return response.text.strip() if response.text else "Unnamed Cluster"
    except Exception as e:
        print("Error:", e)
        return "Unnamed Cluster"

# Test call
print(name_generator([{"Name": "Sunny Hills"}, {"Name": "Maple Creek"}, {"Name": "Golden Meadow"}]))
