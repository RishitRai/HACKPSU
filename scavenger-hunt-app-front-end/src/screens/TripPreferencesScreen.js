import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { useNavigation } from '@react-navigation/native'; // ✅ Import navigation

const TRANSPORT_MODES = [
  { mode: 'walking', icon: 'directions-walk' },
  { mode: 'driving', icon: 'drive-eta' },
  { mode: 'biking', icon: 'pedal-bike' },
  { mode: 'bus', icon: 'directions-bus' },
  { mode: 'train', icon: 'train' },
];

const THEME_OPTIONS = [
  { name: 'Attraction', color: '#ff3b30' },
  { name: 'Religious', color: '#c0392b' },
  { name: 'Shopping', color: '#e74c3c' },
  { name: 'Fun', color: '#990000' },
];

const TripPreferencesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation(); // ✅ Use navigation

  const [location, setLocation] = useState('');
  const [isAccessible, setIsAccessible] = useState(false);
  const [radius, setRadius] = useState(10);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [transportModes, setTransportModes] = useState([]);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const toggleTransportMode = (mode) => {
    setTransportModes((prevModes) => {
      if (prevModes.includes(mode)) {
        return prevModes.filter((m) => m !== mode);
      } else if (prevModes.length < 2) {
        return [...prevModes, mode];
      } else {
        return prevModes;
      }
    });
  };

  const handleSavePreferences = () => {
    navigation.navigate('Selection');

  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.header, { color: colors.text }]}>Plan Your Perfect Trip</Text>

        <Text style={[styles.label, { color: colors.text }]}>Location</Text>
        <TextInput
          mode="outlined"
          placeholder="Search for location..."
          value={location}
          onChangeText={setLocation}
          textColor={colors.text}
          placeholderTextColor="#aaa"
          style={[styles.searchInput, { color: colors.text }]}
        />

        <Divider style={styles.divider} />

        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: colors.text }]}>Accessibility</Text>
          <View style={styles.switchContainer}>
            <MaterialIcons
              name={isAccessible ? 'accessible-forward' : 'not-accessible'}
              size={24}
              style={{ marginRight: 10 }}
              color={isAccessible ? colors.primary : '#888'}
            />
            <Switch
              value={isAccessible}
              onValueChange={() => setIsAccessible(!isAccessible)}
              color={colors.primary}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        <Text style={[styles.label, { color: colors.text }]}>Search Radius</Text>
        <View style={styles.radiusRow}>
          <Text style={[styles.radiusValue, { color: colors.text }]}>{radius} miles</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={250}
            step={1}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.placeholder}
            value={radius}
            onValueChange={(val) => setRadius(val)}
          />
        </View>

        <Divider style={styles.divider} />

        <Text style={[styles.label, { color: colors.text }]}>Duration</Text>

        <View style={styles.stepperRow}>
          <Text style={[styles.label, { color: colors.text }]}>Hours</Text>
          <View style={styles.stepperControls}>
            <IconButton icon="minus" onPress={() => setHours(prev => Math.max(0, prev - 1))} style={styles.stepperButton} />
            <Text style={[styles.stepperValue, { color: colors.text }]}>{hours}</Text>
            <IconButton icon="plus" onPress={() => setHours(prev => prev + 1)} style={styles.stepperButton} />
          </View>
        </View>

        <View style={styles.stepperRow}>
          <Text style={[styles.label, { color: colors.text }]}>Minutes</Text>
          <View style={styles.stepperControls}>
            <IconButton icon="minus" onPress={() => setMinutes(prev => Math.max(0, prev - 5))} style={styles.stepperButton} />
            <Text style={[styles.stepperValue, { color: colors.text }]}>{minutes}</Text>
            <IconButton icon="plus" onPress={() => setMinutes(prev => (prev < 59 ? prev + 5 : 59))} style={styles.stepperButton} />
          </View>
        </View>

        <Text style={[styles.durationSummary, { color: colors.text }]}>
          Total Duration: {hours} hr{hours !== 1 ? 's' : ''} {minutes} min
        </Text>

        <Divider style={styles.divider} />

        <Text style={[styles.label, { color: colors.text }]}>Choose a Theme</Text>
        <View style={styles.themeContainer}>
          {THEME_OPTIONS.map(({ name, color }, idx) => {
            const isSelected = color === selectedTheme;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedTheme(color)}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: color,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: isSelected ? '#ffffff' : 'transparent',
                  },
                ]}
              >
                <Text style={styles.themeName}>{name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Divider style={styles.divider} />

        <Text style={[styles.label, { color: colors.text }]}>Transport Mode (max 2)</Text>
        <View style={styles.transportModes}>
          {TRANSPORT_MODES.map(({ mode, icon }) => {
            const isSelected = transportModes.includes(mode);
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => toggleTransportMode(mode)}
                style={[
                  styles.transportButton,
                  { borderColor: isSelected ? colors.primary : '#ccc' },
                ]}
              >
                <MaterialIcons
                  name={icon}
                  size={32}
                  color={isSelected ? colors.primary : colors.text}
                />
                <Text style={[styles.transportLabel, { color: colors.text }]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={handleSavePreferences} 
          style={styles.submitButton}
          labelStyle={{ fontWeight: '600' }}
          buttonColor={colors.primary}
        >
          Save Preferences
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripPreferencesScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {},
  scrollContent: { paddingHorizontal: 16, paddingTop: 25, paddingBottom: 30 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'left' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  searchInput: { borderRadius: 25 },
  divider: { marginVertical: 16 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchContainer: { flexDirection: 'row', alignItems: 'center' },
  radiusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  radiusValue: { fontSize: 16, marginRight: 10, fontWeight: '500', width: 90 },
  slider: { flex: 1 },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepperControls: { flexDirection: 'row', alignItems: 'center' },
  stepperButton: { marginHorizontal: 0 },
  stepperValue: { fontSize: 18, marginHorizontal: 8, width: 40, textAlign: 'center' },
  themeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  themeButton: {
    width: '30%',
    aspectRatio: 3.5,
    borderRadius: 50,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeName: { color: '#fff', fontWeight: '600' },
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
  transportLabel: { fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
  submitButton: { marginTop: 20, borderRadius: 20, paddingVertical: 6 },
  durationSummary: { fontSize: 14, fontWeight: '500', marginTop: 8 },
});
