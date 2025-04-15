// import React, { useState } from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert
// } from 'react-native';
// import {
//   TextInput,
//   Switch,
//   Button,
//   useTheme,
//   Divider,
//   IconButton,
// } from 'react-native-paper';
// import Slider from '@react-native-community/slider';
// import { MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';

// const TRANSPORT_MODES = [
//   { mode: 'walking', icon: 'directions-walk' },
//   { mode: 'driving', icon: 'drive-eta' },
//   { mode: 'biking', icon: 'pedal-bike' },
//   { mode: 'bus', icon: 'directions-bus' },
//   { mode: 'train', icon: 'train' },
// ];

// const THEME_OPTIONS = [
//   { name: 'attraction', value: 'attraction' },
//   { name: 'religious', value: 'religious' },
//   { name: 'shopping', value: 'shopping' },
//   { name: 'entertainment', value: 'entertainment' },
// ];

// const TripPreferencesScreen = () => {
//   const { colors } = useTheme();
//   const navigation = useNavigation();

//   const [address, setaddress] = useState('');
//   const [keyword, setKeyword] = useState([]);
//   const [radius, setRadius] = useState(30000);
//   const [accessibility, setaccessibility] = useState(false);
//   const [modes, setModes] = useState([]);
//   const [useCurrentAddress, setUseCurrentAddress] = useState(false);
//   const [hours, setHours] = useState(0);
//   const [minutes, setMinutes] = useState(0);

//   const convertToMinutes = (hours, minutes) => {
//     return hours * 60 + minutes;
//   };

//   const sendPostRequest = async (parameters) => {
//     const response = await axios.post('http://100.64.7.174:5000/optimize_route', parameters, { timeout: 60000 });
  
//     if (response && response.data && response.data.routes) {
//       console.log('Response from backend:', response.data.routes);
//       Alert.alert('Server Response', JSON.stringify(response.data.routes, null, 2));
//       return response.data.routes; // Return optimized routes
//     } else {
//       console.error('Error: Invalid response from backend.');
//       Alert.alert('Error', 'Failed to fetch data from the server. Please try again.');
//       return []; // Return an empty array
//     }
//   };
  
//   const fetchDataFromDatabase = async (parameters) => {
//     try {
//         const response = await axios.post(
//             'http://100.64.7.174:5000/get_data_from_parameters',
//             parameters,
//             { timeout: 60000 } // Set timeout for the request
//         );

//         console.log("Raw response from database:", response);

//         // Validate the response structure
//         if (response && response.data && Array.isArray(response.data.routes)) {
//             console.log("Response from database:", response.data.routes);
//             Alert.alert('Database Response', JSON.stringify(response.data.routes, null, 2)); // Display in alert
//             return response.data.routes; // Return matching data from the database
//         } else {
//             console.error("Error: Invalid or empty routes in response");
//             Alert.alert('Error', 'No matching routes found in the database.');
//             return []; // Return an empty array as fallback
//         }
//     } catch (error) {
//         console.error("Error fetching data from database:", error);

//         if (error.response) {
//             console.error("Backend response error:", error.response.status, error.response.data);
//             Alert.alert('Error', `Server responded with status code ${error.response.status}`);
//         } else if (error.request) {
//             console.error("No response received from server:", error.request);
//             Alert.alert('Error', 'No response received from the server. Please check your network.');
//         } else {
//             console.error("Request setup error:", error.message);
//             Alert.alert('Error', 'An unexpected error occurred while fetching data.');
//         }

//         return []; // Return an empty array on error
//     }
//   };
  
//   // Handle button press and show parameters in alert and JSON format
//   const handleSavePreferences = async () => {
//     const totalDuration = convertToMinutes(hours, minutes); // Convert time
  
//     // Construct the parameters object
//     const parameters = {
//       address,
//       keyword,
//       radius,
//       accessibility,
//       modes, // Transport modes directly as array
//       use_current_location: useCurrentAddress,
//       time_per_location: 0, // Default time per location
//       time_limit: totalDuration
//     };
  
