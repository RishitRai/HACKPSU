// src/navigation/AppNavigator.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Import your screens
import TripPreferencesScreen from '../screens/TripPreferencesScreen';  // 1st Page
import TripSelectionScreen from '../screens/TripSelectionScreen';      // 2nd Page
import TripsScreen from '../screens/TripsScreen';                      // 3rd Page
import RouteDetailScreen from '../screens/RouteDetailScreen';          // Opens when user clicks on a route
import ResultScreen from "../screens/ResultScreen";                  // “Final” or “results” screen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Example floating button
const FloatingButton = () => {
  return (
    <FAB
      style={styles.fab}
      icon="camera"
      color="white"
      onPress={() => alert('Capture Route Feature Coming Soon!')}
    />
  );
};

// Bottom Tab Navigator
const BottomTabs = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#fff', height: 70 },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarActiveTintColor: '#6A0DAD',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Preferences"
          component={TripPreferencesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Selection"
          component={TripSelectionScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="format-list-bulleted" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Trips"
          component={TripsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="map" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <FloatingButton />
    </View>
  );
};

// Stack Navigator (Wraps Bottom Tabs + Other Screens)
const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tab-based navigation */}
      <Stack.Screen name="Main" component={BottomTabs} />

      {/* Additional screens accessible via navigate() */}
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

// Styles
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80, // Adjust so it sits above the tab bar
    alignSelf: 'center',
    backgroundColor: '#6A0DAD',
  },
});
