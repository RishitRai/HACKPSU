import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  PanResponder, 
  Image, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useTheme, Button, Icon } from 'react-native-paper';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

const LocationQuizScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { currentIndex, nextIndex, trip } = route.params;
  const destination = trip.destinations[nextIndex];
  
  // Quiz data - we'll generate this based on the destination
  const [quizData, setQuizData] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctGuess, setCorrectGuess] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  const position = useRef(new Animated.ValueXY()).current;
  
  // Generate quiz questions based on the destination
  useEffect(() => {
    generateQuizQuestions();
  }, []);
  
  const generateQuizQuestions = () => {
    // This would ideally come from an API or database
    // For now we'll create mock questions based on the destination
    const questions = [
      {
        question: "What is this location?",
        options: [
          { text: destination.name, isCorrect: true },
          { text: "Central Park", isCorrect: false },
          { text: "Times Square", isCorrect: false },
        ],
        hint: "This is a popular destination in the area."
      },
      {
        question: "What can you find at this location?",
        options: [
          { text: "A famous statue", isCorrect: false },
          { text: "Historical landmarks", isCorrect: true },
          { text: "Amusement rides", isCorrect: false },
        ],
        hint: "Think about what this place is known for."
      },
      {
        question: "What's the best way to travel to this location?",
        options: [
          { text: "By boat", isCorrect: false },
          { text: "By subway", isCorrect: false },
          { text: destination.modeOfTransport, isCorrect: true },
        ],
        hint: "Check the recommended mode of transport in your journey."
      }
    ];
    
    setQuizData(questions);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction) => {
    const item = quizData[currentCardIndex];
    let optionIndex = direction === 'right' ? 0 : (direction === 'left' ? 2 : 1);
    
    // Check if the swipe corresponds to the correct answer
    if (item.options[optionIndex].isCorrect) {
      setCorrectGuess(true);
      setQuizCompleted(true);
    } else {
      // Move to next card if available
      if (currentCardIndex < quizData.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        position.setValue({ x: 0, y: 0 });
      } else {
        // No more cards, quiz is over
        setQuizCompleted(true);
      }
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-30deg', '0deg', '30deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  };

  const renderCard = () => {
    if (currentCardIndex >= quizData.length) {
      return renderNoMoreCards();
    }

    const item = quizData[currentCardIndex];
    
    return (
      <Animated.View
        style={[styles.cardStyle, getCardStyle()]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cardContent}>
          <Text style={styles.questionText}>{item.question}</Text>
          
          <View style={styles.optionsContainer}>
            <View style={[styles.optionIndicator, { backgroundColor: '#00FF00' }]}>
              <Text style={styles.optionIndicatorText}>← Swipe</Text>
            </View>
            
            <View style={styles.optionsRow}>
              <View style={styles.option}>
                <Text style={styles.optionText}>{item.options[2].text}</Text>
              </View>
              
              <View style={styles.option}>
                <Text style={styles.optionText}>{item.options[1].text}</Text>
              </View>
              
              <View style={styles.option}>
                <Text style={styles.optionText}>{item.options[0].text}</Text>
              </View>
            </View>
            
            <View style={[styles.optionIndicator, { backgroundColor: '#FF4500' }]}>
              <Text style={styles.optionIndicatorText}>Swipe →</Text>
            </View>
          </View>
          
          <View style={styles.hintContainer}>
            <Text style={styles.hintTitle}>Hint:</Text>
            <Text style={styles.hintText}>{item.hint}</Text>
          </View>
        </View>
      </Animated.View>
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
        {renderCard()}
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
  },
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: 400,
    borderRadius: 15,
    backgroundColor: '#222222',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  optionIndicator: {
    padding: 10,
    borderRadius: 10,
    width: 80,
  },
  optionIndicatorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
  option: {
    alignItems: 'center',
  },
  optionText: {
    color: '#FFFFFF',
    textAlign: 'center',
    width: 60,
  },
  hintContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  hintTitle: {
    color: '#00FF00',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hintText: {
    color: '#DDDDDD',
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
    width: SCREEN_WIDTH * 0.9,
    height: 400,
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