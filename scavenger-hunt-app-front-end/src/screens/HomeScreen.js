import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme, Card, Button } from 'react-native-paper';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; // Use '@expo/vector-icons' if on Expo

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ Local image badges
  const badges = [
    require('../assets/Badge1.png'),
    require('../assets/Badge2.png'),
    require('../assets/Badge3.png'),
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, marginTop: 45 }]}>
      {/* Profile Icon in Top Right */}
      <View style={styles.profileRow}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <MaterialIcons name="person" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Header with optional name */}
      <Text style={[styles.header, { color: colors.text }]}>
        Home {name ? ` - Hi, ${name}!` : ''}
      </Text>

      {/* CARD 1: Activity Rings */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.activityText, { color: colors.text }]}>Your Activity</Text>

          <View style={styles.ringsRow}>
            <View style={styles.ringsContainer}>
              <AnimatedCircularProgress
                size={180}
                width={16}
                fill={80}
                tintColor="#FF3B30"
                backgroundColor="#3c3c3c"
                rotation={0}
                lineCap="round"
                style={styles.ring}
              />
              <AnimatedCircularProgress
                size={140}
                width={16}
                fill={60}
                tintColor="#4CD964"
                backgroundColor="#2c2c2c"
                rotation={0}
                lineCap="round"
                style={styles.ring}
              />
              <AnimatedCircularProgress
                size={100}
                width={16}
                fill={40}
                tintColor="#5AC8FA"
                backgroundColor="#1e1e1e"
                rotation={0}
                lineCap="round"
                style={styles.ring}
              />
            </View>

            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendTextItem, { color: '#FF3B30' }]}>Miles Covered</Text>
              <Text style={[styles.legendTextItem, { color: '#4CD964' }]}>Places Visited</Text>
              <Text style={[styles.legendTextItem, { color: '#5AC8FA' }]}>Badges</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* CARD 2: Miles Covered */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.subHeader, { color: colors.text }]}>Miles Covered</Text>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>920</Text>
            <Text style={styles.metricNote}>You're doing great! 🎉</Text>
          </View>
        </Card.Content>
      </Card>

      {/* CARD 3: Badges */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.subHeader, { color: colors.text }]}>Badges</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {badges.map((badge, index) => (
              <Image key={index} source={badge} style={styles.badgeImage} />
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter Your Name</Text>
            <TextInput
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <Button mode="contained" onPress={() => setModalVisible(false)}>
              Save
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 4,
  },
  card: {
    elevation: 10,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'left', // Home title is left-aligned
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  activityText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'left',
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ringsContainer: {
    width: 250,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -30,
  },
  ring: {
    position: 'absolute',
  },
  legendTextContainer: {
    justifyContent: 'center',
    marginLeft: -10,
  },
  legendTextItem: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 10,
  },
  metricBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  metricNote: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 4,
  },
  badgeScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badgeImage: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
});

export default HomeScreen;
