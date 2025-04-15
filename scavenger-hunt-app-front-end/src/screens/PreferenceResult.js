import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTheme, Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

const TripSelectionScreen = ({ }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { outp } = useRoute().params; // Extract data passed from TripPreferencesScreen

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract the first valid image from a route
  const getFirstValidImage = (route) => {
    for (const entry of route.Route || []) {
      if (entry["Image URL"]) {
        return { uri: entry["Image URL"] };
      }
    }
    return require('../assets/placeholder.jpg'); // Fallback image
  };

  // Count the number of locations in a route
  const locationCounter = (route) => {
    return route.Route?.filter((loc) => loc["Name"]).length || 0;
  };

  // Format the received response into usable route objects
  useEffect(() => {
    const formatRoutes = () => {
      try {
        const formattedRoutes = outp.map((cluster) => ({
          id: cluster["Cluster ID"],
          name: cluster["Cluster Name"] || "Unnamed Cluster",
          description: cluster["Cluster Description"] || "No Description Available",
          estimatedTime: cluster["Estimated Travel Time (min)"] || "N/A",
          estimatedDistance: cluster["Estimated Travel Distance (km)"] || "N/A",
          ratings: cluster["Ratings"] || "0.0",
          popularity: cluster["Popularity"] || "0",
          destinations: cluster.Route.map((entry) => ({
            name: entry.Name || "Unknown Destination",
            modeOfTransport: entry["Mode of Transport"] || "N/A",
            mapLink: entry["Google Maps Link"] || "N/A",
            lat: parseFloat(entry.Destination?.split(",")[0]),
            lng: parseFloat(entry.Destination?.split(",")[1]),
          })),
          locationCount: locationCounter(cluster),
          image: getFirstValidImage(cluster), // Use the first valid image or placeholder
        }));

        setRoutes(formattedRoutes); // Set formatted routes in state
      } catch (error) {
        console.error('Error formatting routes:', error);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    formatRoutes();
  }, [outp]); // Run whenever outp changes

  // Navigate to the Result screen with selected trip details
  const openResultScreen = (trip) => {
    navigation.navigate('Result', { trip });
  };

  // Render a single route card
  const renderRouteCard = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Cover source={item.image} style={styles.cardImage} />
      <Card.Content>
        <Title style={[styles.title, { color: colors.text }]}>{item.name}</Title>
        <Paragraph style={{ color: colors.text }}>Number of Locations: {item.locationCount}</Paragraph>
        <Paragraph style={{ color: colors.text }}>Estimated Time: {item.estimatedTime} min</Paragraph>
        <Paragraph style={{ color: colors.text }}>Estimated Distance: {item.estimatedDistance} km</Paragraph>
        <Paragraph style={{ color: colors.text }}>Ratings: {item.ratings}</Paragraph>
        <Paragraph style={{ color: colors.text }}>Popularity: {item.popularity}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => openResultScreen(item)}
          style={styles.button}
        >
          Start
        </Button>
      </Card.Actions>
    </Card>
  );

  // Show loading spinner while formatting routes
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Render routes or fallback if no routes are found
  return (
    <SafeAreaView style={styles.container}>
      {routes.length > 0 ? (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={renderRouteCard}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Title style={[styles.noDataText, { color: colors.text }]}>No Routes Found</Title>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TripSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button: {
    marginLeft: 'auto',
    borderRadius: 10,
  },
});