//     const databaseData = await fetchDataFromDatabase(parameters); // Step 1: Query database
  
//     if (databaseData && databaseData.length > 0) {
//       console.log('Data found in database, navigating to PreferenceResult.');
//       navigation.navigate('PreferenceResult', { outp: databaseData }); // Step 2: Use database data
//     } else {
//         console.log('No data found in database, fetching from backend...');
//         const prefResult = await sendPostRequest(parameters); // Step 3: Fallback to backend
//         navigation.navigate('PreferenceResult', { outp: prefResult }); // Use backend data
//       }
//   };
  

//     // Shows parameters as alert
//     //Alert.alert('Trip Preferences', JSON.stringify(parameters, null, 2));

//     // Log parameters as a JSON file to console
//     // console.log('Trip Preferences:', parameters);

//     // Send POST request to server with parameters

//   const toggleTransportMode = (mode) => {
//     setModes((prevModes) => {
//       if (prevModes.includes(mode)) {
//         return prevModes.filter((m) => m !== mode);
//       } else if (prevModes.length < 2) {
//         return [...prevModes, mode];
//       } else {
//         return prevModes;
//       }
//     });
//   };

//   const toggleTheme = (theme) => {
//     setKeyword((prevKeywords) => {
//         if (prevKeywords.includes(theme)) {
//             return prevKeywords.filter((k) => k !== theme);
//         } else {
//             return [...prevKeywords, theme];
//         }
//     });
// };

//   // const handleSavePreferences = () => {
//   //   navigation.navigate('Selection');

//   // };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//       <ScrollView
//         style={styles.scrollContainer}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={[styles.header, { color: colors.text }]}>Plan Your Perfect Trip</Text>

//         <Text style={[styles.label, { color: colors.text }]}>address</Text>
//         <TextInput
//           mode="outlined"
//           placeholder="Search for address..."
//           value={address}
//           onChangeText={setaddress}
//           textColor={colors.text}
//           placeholderTextColor="#aaa"
//           style={[styles.searchInput, { color: colors.text }]}
//         />

//         <Divider style={styles.divider} />

//         <View style={styles.toggleRow}>
//           <Text style={[styles.label, { color: colors.text }]}>Accessibility</Text>
//           <View style={styles.switchContainer}>
//             <MaterialIcons
//               name={accessibility ? 'accessible-forward' : 'not-accessible'}
//               size={24}
//               style={{ marginRight: 10 }}
//               color={accessibility ? colors.primary : '#888'}
//             />
//             <Switch
//               value={accessibility}
//               onValueChange={() => setaccessibility(!accessibility)}
//               color={colors.primary}
//             />
//           </View>
//         </View>

//         <Divider style={styles.divider} />

//         <Text style={[styles.label, { color: colors.text }]}>Search Radius</Text>
//         <View style={styles.radiusRow}>
//           <Text style={[styles.radiusValue, { color: colors.text }]}>{radius} miles</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={1000}
//             maximumValue={50000}
//             step={1000}
//             minimumTrackTintColor={colors.primary}
//             maximumTrackTintColor={colors.placeholder}
//             value={radius}
//             onValueChange={(val) => setRadius(val)}
//           />
//         </View>

//         <Divider style={styles.divider} />

//         <Text style={[styles.label, { color: colors.text }]}>Duration</Text>

//         <View style={styles.stepperRow}>
//           <Text style={[styles.label, { color: colors.text }]}>Hours</Text>
//           <View style={styles.stepperControls}>
//             <IconButton icon="minus" onPress={() => setHours(prev => Math.max(0, prev - 1))} style={styles.stepperButton} />
//             <Text style={[styles.stepperValue, { color: colors.text }]}>{hours}</Text>
//             <IconButton icon="plus" onPress={() => setHours(prev => prev + 1)} style={styles.stepperButton} />
//           </View>
//         </View>

