// src/screens/TripsScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, Card, Button } from 'react-native-paper';

const previousTrips = [
  { id: 1, title: 'Morning Walk', date: 'Mar 10, 2025', status: 'Completed' },
  { id: 2, title: 'Park Jog', date: 'Mar 12, 2025', status: 'Missed' },
  { id: 3, title: 'Mountain Hike', date: 'Mar 15, 2025', status: 'Completed' },
];

const TripsScreen = () => {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Your Trips</Text>
      {previousTrips.map((trip) => (
        <Card key={trip.id} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title title={trip.title} titleStyle={{ color: colors.text }} />
          <Card.Content>
            <Text style={{ color: colors.text }}>Date: {trip.date}</Text>
            <Text style={{ color: trip.status === 'Completed' ? colors.primary : '#ff4d4d' }}>
              Status: {trip.status}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

export default TripsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
});
