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
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    appleLinked: false,
    profileImage: null,
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [shareActivityEnabled, setShareActivityEnabled] = useState(true);
  
  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);
  
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
  
  const saveUserData = async (newData) => {
    try {
      const updatedData = { ...userData, ...newData };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      setUserData(updatedData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

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
      
      // Apple might not provide name/email every time, only on first login
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
      // Cancelled by user
      if (error.code === 'ERR_CANCELED') {
        return;
      }
      
      Alert.alert('Error', 'Failed to link Apple account');
      console.error('Apple authentication error:', error);
    }
  };
  
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
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
        
        {/* Apple Sign In Button */}
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
        
        {userData.appleLinked && (
          <Text style={styles.linkedText}>
            <MaterialIcons name="check-circle" size={16} color="green" /> Apple account linked
          </Text>
        )}
      </Card>
      
      {/* Activity Stats Card */}
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
      
      {/* Settings Card */}
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
      
      {/* Logout Button */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  card: {
    elevation: 4,
    borderRadius: 20,
    marginBottom: 20,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.8,
  },
  appleButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  linkedText: {
    marginTop: 16,
    color: 'green',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    marginVertical: 20,
    borderRadius: 8,
    borderColor: '#ff3b30',
  },
  logoutButtonContent: {
    height: 50,
  },
});

export default ProfileScreen;