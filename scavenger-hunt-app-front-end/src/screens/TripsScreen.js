// TripDetailScreen.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Card, ProgressBar, Divider, Button } from 'react-native-paper';
// If you plan to actually use a Map:
// import MapView, { Polyline, Marker } from 'react-native-maps';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Example data
const SAMPLE_IMAGES = [
  require('../assets/image.png'),
  require('../assets/image1.webp'),
  require('../assets/image2.webp'),
];

const SAMPLE_LOCATIONS = [
  { id: '1', name: 'Beach Entrance', completed: true },
  { id: '2', name: 'Seaside Café', completed: true },
  { id: '3', name: 'Lighthouse Tour', completed: false },
  { id: '4', name: 'Sunset Point', completed: false },
];

const SAMPLE_REVIEWS = [
  {
    id: '1',
    user: 'John Doe',
    rating: 4.5,
    comment: 'Beautiful scenery and well-organized trip!',
  },
  {
    id: '2',
    user: 'Jane Smith',
    rating: 4.0,
    comment: 'Loved the variety of activities available.',
  },
];

// We define a simple route for demonstration (fake coordinates)
const SAMPLE_ROUTE_POINTS = [
  { latitude: 37.78825, longitude: -122.4324 },
  { latitude: 37.78945, longitude: -122.4354 },
  { latitude: 37.79065, longitude: -122.4379 },
];

const TripsScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // For horizontal scrolling of images
  const carouselRef = useRef(null);

  const onScroll = (event) => {
    // Calculate current index of the image based on scroll offset
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  // Progress calculation for location list
  const completedCount = SAMPLE_LOCATIONS.filter((loc) => loc.completed).length;
  const progress = completedCount / SAMPLE_LOCATIONS.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Horizontal Image Carousel */}
        <View style={styles.imageCarouselContainer}>
          <FlatList
            ref={carouselRef}
            data={SAMPLE_IMAGES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `image-${index}`}
            onScroll={onScroll}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image source={item} style={styles.carouselImage} />
              </View>
            )}
          />
          {/* Image index indicators (small dots) */}
          <View style={styles.indicatorContainer}>
            {SAMPLE_IMAGES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    opacity: index === currentIndex ? 1 : 0.3,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.detailContainer}>
          {/* Total Time & Distance */}
          <View style={styles.timeDistanceRow}>
            <Text style={styles.infoText}>Total Time: ~3 hrs</Text>
            <Text style={styles.infoText}>Distance: ~12 km</Text>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>Scenic Beach Escape</Text>
          <Text style={styles.description}>
            Enjoy a relaxing tour of the coastline with stops at hidden beaches,
            a charming seaside café, and a historic lighthouse.
          </Text>

          <Divider style={styles.divider} />

          {/* Large Map (Placeholder) */}
          <Text style={styles.sectionHeader}>Route Map</Text>
          <Card style={styles.mapCard}>
            {/* 
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
            >
              <Polyline
                coordinates={SAMPLE_ROUTE_POINTS}
                strokeWidth={4}
                strokeColor="blue"
              />
              <Marker coordinate={SAMPLE_ROUTE_POINTS[0]} />
              <Marker coordinate={SAMPLE_ROUTE_POINTS[SAMPLE_ROUTE_POINTS.length - 1]} />
            </MapView>
            */}
            <View style={styles.mapPlaceholder}>
              <Text style={{ color: '#777', fontStyle: 'italic' }}>
                Map Placeholder
              </Text>
              <Text style={{ color: '#777', fontStyle: 'italic' }}>
                (Implement react-native-maps for route animation)
              </Text>
            </View>
          </Card>

          {/* List of Locations with Progress Bar */}
          <Text style={styles.sectionHeader}>Trip Progress</Text>
          <ProgressBar
            progress={progress}
            color="#6A0DAD"
            style={styles.progressBar}
          />
          <View style={styles.locationList}>
            {SAMPLE_LOCATIONS.map((loc) => (
              <View key={loc.id} style={styles.locationItem}>
                <View style={styles.bullet} />
                <Text
                  style={[
                    styles.locationName,
                    loc.completed && styles.completedLocation,
                  ]}
                >
                  {loc.name}
                </Text>
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Reviews Section */}
          <Text style={styles.sectionHeader}>Reviews</Text>
          {SAMPLE_REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewUser}>{review.user}</Text>
              <Text style={styles.reviewRating}>
                Rating: {review.rating.toFixed(1)}
              </Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}

          {/* Button to “Join” or “Start” the trip */}
          <Button
            mode="contained"
            style={styles.joinButton}
            onPress={() => {}}
          >
            Join Trip
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  imageCarouselContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6, // Adjust the height as you wish
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  detailContainer: {
    padding: 16,
  },
  timeDistanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  divider: {
    marginVertical: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  mapCard: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
  },
  // If using a real map, simply apply this style to MapView:
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    marginBottom: 12,
    height: 10,
    borderRadius: 5,
  },
  locationList: {
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    backgroundColor: '#6A0DAD',
    borderRadius: 4,
    marginRight: 8,
  },
  locationName: {
    fontSize: 16,
    color: '#333',
  },
  completedLocation: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewRating: {
    fontSize: 14,
    color: '#777',
    marginVertical: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
  },
  joinButton: {
    marginTop: 20,
    borderRadius: 20,
    paddingVertical: 6,
  },
});
