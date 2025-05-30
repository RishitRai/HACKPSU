// Corrected
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, SafeAreaView, Text } from 'react-native';
import { useTheme, Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
              name: entry.Name || "New Destination",
              mystery: entry["Mystery Name"]|| "Mystical Place",
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
      <Card.Content style={styles.cardContent}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {item.ratings}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={styles.statWithIcon}>
                <Icon name="place" size={18} color="#00FF00" style={styles.statIcon} />
                <Text style={styles.statNumber}>{item.locationCount}</Text>
              </View>
              <Text style={styles.statLabel}>Locations</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statWithIcon}>
                <Icon name="access-time" size={18} color="#FFD700" style={styles.statIcon} />
                <Text style={styles.statNumber}>{item.estimatedTime}</Text>
              </View>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={styles.statWithIcon}>
                <Icon name="straighten" size={18} color="#FF6B6B" style={styles.statIcon} />
                <Text style={styles.statNumber}>{item.estimatedDistance}</Text>
              </View>
              <Text style={styles.statLabel}>Kilometers</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statWithIcon}>
                <Icon name="trending-up" size={18} color="#4ECDC4" style={styles.statIcon} />
                <Text style={styles.statNumber}>{item.popularity}</Text>
              </View>
              <Text style={styles.statLabel}>Popularity</Text>
            </View>
          </View>
        </View>
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
    marginBottom: 40,
    paddingBottom:20,
    borderRadius: 0,
    width: 380,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 0,
    marginBottom: 15
  },
  cardContent: {
    paddingTop: 16,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 34,
  },
  ratingBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statIcon: {
    marginRight: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  popularityContainer: {
    alignItems: 'center',
    width: '100%',
  },
  popularityBar: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  popularityFill: {
    height: '100%',
    backgroundColor: '#00FF00',
    borderRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderRadius: 8,
    minWidth: 70,
    elevation: 2,
  },
  buttontext: {
    fontSize: 13,
    color: '#000',
    fontWeight: 'bold',
  },
});