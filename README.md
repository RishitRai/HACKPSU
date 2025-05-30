![Newimg](https://github.com/user-attachments/assets/8e0e26b4-d1bd-4f4a-acbd-d9c8b4ba5af2)


Voyagr is a smart travel planning app that creates optimized itineraries based on your preferences, accessibility needs, and travel style — all in real time.

Built during HackPSU, Voyagr aims to make exploration effortless by combining intelligent routing, personalized recommendations, and gamification.

✨ Features

- 🔎 **Location-Based Planning** – Enter your current location and radius to receive nearby attractions and activities.
- 🎯 **Smart Filtering** – Customize by activity type, accessibility requirements, and travel mode (walk, drive, etc.).
- 🗺️ **Optimized Routes** – Automatically plans the most efficient path based on time and location.
- 🏅 **Gamified Travel** – Earn points for each place visited and climb a leaderboard.
- 📱 **Clean, Interactive UI** – Designed for intuitive and engaging use on mobile and web.



![githubdesgin1](https://github.com/user-attachments/assets/032ae48a-ca8b-4ac2-8eb5-7e2f0d08c55c)

## 🛠️ Tech Stack

- **Frontend:** React Native (Expo)
- ## Backend: ##

- **Flask** – Python web framework for building REST APIs
- **pymongo** – MongoDB Atlas (cloud database) integration
- **faiss** – Fast clustering and similarity search for route optimization
- **google-genai** – Google Gemini Generative AI API for naming and descriptions
- **supabase** – Integration for additional cloud database or authentication features
- **python-dotenv** – For loading environment variables and API keys
- **Pillow** – Image processing (for hashing and manipulation)
- **imagehash** – Perceptual image hashing
- **requests** – HTTP requests to external APIs (Google Maps, Places, etc.)
- **flask-cors** – Enable CORS for frontend-backend communication
- **numpy** – Numerical operations for clustering and calculations
- **Database:** MongoDB Atlas (Cloud)
- **APIs Used:**
  - **Google Maps Geocoding API** – for converting addresses to latitude/longitude
  - **Google Places API** – for searching nearby places by keyword/category
  - **Google Routes API** – for route and travel time/distance calculations
  - **Google Custom Search API** – for fetching images of places
  - **Google Geolocation API** – for determining the user's current location
  - **Gemini (Google Generative AI) API** – for generating creative names and descriptions for clusters/routes

## 🚀 Getting Started

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/RishitRai/HACKPSU.git
cd HACKPSU
```

---

### 2. MongoDB Atlas Setup

- Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and cluster.
- Create a database (e.g., `scavenger_hunt`) and collection (e.g., `routes`).
- Whitelist your IP or allow access from anywhere (`0.0.0.0/0`).
- Get your connection string from the Atlas dashboard.

---

### 3. Backend Setup (with Virtual Environment)

1. **Navigate to the backend folder:**
    ```sh
    cd backend
    ```

2. **Create and activate a virtual environment:**
    ```sh
    python -m venv venv
    venv\Scripts\activate   # On Windows
    # or
    source venv/bin/activate  # On Mac/Linux
    ```

3. **Install dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

4. **Set up your `.env` file** with your API keys and MongoDB URI.

5. **Start the backend:**
    ```sh
    python app.py
    ```

---
### 4. Frontend Setup

1. Install dependencies:

    ```sh
    cd scavenger-hunt-app-front-end
    npm install
    ```

2. Start the Expo app:

    ```sh
    npx expo start
    ```

3. Make sure your backend URL in the frontend matches your Flask server (e.g., `http://<your-ip>:5000`).

---

### 5. Seeding Sample Data (Optional)

You can use a script to insert sample routes into your MongoDB Atlas collection:

```python
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client['scavenger_hunt']
routes_collection = db['routes']

sample_routes = [
    {
        "Cluster Name": "Route 1",
        "Estimated Travel Distance (km)": 10,
        "Total Estimated Time (min)": 30,
        "Locations": ["Location A", "Location B", "Location C"]
    }
]

routes_collection.insert_many(sample_routes)
print("Sample data inserted!")
```

---

## Usage

1. Open the app on your device or emulator.
2. Enter your trip preferences.
3. View optimized routes fetched from MongoDB Atlas via the Flask backend.

---

## Troubleshooting

- **CORS errors:** Make sure your Flask backend allows requests from your Expo app.
- **Network errors:** Use your computer's local IP address instead of `localhost` in the frontend if testing on a physical device.
- **MongoDB connection issues:** Double-check your Atlas URI, username, password, and network access settings.
