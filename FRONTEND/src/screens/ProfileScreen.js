import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useTheme, Card, Button, Divider } from 'react-native-paper';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Holds user profile data
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    appleLinked: false,
    profileImage: null,
  });

  // Various toggle states for settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [shareActivityEnabled, setShareActivityEnabled] = useState(true);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Load saved user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Save user data back to AsyncStorage
  const saveUserData = async (newData) => {
    try {
      const updatedData = { ...userData, ...newData };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      setUserData(updatedData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Handles Apple Sign-In
  const handleAppleLogin = async () => {
    try {
      if (!AppleAuthentication.isAvailableAsync()) {
        Alert.alert('Not Available', 'Apple authentication is not available on this device');
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const name = credential.fullName?.givenName && credential.fullName?.familyName 
        ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
        : userData.name;

      const email = credential.email || userData.email;

      saveUserData({
        name,
        email,
        appleLinked: true,
        appleUserId: credential.user,
      });

      Alert.alert('Success', 'Apple account linked successfully');
    } catch (error) {
      if (error.code === 'ERR_CANCELED') return;
      Alert.alert('Error', 'Failed to link Apple account');
      console.error('Apple authentication error:', error);
    }
  };

  // Clears local user data and navigates to Home
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            setUserData({
              name: '',
              email: '',
              appleLinked: false,
              profileImage: null,
            });
            navigation.navigate('Home');
          },
          style: 'destructive'
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>
      </View>

      {/* Profile Card */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.profileHeader}>
          {userData.profileImage ? (
            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.profileImageText}>
                {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {userData.name || 'Guest User'}
            </Text>
            {userData.email && (
              <Text style={[styles.profileEmail, { color: colors.text }]}>{userData.email}</Text>
            )}
          </View>
        </View>

        {/* Apple Sign In */}
        {!userData.appleLinked && Platform.OS === 'ios' && (
          <Button 
            mode="contained"
            icon={() => <FontAwesome name="apple" size={18} color="#FFFFFF" />}
            onPress={handleAppleLogin}
            style={styles.appleButton}
          >
            Link Apple Account
          </Button>
        )}

        {/* Linked Confirmation */}
        {userData.appleLinked && (
          <Text style={styles.linkedText}>
            <MaterialIcons name="check-circle" size={16} color="green" /> Apple account linked
          </Text>
        )}
      </Card>

      {/* Activity Stats */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Overview</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>920</Text>
              <Text style={styles.statLabel}>Miles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>42</Text>
              <Text style={styles.statLabel}>Places</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Share Activity</Text>
            <Switch
              value={shareActivityEnabled}
              onValueChange={setShareActivityEnabled}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>

          {/* Navigational Settings */}
          <Divider style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Profile</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <Divider style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Privacy')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <Divider style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Help & Support</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Logout */}
      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
        contentStyle={styles.logoutButtonContent}
      >
        Log Out
      </Button>
    </ScrollView>
  );
};

export default ProfileScreen;