//         <View style={styles.stepperRow}>
//           <Text style={[styles.label, { color: colors.text }]}>Minutes</Text>
//           <View style={styles.stepperControls}>
//             <IconButton icon="minus" onPress={() => setMinutes(prev => Math.max(0, prev - 5))} style={styles.stepperButton} />
//             <Text style={[styles.stepperValue, { color: colors.text }]}>{minutes}</Text>
//             <IconButton icon="plus" onPress={() => setMinutes(prev => (prev < 59 ? prev + 5 : 59))} style={styles.stepperButton} />
//           </View>
//         </View>

//         <Text style={[styles.durationSummary, { color: colors.text }]}>
//           Total Duration: {hours} hr{hours !== 1 ? 's' : ''} {minutes} min
//         </Text>

//         <Divider style={styles.divider} />

//         <Text style={styles.label}>Choose a Theme</Text>
//         <View style={styles.themeContainer}>
//           {THEME_OPTIONS.map(({ name, value }, idx) => {
//             const isSelected = value === keyword;
//             return (
//               <TouchableOpacity
//                 key={idx}
//                 onPress={() => toggleTheme(value)}
//                 style={[
//                   styles.themeButton,
//                   {
//                     borderWidth: keyword.includes(value) ? 3 : 0,
//                     borderColor: keyword.includes(value) ? '#ffffff' : 'transparent',
//                   },
//                 ]}
//               >
//                 <Text style={styles.themeName}>{name}</Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         <Divider style={styles.divider} />

//         <Text style={[styles.label, { color: colors.text }]}>Transport Mode (max 2)</Text>
//         <View style={styles.modes}>
//           {TRANSPORT_MODES.map(({ mode, icon }) => {
//             const isSelected = modes.includes(mode);
//             return (
//               <TouchableOpacity
//                 key={mode}
//                 onPress={() => toggleTransportMode(mode)}
//                 style={[
//                   styles.transportButton,
//                   { borderColor: isSelected ? colors.primary : '#ccc' },
//                 ]}
//               >
//                 <MaterialIcons
//                   name={icon}
//                   size={32}
//                   color={isSelected ? colors.primary : colors.text}
//                 />
//                 <Text style={[styles.transportLabel, { color: colors.text }]}>
//                   {mode.charAt(0).toUpperCase() + mode.slice(1)}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         <Button
//           mode="contained"
//           onPress={handleSavePreferences} 
//           style={styles.submitButton}
//           labelStyle={{ fontWeight: '600' }}
//           buttonColor={colors.primary}
//         >
//           Save Preferences
//         </Button>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default TripPreferencesScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContainer: {},
//   scrollContent: { paddingHorizontal: 16, paddingTop: 25, paddingBottom: 30 },
//   header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'left' },
//   label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
//   searchInput: { borderRadius: 25 },
//   divider: { marginVertical: 16 },
//   toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   switchContainer: { flexDirection: 'row', alignItems: 'center' },
//   radiusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   radiusValue: { fontSize: 16, marginRight: 10, fontWeight: '500', width: 90 },
//   slider: { flex: 1 },
//   stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   stepperControls: { flexDirection: 'row', alignItems: 'center' },
//   stepperButton: { marginHorizontal: 0 },
//   stepperValue: { fontSize: 18, marginHorizontal: 8, width: 40, textAlign: 'center' },
//   themeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
//   themeButton: {
//     width: '30%',
//     aspectRatio: 3.5,
//     borderRadius: 50,
//     marginBottom: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   themeName: { color: '#fff', fontWeight: '600' },
//   modes: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 8,
//     justifyContent: 'space-around',
//   },
//   transportButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     borderWidth: 2,
//     marginBottom: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   transportLabel: { fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
//   submitButton: { marginTop: 20, borderRadius: 20, paddingVertical: 6 },
//   durationSummary: { fontSize: 14, fontWeight: '500', marginTop: 8 },
// });
