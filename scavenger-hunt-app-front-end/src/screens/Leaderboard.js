import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useTheme, Card } from 'react-native-paper';

const leaderboardData = [
  { id: '1', name: 'Alice', distance: 1325 },
  { id: '2', name: 'Bob', distance: 1120 },
  { id: '3', name: 'Charlie', distance: 980 },
  { id: '4', name: 'Diana', distance: 890 },
  { id: '5', name: 'Ethan', distance: 825 },
];

const Leaderboard = () => {
  const { colors } = useTheme();

  const renderItem = ({ item, index }) => (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}> 
      <View style={styles.cardContent}>
        <Text style={[styles.rank, { color: colors.primary }]}>#{index + 1}</Text>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.distance, { color: colors.text }]}>{item.distance} mi</Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.trophyContainer}>
        <Image source={require('../assets/trophy.png')} style={styles.trophy} />
        <Text style={[styles.title, { color: colors.text }]}>Leaderboard</Text>
      </View>

      <FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    marginTop:20,
  },
  trophyContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trophy: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
  },
  name: {
    fontSize: 18,
    flex: 1,
  },
  distance: {
    fontSize: 18,
    fontWeight: '500',
  },
});
