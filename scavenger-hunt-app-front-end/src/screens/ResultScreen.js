import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions, FlatList, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';


const ResultScreen = ({ route }) => {
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


  return (
    <SafeAreaView  style={[styles.container, { backgroundColor: colors.background }]}>
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
              <Text style={[styles.location, { color: colors.text }]}>{destination.name}</Text>
              <Text style={[styles.transport, { color: colors.text }]}>
                Mode: {destination.modeOfTransport}
              </Text>

              {/* {destination.mapLink && (
                <TouchableOpacity
                  style={styles.linkContainer}
                  onPress={() => {
                    if (destination.mapLink.startsWith('http')) {
                      Linking.openURL(destination.mapLink);
                    } else {
                      alert('Not a valid URL');
                    }
                  }}
                >
                  <Text style={[styles.linkText, { color: colors.primary }]}>Open in Maps</Text>
                </TouchableOpacity>
              )} */}
            </View>
            
          </View>
        ))}



        {/* Map Section */}
        <Text style={[styles.header, { color: colors.text }]}>Map of Journey</Text>
        <MapView
          style={styles.map}
          initialRegion= {initialRegion}
        >
          {coordinates.map((location, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={location.name} // Name of the location
            />
          ))}
        </MapView>

      </ScrollView>


      
    </SafeAreaView >
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1, // Ensures scrollable content
    alignItems: 'center', // Centered content within ScrollView
    padding: 20,
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
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30, // Space between steps
  },
  stepDetails: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    textAlign: 'center',
  },
  lining:{
    flexDirection: 'column'
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00FF00', // Green circle color
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  location: {
    paddingLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  transport: {
    paddingLeft: 10,
    fontSize: 14,
    marginBottom: 5,
  },
  linkContainer: {
    marginTop: 5,
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  lineContainer: {
    width: 2,
    backgroundColor: '#00FF00', // Green line color
    height: 40,
    alignSelf: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#00FF00',
  },
  map: {
    width: Dimensions.get('window').width * 0.9, // 90% of the screen width
    height: 300, // Height of the map
    borderRadius: 12,
    marginBottom: 20,
  },



});