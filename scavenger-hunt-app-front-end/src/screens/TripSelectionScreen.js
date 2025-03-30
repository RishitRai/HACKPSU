import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const trips = [
  {
    id: 1,
    title: 'Brooklyn Bridge, Manhattan & Empire State Building',
    duration: '3.5 hours',
    location: 'Brooklyn Bridge, Manhattan, Empire State Building ',
    image: require('../assets/image2.webp'),
    coordinates: [
      { name: 'Brooklyn Bridge', latitude: 40.7061, longitude: -73.9969 },
      { name: 'Manhattan', latitude: 40.7831, longitude: -73.9712 },
      { name: 'Empire State Building', latitude: 40.7484, longitude: -73.9857 },
    ],
  },
  {
    id: 2,
    title: 'Central Park, Times Square & Rockefeller Center',
    duration: '3 hours',
    location: 'Central Park, Times Square, Rockefeller Center ',
    image: require('../assets/image1.webp'),
    coordinates: [
      { name: 'Central Park', latitude: 40.7851, longitude: -73.9683 },
      { name: 'Times Square', latitude: 40.7580, longitude: -73.9855 },
      { name: 'Rockefeller Center', latitude: 40.7587, longitude: -73.9787 },
    ],
  },
  {
    id: 3,
    title: 'Battery Park, Statue of Liberty & Ellis Island',
    duration: '4 hours',
    location: 'Battery Park, Statue of Liberty, Ellis Island ',
    image: require('../assets/image.png'),
    coordinates: [
      { name: 'Battery Park', latitude: 40.7033, longitude: -74.0170 },
      { name: 'Statue of Liberty', latitude: 40.6892, longitude: -74.0445 },
      { name: 'Ellis Island', latitude: 40.6995, longitude: -74.0396 },
    ],
  },
];

const TripSelectionScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const openResultScreen = (trip) => {
    navigation.navigate('Result', { trip });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Select a New York Route</Text>

      {trips.map((trip) => (
        <View key={trip.id} style={[styles.tripContainer, { backgroundColor: colors.surface }]}>
          <Image source={trip.image} style={styles.image} />
          <Text style={[styles.title, { color: colors.text }]}>{trip.title}</Text>
          <Text style={{ color: colors.text }}>Duration: {trip.duration}</Text>
          <Text style={{ color: colors.text }}>Locations: {trip.location}</Text>

          <Button
            buttonColor="#00FF00"
            textColor="#000"
            onPress={() => openResultScreen(trip)}
            style={[styles.button, { borderRadius: 15 }]}
          >
            Preview
          </Button>
        </View>
      ))}
    </ScrollView>
  );
};

export default TripSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tripContainer: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  button: {
    marginTop: 10,
    alignSelf: 'flex-end',
    width: 100,
  },
});
