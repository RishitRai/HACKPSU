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
      const response = await axios.post('http://100.64.14.73:5000/check_user_location', {
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
    if (!capturedImage) return;
    
    setCheckingPhoto(true);
    setLandmarkInfo(null); // Reset landmark info
    
    try {
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(capturedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to backend for landmark-only verification
      const response = await axios.post('http://100.64.14.73:5000/verify_location_image', {
        image: base64Image,
        location_name: nextDestination.name,
        location_lat: nextDestination.lat,
        location_lng: nextDestination.lng
      });
      
      // Store landmark information for display
      if (response.data.matching_landmarks && response.data.matching_landmarks.length > 0) {
        setLandmarkInfo(response.data.matching_landmarks);
      }
      
      if (response.data.is_match) {
        setIsAtLocation(true);
        setPreviewVisible(false);
        handleSuccessfulVerification();
      } else {
        Alert.alert(
          "Image Verification Failed",
          "The photo doesn't match the expected landmark.",
          [{ text: "Try Again" }]
        );
      }
    } catch (error) {
      console.error("Photo verification error:", error);
      Alert.alert("Error", "Could not verify photo: " + (error.response?.data?.error || error.message));
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
            icon="camera"
            onPress={openCamera}
          >
            Take Photo
          </Button>
        </View>
        
        <Button 
          mode="outlined" 
          style={[styles.button, { marginTop: 16 }]}
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