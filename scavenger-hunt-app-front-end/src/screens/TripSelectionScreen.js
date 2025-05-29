import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, SafeAreaView, Text } from 'react-native';
import { useTheme, Card, Title, Button } from 'react-native-paper';
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
        const response = await axios.get('http://192.168.0.170:5000/get_outputs');
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
          return route.Route.filter((r) => r["Name"]).length;
        };

        const formattedRoutes = data.flatMap((cluster) =>
          cluster.routes.map((route) => ({
            id: `${cluster._id}-${route["Cluster ID"]}`,
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
            locationCount: locationCounter(route),
            image: getFirstValidImage(route),
          }))
        );

        setRoutes(formattedRoutes);
      } catch (error) {
        console.error(error);
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
        <Text style={styles.infoText}>📍 Locations: {item.locationCount}</Text>
        <Text style={styles.infoText}>⏱ Time: {item.estimatedTime} min</Text>
        <Text style={styles.infoText}>📏 Distance: {item.estimatedDistance} km</Text>
        <Text style={styles.infoText}>⭐ Rating: {item.ratings}</Text>
        <Text style={styles.infoText}>🔥 Popularity: {item.popularity}</Text>
      </Card.Content>
      <View style={styles.cardFooter}>
      <Button
        mode="contained"
        onPress={() => openResultScreen(item)}
        style={styles.button}
        labelStyle={styles.buttontext}
      >
        Start
      </Button>
      </View>
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
        data={routes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        renderItem={renderRouteCard}
      />
    </SafeAreaView>
  );
};

export default TripSelectionScreen;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 20,
    borderRadius: 0, // Remove rounded corners
    width: 330,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 0, // Rectangular image
  },
  cardFooter: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  paddingHorizontal: 16,
  paddingBottom: 12,
  marginTop: 8,
},

button: {
  backgroundColor: '#00FF00',
  paddingHorizontal: 5,
  paddingVertical: -5,
  borderRadius: 8,
  minWidth: 70,
  elevation: 2,
},

buttontext: {
  fontSize: 13,
  color: '#000',
  fontWeight: 'bold',
},

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginVertical: 2,
    color: '#fff',
  },
  actions: {
    justifyContent: 'flex-end',
    paddingRight: 16,
    paddingBottom: 10,
  }
});
