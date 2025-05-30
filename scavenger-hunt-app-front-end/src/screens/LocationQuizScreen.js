import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  PanResponder
} from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import axios from 'axios';

const SCREEN_WIDTH = Dimensions.get('window').width;

const LocationQuizScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { currentIndex, nextIndex, trip } = route.params;
  const destination = trip.destinations[nextIndex];

  const [quizData, setQuizData] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctGuess, setCorrectGuess] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [currentHint, setCurrentHint] = useState("");
  const [currentHintId, setCurrentHintId] = useState(null);
  const [isHintFinal, setIsHintFinal] = useState(false);
  const [loadingHints, setLoadingHints] = useState(true);
  const [rejectCount, setRejectCount] = useState(1);
  const [acceptCount, setAcceptCount] = useState(1);

  const position = useRef(new Animated.ValueXY()).current;

  const SWIPE_THRESHOLD = 120;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
  if (gesture.dx > SWIPE_THRESHOLD) {
    handleSwipe(true, SCREEN_WIDTH);  // Right swipe → understood
  } else if (gesture.dx < -SWIPE_THRESHOLD) {
    handleSwipe(false, -SCREEN_WIDTH); // Left swipe → need more help
  } else {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  }
},


    })
  ).current;

  useEffect(() => {
    generateQuizQuestions();
    fetchNextHint();
  }, []);

  const fetchNextHint = async (userResponse = null, updatedAccept = acceptCount, updatedReject = rejectCount) => {
  if (isHintFinal) return;

  setLoadingHints(true);

  try {
    const response = await axios.post(
      'http://192.168.70.128:5000/generate_location_hint',
      {
        location_name: destination.name,
        previous_hint_id: currentHintId,
        user_response: userResponse,
        reject_count: updatedReject,
        accept_count: updatedAccept
      }
    );

    const { hint, is_final } = response.data;
    setCurrentHint(hint.text);
    setCurrentHintId(hint.id);
    setIsHintFinal(is_final);

  } catch (error) {
    console.error("Error fetching hint:", error);
    setCurrentHint("This is a popular location in this area.");
  } finally {
    setLoadingHints(false);
  }
};


  const generateQuizQuestions = () => {
    const questions = [
      {
        question: "What is this location?",
        options: [
          { text: destination.name, isCorrect: true },
          { text: "Central Park", isCorrect: false },
          { text: "Times Square", isCorrect: false },
        ],
      },
      {
        question: "What can you find at this location?",
        options: [
          { text: "A famous statue", isCorrect: false },
          { text: "Historical landmarks", isCorrect: true },
          { text: "Amusement rides", isCorrect: false },
        ],
      },
      {
        question: "What's the best way to travel to this location?",
        options: [
          { text: "By boat", isCorrect: false },
          { text: "By subway", isCorrect: false },
          { text: destination.modeOfTransport, isCorrect: true },
        ],
      }
    ];

    setQuizData(questions);
  };

 const handleSwipe = (understood, directionX) => {
  Animated.timing(position, {
    toValue: { x: directionX, y: 0 },
    duration: 250,
    useNativeDriver: false,
  }).start(() => {
    position.setValue({ x: 0, y: 0 });

    if (isHintFinal && understood) {
      setIsHintFinal(false);
      setRejectCount(1);
      setAcceptCount(1);
      setCurrentHint("");
      setCurrentHintId(null);

      if (currentCardIndex < quizData.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        fetchNextHint(); // reset for next card
      } else {
        setQuizCompleted(true);
      }
    } else {
      const userResponse = understood ? "understood" : "confused";
      const updatedAccept = understood && acceptCount < 3 ? acceptCount + 1 : acceptCount;
      const updatedReject = !understood && rejectCount < 3 ? rejectCount + 1 : rejectCount;

      setAcceptCount(updatedAccept);
      setRejectCount(updatedReject);
      fetchNextHint(userResponse, updatedAccept, updatedReject);
    }
  });
};





  const handleAnswerSelection = (option) => {
    if (option.isCorrect) {
      setCorrectGuess(true);
      setQuizCompleted(true);
    } else {
      if (currentCardIndex < quizData.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setQuizCompleted(true);
      }
    }
  };

  const renderCurrentQuestion = () => {
  if (currentCardIndex >= quizData.length) {
    return renderNoMoreCards();
  }

  const item = quizData[currentCardIndex];

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.cardStyle,
        {
          transform: [
            { translateX: position.x },
            {
              rotate: position.x.interpolate({
                inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                outputRange: ['-10deg', '0deg', '10deg'],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.sideLabel}>← Need Help</Text>
          <Text style={styles.questionCounter}>
            Question {currentCardIndex + 1}/{quizData.length}
          </Text>
          <Text style={styles.sideLabel}>Understood →</Text>
        </View>

        <Text style={styles.questionText}>{item.question}</Text>

        {/* Hint Section */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintTitle}>Helpful Hint:</Text>
          {loadingHints ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#00FF00" />
              <Text style={styles.loadingText}>Generating hint...</Text>
            </View>
          ) : (
            <Text style={styles.hintText}>{currentHint}</Text>
          )}
        </View>

        {/* Answer Options */}
        <View style={styles.answerButtonsContainer}>
          {item.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.answerButton}
              onPress={() => handleAnswerSelection(option)}
            >
              <Text style={styles.answerButtonText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCardsContainer}>
      <Text style={styles.noMoreCardsText}>No more guesses!</Text>
      <Text style={styles.revealText}>The answer was: {destination.name}</Text>
    </View>
  );

  if (quizCompleted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>
            {correctGuess ? "You got it right!" : "Nice try!"}
          </Text>
          <Text style={styles.completedText}>
            {correctGuess
              ? `Great job identifying ${destination.name}!`
              : `The correct answer was ${destination.name}.`}
          </Text>
          <Image
            source={trip.image}
            style={styles.destinationImage}
            resizeMode="cover"
          />
          <Text style={styles.destinationDescription}>
            {destination.name} is your {nextIndex === currentIndex ? "current" : "next"} destination.
          </Text>
          <Button
            mode="contained"
            style={styles.continueButton}
            labelStyle={styles.buttonLabel}
            onPress={() =>
              navigation.navigate('CheckpointChecker', {
                currentIndex,
                nextIndex,
                trip
              })
            }
          >
            Continue to Location Check
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.cardContainer}>{renderCurrentQuestion()}</View>
      <TouchableOpacity style={styles.skipButton} onPress={() => setQuizCompleted(true)}>
        <Text style={styles.skipButtonText}>Skip Quiz</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 5,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardStyle: {
  flex: 1, // make it full height
  width: '100%',
  borderRadius: 0,
  backgroundColor: '#222222',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
},
cardTopRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
},


sideLabel: {
  color: '#AAAAAA',
  fontSize: 12,
},
cardContent: {
  padding: 24,
  justifyContent: 'center',
},
  questionText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#FFFFFF',
  textAlign: 'center',
  marginBottom: 16,
  marginTop: 10,
},
  questionCounter: {
  color: '#00FF00',
  fontWeight: 'bold',
  fontSize: 14,
},
hintContainer: {
  backgroundColor: '#2e4e2e',
  padding: 16,
  borderRadius: 12,
  marginBottom: 25,
  shadowColor: '#00FF00',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
},
  
hintTitle: {
  color: '#00FF00',
  fontWeight: 'bold',
  fontSize: 16,
  marginBottom: 5,
},
  hintText: {
    color: '#DDDDDD',
  },
  hintStats: {
    marginTop: 10,
    alignItems: 'center',
  },
  hintStatsText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    color: '#DDDDDD',
    marginLeft: 10,
  },
  hintFeedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  hintFeedbackButton: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    padding: 8,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  hintFeedbackButtonNegative: {
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  hintFeedbackText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  answerButtonsContainer: {
    marginTop: 10,
  },
  answerButton: {
  backgroundColor: '#1e3a8a', // Dark blue tone
  padding: 16,
  borderRadius: 12,
  marginBottom: 14,
  alignItems: 'center',
  elevation: 2,
},
answerButtonText: {
  color: '#FFFFFF',
  fontSize: 18,
  fontWeight: '700',
},
  skipButton: {
    alignSelf: 'center',
    padding: 15,
    marginBottom: 20,
  },
  skipButtonText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  noMoreCardsContainer: {
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMoreCardsText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  revealText: {
    color: '#00FF00',
    fontSize: 18,
    textAlign: 'center',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FF00',
    marginBottom: 20,
  },
  completedText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  destinationImage: {
    width: SCREEN_WIDTH * 0.8,
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  destinationDescription: {
    fontSize: 16,
    color: '#DDDDDD',
    textAlign: 'center',
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: '#00FF00',
    padding: 5,
    width: '80%',
    borderRadius: 10,
  },
  swipeInstructions: {
    marginTop: 10,
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
  },
  buttonLabel: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default LocationQuizScreen;