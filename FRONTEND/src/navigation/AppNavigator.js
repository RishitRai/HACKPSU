import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens for navigation
import HomeScreen from '../screens/HomeScreen';
import TripPreferencesScreen from '../screens/TripPreferencesScreen';
import TripSelectionScreen from '../screens/TripSelectionScreen';
import CheckpointChecker from '../screens/CheckpointChecker';
import RouteDetailScreen from '../screens/RouteDetailScreen';
import ResultScreen from '../screens/ResultScreen';
import Leaderboard from '../screens/Leaderboard';
import PreferenceResult from '../screens/PreferenceResult';
import ProfileScren from '../screens/ProfileScreen';
import LocationQuizScreen from '../screens/LocationQuizScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


// Bottom tab navigation (visible at the bottom of main screens)
const BottomTabs = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#000', height: 70 },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarActiveTintColor: '#00FF00',
          headerShown: false, // Hide header above tabs
        }}
      >
        {/* Home tab */}
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />

        {/* Preferences tab */}
        <Tab.Screen
          name="Preferences"
          component={TripPreferencesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />

        {/* Selection tab - shows generated trips */}
        <Tab.Screen
          name="Selection"
          component={TripSelectionScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="format-list-bulleted" size={size} color={color} />
            ),
          }}
        />

        {/* Leaderboard tab */}
        <Tab.Screen
          name="Leaderboard"
          component={Leaderboard}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="emoji-events" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};


// Stack navigator - controls navigation flow between screens
const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Bottom tabs as the main entry point */}
      <Stack.Screen name="Main" component={BottomTabs} />

      {/* Other screens that stack on top of tab screens */}
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
      <Stack.Screen name="PreferenceResult" component={PreferenceResult} />
      <Stack.Screen name="CheckpointChecker" component={CheckpointChecker} />
      <Stack.Screen name="LocationQuiz" component={LocationQuizScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Profile" component={ProfileScren} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

// Optional styles (currently unused)
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
});
