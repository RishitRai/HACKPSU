import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { useTheme, Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const TripSelectionScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const openResultScreen = (trip) => {
    navigation.navigate('Result', { trip });
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get('http://100.64.7.174:5000/get_outputs');
        const data = response.data.outputs;

        const getFirstValidImage = (route) => {
          for (const routeImage of route.Route) {
            if (routeImage["Image URL"]) {
              return { uri: routeImage["Image URL"] };
            }
          }

          return require('../assets/placeholder.jpg');
        };

        const locationCounter = (route) => {
          let locationCount = 0;
          for (const routeLoc of route.Route) {
            if (routeLoc["Name"]) {
              locationCount++;
            }
          }

          return locationCount;
        };

        const formattedRoutes = data.flatMap((cluster) =>
          cluster.routes.map((route) => ({
            id: `${cluster._id}-${route["Cluster ID"]}`, // Unique ID for each route
            name: route["Cluster Name"] || "Unnamed Cluster",
            description: route["Cluster Description"] || "No Description Available",
            estimatedTime: route["Estimated Travel Time (min)"] || "N/A",
            estimatedDistance: route["Estimated Travel Distance (km)"] || "N/A",
            ratings: route["Ratings"] || "N/A",
            popularity: route["Popularity"] || "N/A",
            destinations: route.Route.map((entry) => ({
              name: entry.Name || "Unknown Destination",
              modeOfTransport: entry["Mode of Transport"] || "N/A",
              mapLink: entry["Google Maps Link"] || "N/A",
              lat: parseFloat(entry.Destination?.split(",")[0]),
              lng: parseFloat(entry.Destination?.split(",")[1]),
            })),
            locationCount: locationCounter(route), // Count of locations in the route
            image: getFirstValidImage(route), // Use the function to get the first valid image for this route
          }))
        );

        setRoutes(formattedRoutes);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

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
        <Button mode="contained" onPress={() => openResultScreen(item)} style={styles.button}>
          Start
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.loadingContainer}>
      <FlatList
        data={routes} // Pass the processed routes to FlatList
        keyExtractor={(item) => item.id} // Ensure each route has a unique key
        contentContainerStyle={styles.container}
        renderItem={renderRouteCard} // Render each route using the reusable function
      />
    </SafeAreaView>
  );
};

export default TripSelectionScreen;

const styles = StyleSheet.create({
  image: {
    padding:0,
  },
  container: {
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    resizeMode: 'cover',
    margin: 0,
    padding: 0
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF', // Change this to your preferred color
  },
  button: {
    marginLeft: 'auto',
    borderRadius: 15,
    buttonColor: '#00FF00', // Change this to your preferred color
    textColor: "#000"
  },
});