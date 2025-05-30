import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { useTheme, Card, Title, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Main screen that displays a list of trip route options
const TripSelectionScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { outp } = useRoute().params; // Get data passed from TripPreferencesScreen

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the first valid image URL from a route (fallback to placeholder if none)
  const getFirstValidImage = (route) => {
    for (const entry of route.Route || []) {
      if (entry["Image URL"]) return { uri: entry["Image URL"] };
    }
    return require('../assets/placeholder.jpg'); // Default placeholder image
  };

  // Count number of valid locations in a route
  const locationCounter = (route) => {
    return route.Route?.filter((loc) => loc["Name"]).length || 0;
  };

  // Format the received `outp` data into structured trip objects
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
            mystery: entry["Mystery Name"] || "Mystical Place",
            modeOfTransport: entry["Mode of Transport"] || "N/A",
            mapLink: entry["Google Maps Link"] || "N/A",
            lat: parseFloat(entry.Destination?.split(",")[0]),
            lng: parseFloat(entry.Destination?.split(",")[1]),
          })),
          locationCount: locationCounter(cluster),
          image: getFirstValidImage(cluster),
        }));

        setRoutes(formattedRoutes);
      } catch (error) {
        console.error('Error formatting routes:', error);
      } finally {
        setLoading(false); // Hide spinner once formatting is done
      }
    };

    formatRoutes();
  }, [outp]);

  // Navigate to the Result screen with the selected trip
  const openResultScreen = (trip) => {
    navigation.navigate('Result', { trip });
  };

  // Renders each trip card in the list
  const renderRouteCard = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Cover source={item.image} style={styles.cardImage} />
      <Card.Content style={styles.cardContent}>
        {/* Title and rating */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {item.ratings}</Text>
          </View>
        </View>

        {/* Travel stats: locations, time, distance, popularity */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Stat label="Locations" value={item.locationCount} icon="place" color="#00FF00" />
            <Stat label="Minutes" value={item.estimatedTime} icon="access-time" color="#FFD700" />
          </View>
          <View style={styles.statRow}>
            <Stat label="Kilometers" value={item.estimatedDistance} icon="straighten" color="#FF6B6B" />
            <Stat label="Popularity" value={item.popularity} icon="trending-up" color="#4ECDC4" />
          </View>
        </View>
      </Card.Content>

      {/* Start trip button */}
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

  // Show loading spinner while processing
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Render trip list or fallback message
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

// Component for reusable stat row items
const Stat = ({ label, value, icon, color }) => (
  <View style={styles.statItem}>
    <View style={styles.statWithIcon}>
      <Icon name={icon} size={18} color={color} style={styles.statIcon} />
      <Text style={styles.statNumber}>{value}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Styles for the component UI
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
  cardContent: {
    paddingBottom: 10,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingBadge: {
    backgroundColor: '#444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 5,
  },
  statNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  cardFooter: {
    padding: 10,
    alignItems: 'flex-end',
  },
  button: {
    borderRadius: 10,
  },
  buttontext: {
    fontWeight: 'bold',
  },
});
