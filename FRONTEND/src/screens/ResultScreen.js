import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
  Linking,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ResultScreen = ({ route, navigation }) => {
  const { colors } = useTheme(); 
  const { trip } = route.params; // Trip object passed via navigation

  // Extract coordinates for the route's destinations
  const coordinates = trip.destinations.map((destination) => ({
    latitude: destination.lat,
    longitude: destination.lng,
    name: destination.name,
  }));

  // Center the map on the first destination
  const initialRegion = {
    latitude: coordinates[0]?.latitude || 37.7749,
    longitude: coordinates[0]?.longitude || -122.4194,
    latitudeDelta: 0.009,
    longitudeDelta: 0.009,
  };

  // Navigate to the quiz/checkpoint screen for a specific destination
  const navigateToDestination = (index) => {
    navigation.navigate('LocationQuiz', {
      currentIndex: index,
      nextIndex: index + 1 < trip.destinations.length ? index + 1 : index,
      trip: trip,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Main Section - Shows  cover image and title */}
        <View style={styles.heroSection}>
          <Image source={trip.image} style={styles.image} />
          <View style={styles.overlayContent}>
            <View style={styles.titleSection}>
              <Text style={[styles.title, { color: colors.text }]}>{trip.name}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {trip.ratings}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary stats like duration, distance, etc. */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{trip.estimatedTime}m</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{trip.estimatedDistance}km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{trip.destinations.length}</Text>
              <Text style={styles.statLabel}>Stops</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>★ {trip.ratings}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Description of the trip */}
          <Text style={[styles.description, { color: colors.text }]}>{trip.description}</Text>
        </View>

        {/* Journey section with destinations and navigation buttons */}
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Journey</Text>
        <View style={styles.journeyContainer}>
          {trip.destinations.map((destination, index) => (
            <View key={index} style={styles.stepContainer}>
              
              {/* Visual indicator (dot + line) */}
              <View style={styles.stepIndicator}>
                <View style={styles.stepDot} />
                {index < trip.destinations.length - 1 && <View style={styles.stepLine} />}
              </View>

              {/* Destination info and navigation button */}
              <View style={styles.stepContent}>
                <View style={styles.destinationRow}>
                  <View style={styles.destinationInfo}>
                    <Text style={[styles.locationName, { color: colors.text }]}>
                      {destination.mystery}
                    </Text>
                    <Text style={styles.transportMode}>{destination.modeOfTransport}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateToDestination(index)}
                  >
                    <Icon name="navigation" size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Map displaying all destination pins */}
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Map</Text>
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={initialRegion}>
            {coordinates.map((location, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title={location.name}
              />
            ))}
          </MapView>
        </View>

        {/* CTA to start the journey */}
        <Button
          mode="contained"
          style={styles.startButton}
          onPress={() => navigateToDestination(0)}
          labelStyle={styles.startButtonText}
        >
          Start Journey
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResultScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroSection: {
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 220,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 34,
    flex: 1,
    marginRight: 12,
  },
  ratingBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#aaa',
    marginTop: 16,
    textAlign: 'left',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  journeyContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 2,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
    marginBottom: 8,
  },
  stepLine: {
    width: 1,
    height: 32,
    backgroundColor: '#333',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  destinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transportMode: {
    fontSize: 13,
    color: '#888',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00FF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  startButton: {
    backgroundColor: '#00FF00',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
  },
  startButtonText: {
    fontSize: 13,
    color: '#000',
    fontWeight: 'bold',
  },
});
