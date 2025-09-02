import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuiz } from '../contexts/QuizContext';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<AppStackParamList, 'Quiz'>;

const QuizScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { 
    session,
    answerQuestion,
    saveUserAnswer,
    nextQuestion,
    previousQuestion,
    finishQuiz 
  } = useQuiz();
  
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [animationValue] = useState(new Animated.Value(0));
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  const handleNext = React.useCallback(() => {
    animationValue.setValue(0);
    if (session && session.currentQuestionIndex < session.questions.length - 1) {
      nextQuestion();
    } else if (session) {
      const result = finishQuiz();
      if (result) {
        navigation.navigate('QuizResults');
      }
    }
  }, [session, animationValue, nextQuestion, finishQuiz, navigation]);

  const handlePrevious = () => {
    if (session && session.currentQuestionIndex > 0) {
      previousQuestion();
    } else {
      Alert.alert('Thông báo', 'Đây là câu hỏi đầu tiên.');
    }
  };

  useEffect(() => {
    if (!session) {
      navigation.goBack();
      return;
    }
  }, [session, navigation]);

  useEffect(() => {
    if (!session) return;
    
    // Restore previous answer if exists
    const currentAnswer = session.userAnswers[session.currentQuestionIndex] || userAnswers[session.currentQuestionIndex];
    
    // Reset or restore states
    setTimeLeft(30);
    setSelectedChoice(currentAnswer || null);
    setShowExplanation(!!currentAnswer);

    // Animate question entrance
    Animated.spring(animationValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Timer for current question (only if no answer selected)
    if (!currentAnswer) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Move to next question when time runs out
            handleNext();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session?.currentQuestionIndex, session?.userAnswers, userAnswers, handleNext]);

  const handleChoiceSelect = (choiceId: string) => {
    // Allow changing answer (remove the prevention)
    setSelectedChoice(choiceId);
    
    // Save to local state for navigation
    const newUserAnswers = { ...userAnswers };
    newUserAnswers[session!.currentQuestionIndex] = choiceId;
    setUserAnswers(newUserAnswers);
    
    // Save to context for persistence
    saveUserAnswer(session!.currentQuestionIndex, choiceId);
    
    // Update context
    answerQuestion(choiceId);
    setShowExplanation(true);
    
    // Auto-advance after 2 seconds (only for new selections)
    if (!selectedChoice) {
      setTimeout(() => {
        handleNext();
      }, 2000);
    }
  };

  if (!session) {
    return null;
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

  const translateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const opacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const getChoiceColor = (choiceId: string) => {
    if (!showExplanation) {
      return selectedChoice === choiceId ? 'bg-green-500' : 'bg-white';
    }
    
    const correctChoice = currentQuestion.choices.find(choice => choice.isCorrect);
    if (choiceId === correctChoice?.choiceId) {
      return 'bg-green-500';
    } else if (choiceId === selectedChoice) {
      return 'bg-red-500';
    }
    return 'bg-gray-100';
  };

  const getChoiceTextColor = (choiceId: string) => {
    if (!showExplanation) {
      return selectedChoice === choiceId ? 'text-white' : 'text-gray-800';
    }
    
    const correctChoice = currentQuestion.choices.find(choice => choice.isCorrect);
    if (choiceId === correctChoice?.choiceId || choiceId === selectedChoice) {
      return 'text-white';
    }
    return 'text-gray-800';
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white/10 backdrop-blur-sm">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Text className="text-white text-lg">←</Text>
            </TouchableOpacity>
            
            <View className="bg-white/20 rounded-full px-4 py-2">
              <Text className="text-white font-bold">
                {session.currentQuestionIndex + 1} / {session.questions.length}
              </Text>
            </View>
            
            <View className="bg-white/20 rounded-full px-4 py-2">
              <Text className="text-white font-bold">
                <Text>⏱️</Text> {timeLeft}s
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="bg-white/20 rounded-full h-3 overflow-hidden">
            <Animated.View 
              className="bg-white h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Question Content */}
        <ScrollView className="flex-1 px-6 py-4">
          <Animated.View 
            style={{ 
              transform: [{ translateY }],
              opacity 
            }}
            className="bg-white rounded-3xl p-6 mb-6 shadow-lg"
          >
            <View className="mb-4">
              <Text className="text-green-600 font-bold text-sm mb-2">
                <Text>❓</Text> Câu hỏi {session.currentQuestionIndex + 1}
              </Text>
              <Text className="text-gray-800 text-lg font-semibold leading-6">
                {currentQuestion.questionText}
              </Text>
            </View>

            {/* Choices */}
            <View className="space-y-3">
              {currentQuestion.choices.map((choice, index) => (
                <TouchableOpacity
                  key={choice.choiceId}
                  onPress={() => handleChoiceSelect(choice.choiceId)}
                  className={`p-4 rounded-2xl border-2 ${getChoiceColor(choice.choiceId)} ${
                    selectedChoice === choice.choiceId ? 'border-green-400' : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-8 h-8 rounded-full mr-3 items-center justify-center ${
                      getChoiceColor(choice.choiceId) === 'bg-white' ? 'bg-gray-100' : 'bg-white/20'
                    }`}>
                      <Text className={`font-bold ${
                        getChoiceColor(choice.choiceId) === 'bg-white' ? 'text-gray-600' : 'text-white'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text className={`flex-1 font-medium ${getChoiceTextColor(choice.choiceId)}`}>
                      {choice.content}
                    </Text>
                    {showExplanation && choice.isCorrect && (
                      <Text className="text-white">✓</Text>
                    )}
                    {showExplanation && choice.choiceId === selectedChoice && !choice.isCorrect && (
                      <Text className="text-white">✗</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Explanation */}
            {showExplanation && currentQuestion.explanation && (
              <View className="mt-6 p-4 bg-blue-50 rounded-2xl border-l-4 border-blue-400">
                <Text className="text-blue-800 font-semibold mb-2">
                  <Text>💡</Text> Giải thích:
                </Text>
                <Text className="text-blue-700 leading-5">
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="px-6 py-4 bg-white/10 backdrop-blur-sm">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={session.currentQuestionIndex === 0}
              className={`flex-1 py-4 rounded-2xl border-2 border-white/30 ${
                session.currentQuestionIndex === 0 ? 'opacity-50' : ''
              }`}
            >
              <Text className={`text-center font-bold ${
                session.currentQuestionIndex === 0 ? 'text-gray-500' : 'text-white'
              }`}>
                ← Câu trước
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 bg-white py-4 rounded-2xl"
            >
              <Text className="text-green-600 text-center font-bold">
                {session.currentQuestionIndex === session.questions.length - 1 ? 
                  <><Text>🏁</Text> Kết thúc</> : 
                  <>Câu tiếp →</>
                }
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Manual Navigation Info */}
          <View className="mt-3 bg-white/10 rounded-xl p-3">
            <Text className="text-white text-center text-sm">
              <Text>💡</Text> Tip: Bạn có thể quay lại câu trước để xem lại hoặc thay đổi đáp án
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default QuizScreen;
