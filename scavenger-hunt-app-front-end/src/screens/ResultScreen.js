import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';

const ResultScreen = ({ route }) => {
  const { colors } = useTheme();
  const { trip } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={trip.image} style={styles.image} />
      <Text style={[styles.title, { color: colors.text }]}>{trip.title}</Text>
      <Text style={[styles.info, { color: colors.text }]}>Duration: {trip.duration}</Text>
      <Text style={[styles.info, { color: colors.text }]}>Location: {trip.location}</Text>
      <Text style={[styles.details, { color: colors.text }]}>Enjoy your journey and stay safe!</Text>
    </View>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
});