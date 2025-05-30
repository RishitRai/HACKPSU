// src/screens/RouteDetailScreen.js

import React from 'react';
import { View, ScrollView, Text, Image, StyleSheet } from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';

const RouteDetailScreen = () => {
  const { colors } = useTheme(); 
  const navigation = useNavigation();
  const { params } = useRoute();
  const { item } = params || {}; // route data passed from previous screen

 
  if (!item) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No route data found.</Text>
      </View>
    );
  }

  // Destructure route details from the item
  const {
    title,
    description,
    imageUrl,
    distance,
    duration,
    stops, 
  } = item;

  const handleStartRoute = () => {
    alert(`Starting route: ${title}`);
  
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* Show route image if available, or a placeholder if not */}
      {imageUrl ? (
        <Card style={styles.imageCard}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </Card>
      ) : (
        <Card style={styles.imagePlaceholder}>
          <Text style={{ color: '#999', fontStyle: 'italic' }}>
            No image available
          </Text>
        </Card>
      )}

      <View style={styles.content}>
        
        {/* Main title and quick info */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subInfo}>
          Distance: {distance} • Duration: {duration}
        </Text>

        <Divider style={styles.divider} />

        {/* Route description */}
        <Text style={styles.sectionHeader}>Description</Text>
        <Text style={styles.description}>{description}</Text>

        <Divider style={styles.divider} />

        {/* Show list of stops, if provided */}
        {stops?.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Stops</Text>
            {stops.map((stop, index) => (
              <View key={`stop-${index}`} style={styles.stopContainer}>
                <Text style={styles.stopTitle}>{stop.name}</Text>
                {stop.description && (
                  <Text style={styles.stopDescription}>{stop.description}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Button to start the route */}
        <Button
          mode="contained"
          onPress={handleStartRoute}
          style={styles.startButton}
          labelStyle={{ fontWeight: 'bold', color: '#000' }}
          buttonColor="#39FF14" // neon green
        >
          Start Route
        </Button>
      </View>
    </ScrollView>
  );
};

export default RouteDetailScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  imageCard: {
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    margin: 10,
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
    color: '#333',
  },
  stopContainer: {
    marginVertical: 8,
    paddingLeft: 10,
    borderLeftColor: '#6A0DAD',
    borderLeftWidth: 3,
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stopDescription: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  startButton: {
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
