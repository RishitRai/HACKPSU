// TripSelectionScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Card } from 'react-native-paper';

// The device window height (used to size cards so they stack vertically)
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Example trip plan data
const TRIP_PLANS = [
  {
    id: '1',
    image: require('../assets/image.png'), // Replace with your images
    title: 'Scenic Beach Escape',
    placesCount: 5,
    estimatedTime: '3 hours',
  },
  {
    id: '2',
    image: require('../assets/image1.webp'),
    title: 'Mountain Adventure',
    placesCount: 7,
    estimatedTime: '5 hours',
  },
  {
    id: '3',
    image: require('../assets/image2.webp'),
    title: 'City Cultural Tour',
    placesCount: 4,
    estimatedTime: '2 hours',
  },
  // Add more trips as needed...
];

const RouteSelectionScreen = () => {
  // Render each card in the FlatList
  const renderTripCard = ({ item }) => {
    return (
      <View style={styles.cardWrapper}>
        <Card style={styles.card}>
          <Image source={item.image} style={styles.cardImage} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>
              {item.placesCount} places | ~{item.estimatedTime}
            </Text>
          </View>
        </Card>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={TRIP_PLANS}
        keyExtractor={(item) => item.id}
        renderItem={renderTripCard}
        // Make each card snap so that it occupies the screen on scroll
        pagingEnabled
        // For a “stacked” look, you can reduce item height. 
        // For truly full screen, use SCREEN_HEIGHT exactly and adjust.
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default RouteSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  // Wrapper for each “page-like” card
  cardWrapper: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.9, // Or use SCREEN_HEIGHT for fully full screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '60%', // Adjust as desired
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
});
