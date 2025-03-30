import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { useTheme, Button, Snackbar } from 'react-native-paper';

const ResultScreen = () => {
  const route = useRoute();
  const { trip } = route.params || {};
  const { colors } = useTheme();

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  if (!trip || !trip.coordinates || trip.coordinates.length < 1) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: 56 }]}>
        <Text style={[styles.header, { color: colors.text }]}>Trip data not available.</Text>
      </View>
    );
  }

  const { title, duration, coordinates, image } = trip;

  const handleCheckIn = () => {
    setSnackbarVisible(true);
    console.log(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: 56 }]}>
      <Image source={image} style={styles.image} />

      <Text style={[styles.header, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.detailText, { color: colors.text }]}>Duration: {duration}</Text>
      <Text style={[styles.detailText, { color: colors.text }]}>City: New York</Text>

      <View style={styles.locationList}>
        {coordinates.map((loc, index) => (
          <Text key={index} style={[styles.locationItem, { color: colors.text }]}>
            • {loc.name}
          </Text>
        ))}
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coordinates[0].latitude,
          longitude: coordinates[0].longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {coordinates.map((loc, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description="New York"
          />
        ))}

        <Polyline
          coordinates={coordinates.map((loc) => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
          }))}
          strokeColor="#00FF00"
          strokeWidth={4}
        />
      </MapView>

      <Button
        mode="contained"
        buttonColor="#00FF00"
        textColor="#000"
        onPress={handleCheckIn}
        style={styles.checkInButton}
      >
        Check In
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: 'red' }}
      >
        Check-in unsuccessful
      </Snackbar>
    </View>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 56,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 4,
  },
  locationList: {
    marginBottom: 12,
  },
  locationItem: {
    fontSize: 14,
    marginBottom: 2,
    marginLeft: 10,
  },
  map: {
    width: Dimensions.get('window').width - 32,
    height: 300,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'center',
  },
  checkInButton: {
    marginTop: 20,
    borderRadius: 15,
    alignSelf: 'center',
    width: 150,
  },
});
