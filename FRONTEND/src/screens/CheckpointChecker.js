import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, Dimensions, TouchableOpacity, Modal, Image } from 'react-native';
import { useTheme, Button, IconButton } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const NavigationScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { currentIndex, nextIndex, trip } = route.params;
  const [isAtLocation, setIsAtLocation] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [checkingPhoto, setCheckingPhoto] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [landmarkInfo, setLandmarkInfo] = useState(null);
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const currentDestination = trip.destinations[currentIndex];
  const nextDestination = trip.destinations[nextIndex];
  const isLastDestination = nextIndex === trip.destinations.length - 1;

  const initialRegion = {
    latitude: currentDestination.lat,
    longitude: currentDestination.lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    (async () => {
      const cameraPermission = await requestPermission();
      setHasPermission(cameraPermission?.granted);
    })();
  }, []);

  const checkLocation = async () => {
    setCheckingLocation(true);
    try {
      const response = await axios.post('http://192.168.0.170:5000/check_user_location', {
        target_lat: nextDestination.lat,
        target_lon: nextDestination.lng,
        tolerance: 0.01
      });
      
      if (response.data.is_at_location) {
        setIsAtLocation(true);
        handleSuccessfulVerification();
      } else {
        Alert.alert(
          "Location Mismatch",
          "It seems you haven't reached the destination yet.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not verify location: " + error.message);
    } finally {
      setCheckingLocation(false);
    }
  };

  const handleSuccessfulVerification = () => {
    if (isLastDestination && nextIndex === currentIndex) {
      Alert.alert(
        "Congratulations!",
        "You have completed this trip successfully!",
        [{ text: "Great!", onPress: () => navigation.navigate('Selection') }]
      );
    } else {
      Alert.alert(
        "Location Verified!",
        "You've reached the destination.",
        [{ text: "Continue", onPress: () => {
          if (nextIndex === currentIndex) {
            // Navigate to next point
            navigation.navigate('Navigation', {
              currentIndex: nextIndex,
              nextIndex: Math.min(nextIndex + 1, trip.destinations.length - 1),
              trip: trip
            });
          } else {
            // Stay at current view but update status
            setIsAtLocation(true);
          }
        }}]
      );
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo);
        setCameraVisible(false);
        setPreviewVisible(true);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  const verifyPhotoLocation = async () => {
    if (!capturedImage) {
      console.log("[DEBUG] verifyPhotoLocation: No captured image to verify.");
      Alert.alert("No Image", "Please capture or select an image first.");
      return;
    }
    
    setCheckingPhoto(true);
    setLandmarkInfo(null); // Reset landmark info
    console.log("[DEBUG] verifyPhotoLocation: Starting verification for location:", nextDestination.name);
    console.log("[DEBUG] verifyPhotoLocation: Captured image URI:", capturedImage.uri);
  
    try {
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(capturedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("[DEBUG] verifyPhotoLocation: Image converted to base64 (first 100 chars):", base64Image.substring(0, 100));
  
      // Send to backend for Supabase-based verification
      const payload = {
        image: base64Image,
        location_name: nextDestination.name, // Ensure this is the correct name expected by backend
        location_lat: nextDestination.lat,   // Sending lat/lng in case backend uses them later
        location_lng: nextDestination.lng
      };
      console.log("[DEBUG] verifyPhotoLocation: Sending payload to backend:", payload.location_name, payload.location_lat, payload.location_lng);
  
      const response = await axios.post('http://192.168.0.170:5000/verify_location_image_supabase', payload);
      
      console.log("[DEBUG] verifyPhotoLocation: Received response from backend:", JSON.stringify(response.data, null, 2));
  
      // Store landmark information for display
      // The backend now returns matching_info as an array, potentially with one best match or top potentials.
      // Ensure the structure matches what you expect for LandmarkInfo display.
      // matching_info is expected to be an array of objects like { name: "...", score: 0.9 }
      if (response.data.matching_info && response.data.matching_info.length > 0) {
        setLandmarkInfo(response.data.matching_info); // This should be an array
        console.log("[DEBUG] verifyPhotoLocation: LandmarkInfo set with:", response.data.matching_info);
      } else if (response.data.debug_all_comparisons && response.data.debug_all_comparisons.length > 0) {
        // Fallback: if matching_info is empty but there were comparisons, show top one from debug
        // setLandmarkInfo([response.data.debug_all_comparisons[0]]); 
        // console.log("[DEBUG] verifyPhotoLocation: LandmarkInfo set with debug comparison:", [response.data.debug_all_comparisons[0]]);
      }
      
      if (response.data.is_match) {
        setIsAtLocation(true); // Assuming this state means checkpoint verified
        setPreviewVisible(false); // Close the preview modal on success
        Alert.alert(
          "Image Verified!",
          "The photo matches the location.", 
          [{ text: "OK", onPress: handleSuccessfulVerification }] // Proceed to next step
        );
      // ...
    } else {
      Alert.alert(
        "Image Verification Failed",
        response.data.error || "The photo doesn't appear to match the expected location.", 
        [{ text: "Try Again" }]
      );
    }
    } catch (error) {
      console.error("[ERROR] verifyPhotoLocation: Photo verification error:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("[ERROR] verifyPhotoLocation: Backend Response Data:", error.response.data);
        console.error("[ERROR] verifyPhotoLocation: Backend Response Status:", error.response.status);
        //Alert.alert("Verification Error", Server error: ${error.response.data?.error || error.response.data?.message || 'Unknown server error'});
      } else if (error.request) {
        // The request was made but no response was received
        console.error("[ERROR] verifyPhotoLocation: No response received:", error.request);
        Alert.alert("Network Error", "Could not connect to the server. Please check your network connection and the server IP address.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("[ERROR] verifyPhotoLocation: Error setting up request:", error.message);
        Alert.alert("Client Error", "An error occurred while preparing the verification request: " + error.message);
      }
    } finally {
      setCheckingPhoto(false);
    }
  };

  const openCamera = async () => {
    if (hasPermission) {
      setCameraVisible(true);
    } else {
      Alert.alert(
        "Camera Permission Required",
        "Please grant camera permission to use this feature.",
        [{ text: "OK", onPress: requestPermission }]
      );
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0]);
        setPreviewVisible(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (hasPermission === null) {
    return <SafeAreaView style={styles.container}><Text>Requesting camera permission...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {nextIndex === currentIndex ? 
          `You're at: ${currentDestination.name}` : 
          `Navigate to: ${nextDestination.name}`}
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Transport mode: {nextDestination.modeOfTransport}
      </Text>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
      >
        {/* Current Location Marker */}
        <Marker
          coordinate={{
            latitude: currentDestination.lat,
            longitude: currentDestination.lng,
          }}
          title="Current Location"
          pinColor="#00FF00"
        />
        
        {/* Next Destination Marker */}
        <Marker
          coordinate={{
            latitude: nextDestination.lat,
            longitude: nextDestination.lng,
          }}
          title={nextDestination.name}
          pinColor="#0000FF"
        />
        
        {/* Simple line connecting points */}
        <Polyline
          coordinates={[
            { latitude: currentDestination.lat, longitude: currentDestination.lng },
            { latitude: nextDestination.lat, longitude: nextDestination.lng }
          ]}
          strokeColor="#000" 
          strokeWidth={2}
        />
      </MapView>

      <View style={styles.buttonContainer}>
        <Text style={[styles.verifyTitle, { color: colors.text }]}>Verify You're at the Location:</Text>
        
        <View style={styles.verificationOptions}>
          <Button 
            mode="contained" 
            style={[styles.button, styles.verifyButton]}
            labelStyle={{color:'black',fontWeight:'bold'}}
            icon="map-marker"
            onPress={checkLocation}
            loading={checkingLocation}
            disabled={checkingLocation}
          >
            GPS Check
          </Button>
          
          <Button 
            mode="contained" 
            style={[styles.button, styles.verifyButton]}
            labelStyle={{color:'black',fontWeight:'bold'}}
            icon="camera"
            onPress={openCamera}
          >
            Take Photo
          </Button>
        </View>
        
        <Button 
          mode="outlined" 
          style={[styles.button, { marginTop: 16 }]}
          labelStyle={{color:'black',fontWeight:'bold'}}
          onPress={() => navigation.goBack()}
        >
          Back to Route Details
        </Button>
      </View>

      {/* Camera Modal */}
      <Modal
        visible={cameraVisible}
        transparent={false}
        animationType="slide"
      >
        <SafeAreaView style={styles.cameraContainer}>
          {hasPermission && (
            <CameraView 
              style={styles.camera}
              ref={cameraRef}
              facing={facing}
            >
              <View style={styles.cameraButtonContainer}>
                <IconButton
                  icon="close"
                  size={30}
                  color="#fff"
                  onPress={() => setCameraVisible(false)}
                />
                <IconButton
                  icon="camera"
                  size={50}
                  color="#fff"
                  onPress={takePicture}
                />
                <IconButton
                  icon="image"
                  size={30}
                  color="#fff"
                  onPress={() => {
                    setCameraVisible(false);
                    pickImage();
                  }}
                />
                <IconButton
                  icon="camera-switch"
                  size={30}
                  color="#fff"
                  onPress={toggleCameraFacing}
                />
              </View>
            </CameraView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent={false}
        animationType="slide"
      >
        <SafeAreaView style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Verify Photo</Text>
          {capturedImage && (
            <Image
              source={{ uri: capturedImage.uri }}
              style={styles.previewImage}
            />
          )}
          
          {/* Display landmark info if available */}
          {landmarkInfo && (
            <View style={styles.landmarkInfoContainer}>
              <Text style={styles.landmarkInfoTitle}>Landmarks Detected:</Text>
              {landmarkInfo.map((landmark, index) => (
                <Text key={index} style={styles.landmarkInfoText}>
                  {landmark.name} {landmark.score ? `(${(landmark.score * 100).toFixed(0)}%)` : ''}
                </Text>
              ))}
            </View>
          )}
          
          <View style={styles.previewButtonContainer}>
            <Button
              mode="contained"
              style={styles.previewButton}
              loading={checkingPhoto}
              disabled={checkingPhoto}
              onPress={verifyPhotoLocation}
            >
              Verify Landmark
            </Button>
            <Button
              mode="outlined"
              style={styles.previewButton}
              onPress={() => {
                setPreviewVisible(false);
                setCapturedImage(null);
                setLandmarkInfo(null);
              }}
            >
              Retake
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default NavigationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  map: {
    width: Dimensions.get('window').width - 32,
    height: Dimensions.get('window').height * 0.5,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    padding: 8,
  },
  verifyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  verificationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 6,
    backgroundColor: '#39FF14'
  },
  verifyButton: {
    flex: 0.48,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: 'black',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  previewImage: {
    flex: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  previewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  previewButton: {
    flex: 0.48,
    borderRadius: 8,
  },
  landmarkInfoContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  landmarkInfoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  landmarkInfoText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 3,
  },
});