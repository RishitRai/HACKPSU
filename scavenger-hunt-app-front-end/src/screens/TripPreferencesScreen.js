// src/screens/TripPreferencesScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  TextInput,
  Switch,
  Button,
  useTheme,
  Divider,
  IconButton,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';

// Example transport modes and icons
const TRANSPORT_MODES = [
  { mode: 'walking', icon: 'directions-walk' },
  { mode: 'driving', icon: 'drive-eta' },
  { mode: 'biking', icon: 'pedal-bike' },
  { mode: 'bus', icon: 'directions-bus' },
  { mode: 'train', icon: 'train' },
];

// Dummy theme options (name + color)
const THEME_OPTIONS = [
  { name: 'Sunset', color: '#F94144' },
  { name: 'Tangerine', color: '#F3722C' },
  { name: 'Golden', color: '#F9C74F' },
  { name: 'Meadow', color: '#90BE6D' },
  { name: 'Teal Dream', color: '#43AA8B' },
  { name: 'Deep Blue', color: '#577590' },
];

const TripPreferencesScreen = () => {
  const { colors } = useTheme();

  // State for location search
  const [location, setLocation] = useState('');

  // Accessibility Toggle (Yes/No)
  const [isAccessible, setIsAccessible] = useState(false);

  // Radius Slider
  const [radius, setRadius] = useState(10);
  const [distanceUnit, setDistanceUnit] = useState('km'); // 'km' or 'miles'

  // Measurement Type Toggle (Time / Distance)
  const [isTimeSelected, setIsTimeSelected] = useState(true);

  // Time or Distance Input (based on measurement type)
  const [timeDistanceValue, setTimeDistanceValue] = useState(30);

  // Selected Theme
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Selected Transport Mode
  const [transportMode, setTransportMode] = useState('walking');

  // Numeric stepper logic
  const incrementValue = () =>
    setTimeDistanceValue((prev) => (prev < 999 ? prev + 1 : prev));
  const decrementValue = () =>
    setTimeDistanceValue((prev) => (prev > 0 ? prev - 1 : prev));

  // Theme selection handler
  const handleSelectTheme = (color) => setSelectedTheme(color);

  // Transport mode selection handler
  const handleSelectTransportMode = (mode) => setTransportMode(mode);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Header */}
        <Text style={styles.header}>Plan Your Perfect Trip</Text>

        {/* Location Input */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          mode="outlined"
          placeholder="Search for location..."
          value={location}
          onChangeText={setLocation}
          style={styles.searchInput}
        />

        <Divider style={styles.divider} />

        {/* Accessibility Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Accessibility</Text>
          <View style={styles.switchContainer}>
            <MaterialIcons
              name={isAccessible ? 'accessible-forward' : 'not-accessible'}
              size={24}
              style={{ marginRight: 10 }}
              color={isAccessible ? '#6A0DAD' : '#888'}
            />
            <Switch
              value={isAccessible}
              onValueChange={() => setIsAccessible(!isAccessible)}
              color="#6A0DAD"
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Radius Slider */}
        <Text style={styles.label}>Search Radius</Text>
        <View style={styles.radiusRow}>
          <Text style={styles.radiusValue}>
            {radius} {distanceUnit}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={50}
            step={1}
            minimumTrackTintColor="#6A0DAD"
            maximumTrackTintColor="#ddd"
            value={radius}
            onValueChange={(val) => setRadius(val)}
          />
        </View>
        {/* Unit Selector */}
        <View style={styles.unitSelector}>
          <Button
            mode={distanceUnit === 'km' ? 'contained' : 'outlined'}
            onPress={() => setDistanceUnit('km')}
          >
            KM
          </Button>
          <Button
            mode={distanceUnit === 'miles' ? 'contained' : 'outlined'}
            onPress={() => setDistanceUnit('miles')}
          >
            Miles
          </Button>
        </View>

        <Divider style={styles.divider} />

        {/* Measurement Type Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Measure By</Text>
          <View style={styles.switchContainer}>
            <MaterialIcons
              name={isTimeSelected ? 'timer' : 'distance'}
              size={24}
              style={{ marginRight: 10 }}
              color={isTimeSelected ? '#6A0DAD' : '#888'}
            />
            <Switch
              value={isTimeSelected}
              onValueChange={() => setIsTimeSelected(!isTimeSelected)}
              color="#6A0DAD"
            />
          </View>
        </View>

        {/* Numeric Stepper */}
        <View style={styles.stepperRow}>
          <Text style={styles.label}>
            {isTimeSelected ? 'Time (minutes)' : 'Distance (km)'}
          </Text>
          <View style={styles.stepperControls}>
            <IconButton
              icon="minus"
              onPress={decrementValue}
              style={styles.stepperButton}
            />
            <Text style={styles.stepperValue}>{timeDistanceValue}</Text>
            <IconButton
              icon="plus"
              onPress={incrementValue}
              style={styles.stepperButton}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Theme Selection */}
        <Text style={styles.label}>Choose a Theme</Text>
        <View style={styles.themeContainer}>
          {THEME_OPTIONS.map(({ name, color }, idx) => {
            const isSelected = color === selectedTheme;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelectTheme(color)}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: color,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: isSelected ? '#333' : 'transparent',
                  },
                ]}
              >
                <Text style={styles.themeName}>{name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Divider style={styles.divider} />

        {/* Transport Mode Selection */}
        <Text style={styles.label}>Transport Mode</Text>
        <View style={styles.transportModes}>
          {TRANSPORT_MODES.map(({ mode, icon }) => {
            const isSelected = mode === transportMode;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => handleSelectTransportMode(mode)}
                style={[
                  styles.transportButton,
                  { borderColor: isSelected ? '#6A0DAD' : '#ccc' },
                ]}
              >
                <MaterialIcons
                  name={icon}
                  size={32}
                  color={isSelected ? '#6A0DAD' : '#333'}
                />
                <Text style={styles.transportLabel}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Preferences Button */}
        <Button
          mode="contained"
          onPress={() => Alert.alert('Preferences saved!')}
          style={styles.submitButton}
          labelStyle={{ fontWeight: '600' }}
        >
          Save Preferences
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripPreferencesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContainer: {},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 25, // Reduced from 30 to shift upward by 5 pixels
    paddingBottom: 30,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  searchInput: {
    borderRadius: 25,
  },
  divider: {
    marginVertical: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radiusValue: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: '500',
    width: 90,
  },
  slider: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 150,
    marginTop: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    marginHorizontal: 0,
  },
  stepperValue: {
    fontSize: 18,
    marginHorizontal: 8,
    width: 40,
    textAlign: 'center',
  },
  themeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeButton: {
    width: '30%',
    aspectRatio: 3.5,
    borderRadius: 50,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeName: {
    color: '#fff',
    fontWeight: '600',
  },
  transportModes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'space-around',
  },
  transportButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportLabel: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 20,
    paddingVertical: 6,
  },
});
