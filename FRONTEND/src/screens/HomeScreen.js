import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme, Card } from 'react-native-paper';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { MaterialIcons } from '@expo/vector-icons';

// Get screen width for layout calculations
const screenWidth = Dimensions.get('window').width;

// Home screen displaying activity summary, stats, and earned badges
const HomeScreen = () => {
  const { colors } = useTheme(); // Use theme to adapt to dark/light mode

  // List of badge images
  const badges = [
    require('../assets/Badge1.png'),
    require('../assets/Badge2.png'),
    require('../assets/Badge3.png'),
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, marginTop: 45 }]}>
      
      {/* Profile Icon (top-right) */}
      <View style={styles.profileRow}>
        <TouchableOpacity onPress={() => {}}>
          <View style={styles.profileIconCircle}>
            <MaterialIcons name="person" size={26} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Page Title */}
      <Text style={[styles.header, { color: colors.text }]}>  Home  </Text>

      {/* Activity Rings Section */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.activityText, { color: colors.text }]}>Your Activity</Text>
          
          <View style={styles.ringsRow}>
            {/* Animated progress rings (concentric) */}
            <View style={styles.ringsContainer}>
              <AnimatedCircularProgress
                size={180}
                width={16}
                fill={80}
                tintColor="#FF3B30" // Red ring
                backgroundColor="#3c3c3c"
                rotation={0}
                lineCap="round"
                style={styles.ring}
              />
              <AnimatedCircularProgress
                size={140}
                width={16}
                fill={60}
                tintColor="#4CD964" // Green ring
                backgroundColor="#2c2c2c"
                rotation={0}
                lineCap="round"
                style={styles.ring}
              />
              <AnimatedCircularProgress
                size={100}
                width={16}
                fill={40}
                tintColor="#5AC8FA" // Blue ring
                backgroundColor="#1e1e1e"
                rotation={0}
                lineCap="round"
                style={styles.ring}
              />
            </View>

            {/* Legend describing each ring */}
            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendTextItem, { color: '#FF3B30' }]}>Miles Covered</Text>
              <Text style={[styles.legendTextItem, { color: '#4CD964' }]}>Places Visited</Text>
              <Text style={[styles.legendTextItem, { color: '#5AC8FA' }]}>Badges</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Miles Covered Summary */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.subHeader, { color: colors.text }]}>Miles Covered</Text>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>920</Text>
            <Text style={styles.metricNote}>You're doing great! 🎉</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Badge Gallery */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.subHeader, { color: colors.text }]}>Badges</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {badges.map((badge, index) => (
              <Image key={index} source={badge} style={styles.badgeImage} />
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default HomeScreen;

// Styles for HomeScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  // Top row with profile icon
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 4,
  },

  // Circle background for profile icon
  profileIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A9A9A9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },

  card: {
    elevation: 10,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },

  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  activityText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
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
    marginVertical: 10,
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
