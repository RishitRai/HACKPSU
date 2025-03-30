import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { useTheme, Card, Button } from 'react-native-paper';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const badges = [
    'https://via.placeholder.com/80/ff3b30/ffffff?text=B1',
    'https://via.placeholder.com/80/ff3b30/ffffff?text=B2',
    'https://via.placeholder.com/80/ff3b30/ffffff?text=B3',
    'https://via.placeholder.com/80/ff3b30/ffffff?text=B4',
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, marginTop: 45 }]}>
  {/* "Home" title outside the first card */}
  <Text style={[styles.header, { color: colors.text, marginTop: 5 }]}>Home</Text>

  {/* CARD 1: Activity Rings */}
  <Card style={[styles.card, { backgroundColor: colors.surface }]}>
    <Card.Content>
      {/* Add Your Activity Text Above the Rings */}
      <Text style={[styles.activityText, { color: colors.text }]}>Your Activity</Text>

      <View style={styles.ringsRow}>
        {/* Left: Rings */}
        <View style={styles.ringsContainer}>
          <AnimatedCircularProgress
            size={180}
            width={16}
            fill={80}
            tintColor="#FF3B30"
            backgroundColor="#3c3c3c"
            rotation={0}
            lineCap="round"
            style={styles.ring}
          />
          <AnimatedCircularProgress
            size={140}
            width={16}
            fill={60}
            tintColor="#4CD964"
            backgroundColor="#2c2c2c"
            rotation={0}
            lineCap="round"
            style={styles.ring}
          />
          <AnimatedCircularProgress
            size={100}
            width={16}
            fill={40}
            tintColor="#5AC8FA"
            backgroundColor="#1e1e1e"
            rotation={0}
            lineCap="round"
            style={styles.ring}
          />
        </View>

        {/* Right: Text Legend */}
        <View style={styles.legendTextContainer}>
          <Text style={[styles.legendTextItem, { color: '#FF3B30' }]}>Miles Covered</Text>
          <Text style={[styles.legendTextItem, { color: '#4CD964' }]}>Places Visited</Text>
          <Text style={[styles.legendTextItem, { color: '#5AC8FA' }]}>Badges</Text>
        </View>
      </View>
    </Card.Content>
  </Card>

  {/* CARD 2: Miles Covered */}
  <Card style={[styles.card, { backgroundColor: colors.surface }]}>
    <Card.Content>
      <Text style={[styles.subHeader, { color: colors.text }]}>Miles Covered</Text>
      <View style={styles.metricBox}>
        <Text style={styles.metricValue}>8,256</Text>
        <Text style={styles.metricNote}>You're doing great! 🎉</Text>
      </View>
    </Card.Content>
  </Card>

  {/* CARD 3: Badges */}
  <Card style={[styles.card, { backgroundColor: colors.surface }]}>
    <Card.Content>
      <Text style={[styles.subHeader, { color: colors.text }]}>Badges</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
        {badges.map((badge, index) => (
          <Image key={index} source={{ uri: badge }} style={styles.badgeImage} />
        ))}
      </ScrollView>
    </Card.Content>
  </Card>
</ScrollView>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    elevation: 10,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20, // pushed down by 7 pixels
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  activityText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20, // Adjust the space between "Your Activity" and the rings
    textAlign: 'left',
  },
  
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ringsContainer: {
    width: 250,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -30,
  },
  ring: {
    position: 'absolute',
  },
  legendTextContainer: {
    justifyContent: 'center',
    marginLeft: -10,
  },
  legendTextItem: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 10, // spacing between legend items
  },
  metricBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  metricNote: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 4,
  },
  badgeScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badgeImage: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 40,
  },
});


export default HomeScreen;
