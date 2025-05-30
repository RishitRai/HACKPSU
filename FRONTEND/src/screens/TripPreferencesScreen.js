import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
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
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

// List of available transport modes with their corresponding icons
const TRANSPORT_MODES = [
  { mode: 'walking', icon: 'directions-walk' },
  { mode: 'bicycling', icon: 'pedal-bike' },
  { mode: 'transit', icon: 'directions-bus' },
  { mode: 'driving', icon: 'drive-eta' },
];

// Theme options the user can pick from
const THEME_OPTIONS = [
  { name: 'Attraction', value: 'attraction' },
  { name: 'Religious', value: 'religious' },
  { name: 'Shopping', value: 'shopping' },
  { name: 'Entertainment', value: 'entertainment' },
];

const TripPreferencesScreen = ({ navigation: propNavigation }) => {
  const { colors } = useTheme();
  const hookNavigation = useNavigation();
  const navigation = propNavigation || hookNavigation;

  // Form state
  const [address, setAddress] = useState('');
  const [keyword, setKeyword] = useState([]);
  const [radius, setRadius] = useState(10);
  const [accessibility, setAccessibility] = useState(false);
  const [modes, setModes] = useState([]);
  const [useCurrentAddress, setUseCurrentAddress] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const convertToMinutes = (h, m) => h * 60 + m;

  // Sends request to backend to compute new routes
  const sendPostRequest = async (parameters) => {
    try {
      const response = await axios.post('http://192.168.0.170:5000/optimize_route', parameters, { timeout: 60000 });
      if (response?.data?.routes) {
        return { routes: response.data.routes };
      }
      Alert.alert('Error', 'Failed to fetch data from the server. Please try again.');
      return { routes: [] };
    } catch (error) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
      return { routes: [] };
    }
  };

  // Attempts to fetch route data from a database before falling back to backend
  const fetchDataFromDatabase = async (parameters) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/get_data_from_parameters',
        parameters,
        { timeout: 60000 }
      );
      if (response.data?.routes) {
        const processedRoutes = response.data.routes.flatMap(item => item.routes);
        return { routes: processedRoutes };
      }
      return { routes: [] };
    } catch (error) {
      console.error('Error fetching data from database:', error);
      return { routes: [] };
    }
  };

  // Called when user clicks "Save Preferences"
  const handleSavePreferences = async () => {
    if (!navigation?.navigate) {
      Alert.alert('Error', 'Navigation error. Please restart the app.');
      return;
    }

    const totalDuration = convertToMinutes(hours, minutes);
    const parameters = {
      address,
      keyword,
      radius,
      accessibility,
      modes,
      use_current_location: useCurrentAddress,
      time_per_location: 0,
      time_limit: totalDuration
    };

    // Try DB first, fallback to backend
    const databaseData = await fetchDataFromDatabase(parameters);
    if (databaseData?.routes?.length > 0) {
      navigation.navigate('PreferenceResult', { outp: databaseData.routes });
    } else {
      const prefResult = await sendPostRequest(parameters);
      if (prefResult?.routes?.length > 0) {
        navigation.navigate('PreferenceResult', { outp: prefResult.routes });
      } else {
        Alert.alert('Error', 'Failed to fetch route data. Please try again.');
      }
    }
  };

  // Toggle a transport mode, max 2 allowed
  const toggleTransportMode = (mode) => {
    setModes((prev) =>
      prev.includes(mode)
        ? prev.filter((m) => m !== mode)
        : prev.length < 2
        ? [...prev, mode]
        : prev
    );
  };

  // Toggle a theme (multi-select)
  const toggleTheme = (theme) => {
    setKeyword((prev) =>
      prev.includes(theme)
        ? prev.filter((k) => k !== theme)
        : [...prev, theme]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: colors.text }]}>Plan Your Perfect Trip</Text>

        {/* Address input */}
        <Text style={[styles.label, { color: colors.text }]}>Address</Text>
        <TextInput
          mode="outlined"
          placeholder="Search for address..."
          value={address}
          onChangeText={setAddress}
          textColor={colors.text}
          placeholderTextColor="#aaa"
          style={styles.searchInput}
        />

        <Divider style={styles.divider} />

        {/* Accessibility toggle */}
        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: colors.text }]}>Accessibility</Text>
          <View style={styles.switchContainer}>
            <MaterialIcons
              name={accessibility ? 'accessible-forward' : 'not-accessible'}
              size={24}
              style={{ marginRight: 10 }}
              color={accessibility ? '#00CC00' : '#888'}
            />
            <Switch
              value={accessibility}
              onValueChange={() => setAccessibility(!accessibility)}
              color={'#00CC00'}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Search radius slider */}
        <Text style={[styles.label, { color: colors.text }]}>Search Radius</Text>
        <View style={styles.radiusRow}>
          <Text style={[styles.radiusValue, { color: colors.text }]}>{radius} miles</Text>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={100}
            step={5}
            minimumTrackTintColor={'#00CC00'}
            maximumTrackTintColor={colors.placeholder}
            value={radius}
            onValueChange={setRadius}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Duration controls */}
        <Text style={[styles.label, { color: colors.text }]}>Duration</Text>

        {/* Hour selection */}
        <View style={styles.stepperRow}>
          <Text style={[styles.label, { color: colors.text }]}>Hours</Text>
          <View style={styles.stepperControls}>
            <IconButton icon="minus" onPress={() => setHours(prev => Math.max(0, prev - 1))} />
            <Text style={[styles.stepperValue, { color: colors.text }]}>{hours}</Text>
            <IconButton icon="plus" onPress={() => setHours(prev => prev + 1)} />
          </View>
        </View>

        {/* Minute selection */}
        <View style={styles.stepperRow}>
          <Text style={[styles.label, { color: colors.text }]}>Minutes</Text>
          <View style={styles.stepperControls}>
            <IconButton icon="minus" onPress={() => setMinutes(prev => Math.max(0, prev - 5))} />
            <Text style={[styles.stepperValue, { color: colors.text }]}>{minutes}</Text>
            <IconButton icon="plus" onPress={() => setMinutes(prev => (prev < 59 ? prev + 5 : 59))} />
          </View>
        </View>

        <Text style={[styles.durationSummary, { color: colors.text }]}>
          Total Duration: {hours} hr{hours !== 1 ? 's' : ''} {minutes} min
        </Text>

        <Divider style={styles.divider} />

        {/* Theme selection */}
        <Text style={[styles.label, { color: colors.text }]}>Choose a Theme</Text>
        <View style={styles.themeContainer}>
          {THEME_OPTIONS.map(({ name, value }) => {
            const isSelected = keyword.includes(value);
            return (
              <TouchableOpacity
                key={value}
                onPress={() => toggleTheme(value)}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: isSelected ? '#000000' : '#00CC00',
                    borderColor: isSelected ? '#00CC00' : '#000000',
                  },
                ]}
              >
                <Text style={{
                  fontWeight: '600',
                  color: isSelected ? '#00CC00' : '#000000'
                }}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Divider style={styles.divider} />

        {/* Transport mode picker */}
        <Text style={[styles.label, { color: colors.text }]}>Transport Mode</Text>
        <View style={styles.modes}>
          {TRANSPORT_MODES.map(({ mode, icon }) => {
            const isSelected = modes.includes(mode);
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => toggleTransportMode(mode)}
                style={[
                  styles.transportButton,
                  {
                    backgroundColor: isSelected ? '#000000' : '#00CC00',
                    borderColor: isSelected ? '#00CC00' : '#000000',
                  },
                ]}
              >
                <MaterialIcons
                  name={icon}
                  size={40}
                  color={isSelected ? '#00CC00' : '#000000'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save button */}
        <Button
          mode="contained"
          onPress={handleSavePreferences}
          style={styles.submitButton}
          labelStyle={{ fontWeight: 'bold', color: '#000' }}
          buttonColor="#00CC00"
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
    flex: 1 
  },
  scrollContainer: {},
  scrollContent: { 
    paddingHorizontal: 16, 
    paddingTop: 25, 
    paddingBottom: 30 
  },
  header: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'left' 
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 6 
  },
  searchInput: { 
    borderRadius: 12 
  },
  divider: { 
    marginVertical: 16 
  },
  toggleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  switchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  radiusRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  radiusValue: { 
    fontSize: 16, 
    marginRight: 10, 
    fontWeight: '500', 
    width: 90 
  },
  slider: { 
    flex: 1 
  },
  stepperRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  stepperControls: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  stepperButton: { 
    marginHorizontal: 0
  },
  stepperValue: { 
    fontSize: 18, 
    marginHorizontal: 8, 
    width: 40, 
    textAlign: 'center' 
  },
  themeContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  themeButton: {
    width: '48%',
    aspectRatio: 3.5,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  themeName: { 
    fontWeight: '600',
    fontSize: 14
  },
  modes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'space-around',
  },
  transportButton: {
    width: 60,
    height: 60,
    borderRadius: 100,
    borderWidth: 2,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportLabel: { 
    fontSize: 12, 
    marginTop: 4, 
    textTransform: 'capitalize' 
  },
  submitButton: { 
    marginTop: 20, 
    borderRadius: 12, 
    paddingVertical: 6 
  },
  durationSummary: { 
    fontSize: 14, 
    fontWeight: '500', 
    marginTop: 8 
  }
});