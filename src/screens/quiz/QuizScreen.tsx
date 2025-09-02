import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuiz } from "../../contexts/QuizContext";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppStackParamList } from "../../navigation/types";

type NavigationProp = StackNavigationProp<AppStackParamList, "Quiz">;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const QuizScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    session,
    answerQuestion,
    saveUserAnswer,
    nextQuestion,
    previousQuestion,
    finishQuiz,
  } = useQuiz();

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [animationValue] = useState(new Animated.Value(0));
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  const handleNext = React.useCallback(() => {
    animationValue.setValue(0);
    if (
      session &&
      session.currentQuestionIndex < session.questions.length - 1
    ) {
      nextQuestion();
    } else if (session) {
      const result = finishQuiz();
      if (result) {
        navigation.navigate("QuizResults");
      }
    }
  }, [session, animationValue, nextQuestion, finishQuiz, navigation]);

  const handlePrevious = () => {
    if (session && session.currentQuestionIndex > 0) {
      previousQuestion();
    } else {
      Alert.alert("Thông báo", "Đây là câu hỏi đầu tiên.");
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
    const currentAnswer =
      session.userAnswers[session.currentQuestionIndex] ||
      userAnswers[session.currentQuestionIndex];

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
        setTimeLeft((prev) => {
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
  }, [
    session?.currentQuestionIndex,
    session?.userAnswers,
    userAnswers,
    handleNext,
  ]);

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
  const progress =
    ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

  const translateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const opacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const getChoiceStyle = (choiceId: string) => {
    if (!showExplanation) {
      return selectedChoice === choiceId
        ? styles.selectedChoice
        : styles.defaultChoice;
    }

    const correctChoice = currentQuestion.choices.find(
      (choice) => choice.isCorrect
    );
    if (choiceId === correctChoice?.choiceId) {
      return styles.correctChoice;
    } else if (choiceId === selectedChoice) {
      return styles.incorrectChoice;
    }
    return styles.defaultChoice;
  };

  const getChoiceTextStyle = (choiceId: string) => {
    if (!showExplanation) {
      return selectedChoice === choiceId
        ? styles.selectedChoiceText
        : styles.defaultChoiceText;
    }

    const correctChoice = currentQuestion.choices.find(
      (choice) => choice.isCorrect
    );
    if (choiceId === correctChoice?.choiceId || choiceId === selectedChoice) {
      return styles.selectedChoiceText;
    }
    return styles.defaultChoiceText;
  };

  const getChoiceLetterStyle = (choiceId: string) => {
    if (!showExplanation) {
      return selectedChoice === choiceId
        ? styles.selectedChoiceLetter
        : styles.defaultChoiceLetter;
    }

    const correctChoice = currentQuestion.choices.find(
      (choice) => choice.isCorrect
    );
    if (choiceId === correctChoice?.choiceId || choiceId === selectedChoice) {
      return styles.selectedChoiceLetter;
    }
    return styles.defaultChoiceLetter;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#10b981", "#059669", "#047857"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {session.currentQuestionIndex + 1} / {session.questions.length}
              </Text>
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBar, { width: `${progress}%` }]}
            />
          </View>
        </View>

        {/* Question Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.questionCard,
              {
                transform: [{ translateY }],
                opacity,
              },
            ]}
          >
            <View style={styles.questionHeader}>
              <Text style={styles.questionLabel}>
                ❓ Câu hỏi {session.currentQuestionIndex + 1}
              </Text>
              <Text style={styles.questionText}>
                {currentQuestion.questionText}
              </Text>
            </View>

            {/* Choices */}
            <View style={styles.choicesContainer}>
              {currentQuestion.choices.map((choice, index) => (
                <TouchableOpacity
                  key={choice.choiceId}
                  onPress={() => handleChoiceSelect(choice.choiceId)}
                  style={[styles.choiceButton, getChoiceStyle(choice.choiceId)]}
                >
                  <View style={styles.choiceContent}>
                    <View
                      style={[
                        styles.choiceLetter,
                        getChoiceLetterStyle(choice.choiceId),
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceLetterText,
                          getChoiceTextStyle(choice.choiceId),
                        ]}
                      >
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.choiceText,
                        getChoiceTextStyle(choice.choiceId),
                      ]}
                    >
                      {choice.content}
                    </Text>
                    {showExplanation && choice.isCorrect && (
                      <Text style={styles.correctIcon}>✓</Text>
                    )}
                    {showExplanation &&
                      choice.choiceId === selectedChoice &&
                      !choice.isCorrect && (
                        <Text style={styles.incorrectIcon}>✗</Text>
                      )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Explanation */}
            {showExplanation && currentQuestion.explanation && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>💡 Giải thích:</Text>
                <Text style={styles.explanationText}>
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={session.currentQuestionIndex === 0}
              style={[
                styles.navButton,
                styles.previousButton,
                session.currentQuestionIndex === 0 && styles.disabledButton,
              ]}
            >
              <Text
                style={[
                  styles.navButtonText,
                  session.currentQuestionIndex === 0 &&
                    styles.disabledButtonText,
                ]}
              >
                ← Câu trước
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.navButton, styles.nextButton]}
            >
              <Text style={styles.nextButtonText}>
                {session.currentQuestionIndex === session.questions.length - 1
                  ? "🏁 Kết thúc"
                  : "Câu tiếp →"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Navigation Info */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              💡 Tip: Bạn có thể quay lại câu trước để xem lại hoặc thay đổi đáp
              án
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: screenWidth > 768 ? 24 : 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 18 : 16,
    fontWeight: "bold",
  },
  progressContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "bold",
  },
  timerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "bold",
  },
  progressBarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    height: 12,
    overflow: "hidden",
  },
  progressBar: {
    backgroundColor: "#FFFFFF",
    height: "100%",
    borderRadius: 6,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: screenWidth > 768 ? 24 : 20,
    paddingVertical: 16,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: screenWidth > 768 ? 24 : 20,
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionLabel: {
    color: "#059669",
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  questionText: {
    color: "#1F2937",
    fontSize: screenWidth > 768 ? 18 : 16,
    fontWeight: "600",
    lineHeight: screenWidth > 768 ? 26 : 24,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  defaultChoice: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  selectedChoice: {
    backgroundColor: "#10B981",
    borderColor: "#34D399",
  },
  correctChoice: {
    backgroundColor: "#10B981",
    borderColor: "#34D399",
  },
  incorrectChoice: {
    backgroundColor: "#EF4444",
    borderColor: "#F87171",
  },
  choiceContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  choiceLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultChoiceLetter: {
    backgroundColor: "#F3F4F6",
  },
  selectedChoiceLetter: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  choiceLetterText: {
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "bold",
  },
  defaultChoiceText: {
    color: "#6B7280",
  },
  selectedChoiceText: {
    color: "#FFFFFF",
  },
  choiceText: {
    flex: 1,
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "500",
    lineHeight: screenWidth > 768 ? 22 : 20,
  },
  correctIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  incorrectIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  explanationContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  explanationTitle: {
    color: "#1E40AF",
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  explanationText: {
    color: "#1E3A8A",
    fontSize: screenWidth > 768 ? 14 : 13,
    lineHeight: screenWidth > 768 ? 20 : 18,
  },
  bottomNavigation: {
    paddingHorizontal: screenWidth > 768 ? 24 : 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  previousButton: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "transparent",
  },
  nextButton: {
    backgroundColor: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  nextButtonText: {
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "bold",
    color: "#059669",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
  tipContainer: {
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
  },
  tipText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 14 : 12,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default QuizScreen;
