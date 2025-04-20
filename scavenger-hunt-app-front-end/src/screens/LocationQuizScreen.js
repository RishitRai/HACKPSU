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
  ActivityIndicator
} from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import axios from 'axios';

const SCREEN_WIDTH = Dimensions.get('window').width;

const LocationQuizScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { currentIndex, nextIndex, trip } = route.params;
  const destination = trip.destinations[nextIndex];
  
  // Quiz data
  const [quizData, setQuizData] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctGuess, setCorrectGuess] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Hint state
  const [currentHint, setCurrentHint] = useState("");
  const [currentHintId, setCurrentHintId] = useState(null);
  const [isHintFinal, setIsHintFinal] = useState(false);
  const [loadingHints, setLoadingHints] = useState(true);
  const [rejectCount, setRejectCount] = useState(0);
  const [acceptCount, setAcceptCount] = useState(0);
  
  // Generate quiz questions and fetch first hint
  useEffect(() => {
    generateQuizQuestions();
    fetchNextHint();
  }, []);
  
  const fetchNextHint = async (userResponse = null) => {
    try {

      if (isHintFinal) {
        return;
      }
      
      setLoadingHints(true);
      
      const response = await axios.post(
        'http://100.64.14.73:5000/generate_location_hint',
        {
          location_name: destination.name,
          previous_hint_id: currentHintId,
          user_response: userResponse,
          reject_count: rejectCount,
          accept_count: acceptCount
        }
      );
      
      const { hint, is_final } = response.data;
      
      setCurrentHint(hint.text);
      setCurrentHintId(hint.id);
      setIsHintFinal(is_final);
      setLoadingHints(false);
      
    } catch (error) {
      console.error("Error fetching hint:", error);
      setCurrentHint("This is a popular location in this area.");
      setLoadingHints(false);
    }
  };
  
  const generateQuizQuestions = () => {
    // Create questions based on the destination
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

  // Function to handle hint feedback
  const handleHintFeedback = (understood) => {
    if (isHintFinal) return;
    
    const userResponse = understood ? "understood" : "confused";
    
    // Increment counters separately from the API call
    if (understood) {
      // Check if we're already at the limit
      if (acceptCount < 7) {
        setAcceptCount(prev1 => prev1 + 1);
      }
    } else {
      // Check if we're already at the limit
      if (rejectCount < 7) {
        setRejectCount(prev => prev + 1);
      }
    }
    
    fetchNextHint(userResponse);
  };

  // Handle answer selection
  const handleAnswerSelection = (option) => {
    if (option.isCorrect) {
      setCorrectGuess(true);
      setQuizCompleted(true);
    } else {
      // Move to next card if available
      if (currentCardIndex < quizData.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // No more cards, quiz is over
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
      <View style={styles.cardStyle}>
        <View style={styles.cardContent}>
          <Text style={styles.questionText}>{item.question}</Text>
          
          {/* Hint Section */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintTitle}>Hint:</Text>
            {loadingHints ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00FF00" />
                <Text style={styles.loadingText}>Generating hint...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.hintText}>{currentHint}</Text>
                {!isHintFinal && (
                  <View style={styles.hintStats}>
                    <Text style={styles.hintStatsText}>
                      Helps: {acceptCount}/7 | Skip: {rejectCount}/7
                    </Text>
                  </View>
                )}
                {!isHintFinal && (
                  <View style={styles.hintFeedbackContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.hintFeedbackButton,
                        acceptCount >= 7 && styles.disabledButton
                      ]}
                      onPress={() => handleHintFeedback(true)}
                      disabled={acceptCount >= 7}
                    >
                      <Text style={styles.hintFeedbackText}>I understand this hint</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.hintFeedbackButton, 
                        styles.hintFeedbackButtonNegative,
                        rejectCount >= 7 && styles.disabledButton
                      ]}
                      onPress={() => handleHintFeedback(false)}
                      disabled={rejectCount >= 7}
                    >
                      <Text style={styles.hintFeedbackText}>I need more help</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
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
      </View>
    );
  };

  const renderNoMoreCards = () => {
    return (
      <View style={styles.noMoreCardsContainer}>
        <Text style={styles.noMoreCardsText}>No more guesses!</Text>
        <Text style={styles.revealText}>The answer was: {destination.name}</Text>
      </View>
    );
  };

  // If quiz is completed, show results screen
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
            onPress={() => navigation.navigate('CheckpointChecker', {
              currentIndex,
              nextIndex,
              trip
            })}
          >
            Continue to Location Check
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Quiz: Guess the Location</Text>
        <Text style={styles.subHeaderText}>{`Question ${currentCardIndex + 1} of ${quizData.length}`}</Text>
      </View>
      
      <View style={styles.cardContainer}>
        {renderCurrentQuestion()}
      </View>
      
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => setQuizCompleted(true)}
      >
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
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#222222',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  hintContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  hintTitle: {
    color: '#00FF00',
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(0, 150, 255, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
  buttonLabel: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default LocationQuizScreen;