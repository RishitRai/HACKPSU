import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import TripPreferencesScreen from '../screens/TripPreferencesScreen';
import TripSelectionScreen from '../screens/TripSelectionScreen';
import CheckpointChecker from '../screens/CheckpointChecker';
import RouteDetailScreen from '../screens/RouteDetailScreen';
import ResultScreen  from '../screens/ResultScreen';
import Leaderboard from '../screens/Leaderboard';
import PreferenceResult from '../screens/PreferenceResult';
import LocationQuizScreen from '../screens/LocationQuizScreen';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const BottomTabs = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#000', height: 70 },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarActiveTintColor: '#00FF00',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
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



const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
      <Stack.Screen name = "PreferenceResult" component={PreferenceResult} />
      <Stack.Screen name="CheckpointChecker" component={CheckpointChecker} />
      <Stack.Screen name="LocationQuiz" component={LocationQuizScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#ff3b30',
  },
});
