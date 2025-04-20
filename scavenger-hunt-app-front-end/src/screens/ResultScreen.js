import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';

const ResultScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { trip } = route.params;

  const coordinates = trip.destinations.map((destination) => ({
    latitude: destination.lat,
    longitude: destination.lng,
    name: destination.name,
  }));

  const initialRegion = {
    latitude: coordinates[0]?.latitude || 37.7749,
    longitude: coordinates[0]?.longitude || -122.4194,
    latitudeDelta: 0.009, // Zoom level
    longitudeDelta: 0.009,
  };

  const navigateToDestination = (index) => {
    navigation.navigate('CheckpointChecker', {
      currentIndex: index,
      nextIndex: index + 1 < trip.destinations.length ? index + 1 : index,
      trip: trip
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={trip.image} style={styles.image} />
        <Text style={[styles.title, { color: colors.text }]}>{trip.name}</Text>
        <Text style={{ color: colors.text }}>Description: {trip.description}</Text>
        <Text style={[styles.info, { color: colors.text }]}>Duration: {trip.estimatedTime} min</Text>
        <Text style={[styles.info, { color: colors.text }]}>Estimated Distance: {trip.estimatedDistance} km</Text>
        <Text style={{ color: colors.text }}>Ratings: {trip.ratings}</Text>
        <Text style={{ color: colors.text }}>Popularity: {trip.popularity}</Text>

        <Text style={[styles.header, { color: colors.text }]}>Journey for {trip.name}</Text>

        {trip.destinations.map((destination, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.lining}>
              <View style={styles.circle}>
                <Text style={styles.circleText}>{index + 1}</Text>
              </View>

              {index < trip.destinations.length - 1 && (
                <View style={styles.lineContainer}>
                  <View style={styles.line} />
                </View>
              )}
            </View>
            
            <View style={styles.stepDetails}>
              <View>
                <Text style={[styles.location, { color: colors.text }]}>{destination.name}</Text>
                <Text style={[styles.transport, { color: colors.text }]}>
                  Mode: {destination.modeOfTransport}
                </Text>
              </View>
              
              {/* Navigation Button */}
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigateToDestination(index)}
              >
                <Text style={styles.navButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Map Section */}
        <Text style={[styles.header, { color: colors.text }]}>Map of Journey</Text>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
        >
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

        {/* Start Journey Button */}
        <Button 
          mode="contained" 
          style={styles.startButton}
          onPress={() => navigateToDestination(0)}
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
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    width: '100%',
  },
  stepDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  lining: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00FF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  transport: {
    fontSize: 14,
    marginBottom: 5,
  },
  lineContainer: {
    width: 2,
    height: 40,
    alignSelf: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#00FF00',
  },
  map: {
    width: Dimensions.get('window').width * 0.9,
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#00FF00',
    width: '100%',
    marginTop: 16,
    borderRadius: 8,
  },
});