import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const trips = [
  {
    id: 1,
    title: 'Sunset Beach Walk',
    duration: '30 min',
    location: 'Santa Monica',
    image: require('../assets/image2.webp'),
  },
  {
    id: 2,
    title: 'Historic City Tour',
    duration: '45 min',
    location: 'Downtown',
    image: require('../assets/image1.webp'),
  },
  {
    id: 3,
    title: 'Nature Escape',
    duration: '60 min',
    location: 'Griffith Park',
    image: require('../assets/image.png'),
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
      <Text style={[styles.header, { color: colors.text }]}>Select a Trip</Text>

      {trips.map((trip) => (
        <View key={trip.id} style={[styles.tripContainer, { backgroundColor: colors.surface }]}>
          <Image
            source={trip.image}
            style={styles.image}
          />
          <Text style={[styles.title, { color: colors.text }]}>{trip.title}</Text>
          <Text style={{ color: colors.text }}>Duration: {trip.duration}</Text>
          <Text style={{ color: colors.text }}>Location: {trip.location}</Text>
          
          <Button
            buttonColor="#00FF00"
            textColor="#000"
            onPress={() => openResultScreen(trip)}
            style={[styles.button, { borderRadius: 15 }]} // Less rounded corners
          >
            Start
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
    height: 200, // Adjust as necessary
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  button: {
    marginTop: 10,
    alignSelf: 'flex-end', // Align button to the right
    width: 100, // Make the button short
    
  },
});
