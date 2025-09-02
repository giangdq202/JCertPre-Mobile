import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuiz } from "../../contexts/QuizContext";

type RootStackParamList = {
  QuizSetup: undefined;
  Quiz: undefined;
  QuizResults: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const QuizResultsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { session, resetQuiz } = useQuiz();

  if (!session || !session.endTime) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
        <View style={styles.noResultsContainer}>
          <View style={styles.noResultsCard}>
            <Text style={styles.noResultsEmoji}>😕</Text>
            <Text style={styles.noResultsText}>Không có kết quả quiz nào.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const totalTime = session.endTime.getTime() - session.startTime.getTime();
  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  const accuracy =
    session.questions.length > 0
      ? Math.round((session.score / session.questions.length) * 100)
      : 0;
  const correctAnswers = session.score;
  const wrongAnswers = session.questions.length - session.score;

  const handleRetry = () => {
    resetQuiz();
    navigation.navigate("QuizSetup");
  };

  const handleBackToHome = () => {
    resetQuiz();
    navigation.goBack();
  };

  const getPerformanceData = () => {
    if (accuracy >= 90) {
      return {
        emoji: "🏆",
        title: "Xuất sắc!",
        message: "Bạn đã làm rất tốt!",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
      };
    } else if (accuracy >= 70) {
      return {
        emoji: "🎉",
        title: "Tốt lắm!",
        message: "Kết quả khá ấn tượng!",
        color: "#10B981",
        bgColor: "#D1FAE5",
      };
    } else if (accuracy >= 50) {
      return {
        emoji: "👍",
        title: "Khá tốt!",
        message: "Bạn đang tiến bộ!",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
      };
    } else {
      return {
        emoji: "💪",
        title: "Cố gắng thêm!",
        message: "Lần sau sẽ tốt hơn!",
        color: "#F97316",
        bgColor: "#FED7AA",
      };
    }
  };

  const getAnswerStatus = (questionIndex: number) => {
    const answerChoiceId = session.answers[questionIndex];
    if (!answerChoiceId) return { isCorrect: false, status: "Chưa trả lời" };

    const question = session.questions[questionIndex];
    const selectedChoice = question.choices.find(
      (c) => c.choiceId === answerChoiceId
    );
    return {
      isCorrect: selectedChoice?.isCorrect || false,
      status: selectedChoice?.isCorrect ? "Đúng" : "Sai",
      selectedChoice,
      correctChoice: question.choices.find((c) => c.isCorrect),
    };
  };

  const performance = getPerformanceData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏁 Kết quả Quiz</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Performance Card */}
          <View style={styles.performanceCard}>
            <View
              style={[
                styles.performanceHeader,
                { backgroundColor: performance.color },
              ]}
            >
              <Text style={styles.performanceEmoji}>{performance.emoji}</Text>
              <Text style={styles.performanceTitle}>{performance.title}</Text>
              <Text style={styles.performanceMessage}>
                {performance.message}
              </Text>
            </View>

            <View
              style={[
                styles.accuracySection,
                { backgroundColor: performance.bgColor },
              ]}
            >
              <Text style={styles.accuracyPercentage}>{accuracy}%</Text>
              <Text style={styles.accuracyLabel}>Độ chính xác</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Score Card */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statHeaderText}>🎯 Điểm số</Text>
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>
                  {session.score}/{session.questions.length}
                </Text>
                <Text style={styles.statLabel}>Tổng điểm</Text>
              </View>
            </View>

            {/* Time Card */}
            <View style={styles.statCard}>
              <View style={[styles.statHeader, styles.blueHeader]}>
                <Text style={styles.statHeaderText}>⏱️ Thời gian</Text>
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, styles.blueValue]}>
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </Text>
                <Text style={styles.statLabel}>Tổng thời gian</Text>
              </View>
            </View>

            {/* Correct Answers Card */}
            <View style={styles.statCard}>
              <View style={[styles.statHeader, styles.purpleHeader]}>
                <Text style={styles.statHeaderText}>✅ Đúng</Text>
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, styles.purpleValue]}>
                  {correctAnswers}
                </Text>
                <Text style={styles.statLabel}>Câu đúng</Text>
              </View>
            </View>

            {/* Wrong Answers Card */}
            <View style={styles.statCard}>
              <View style={[styles.statHeader, styles.redHeader]}>
                <Text style={styles.statHeaderText}>❌ Sai</Text>
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, styles.redValue]}>
                  {wrongAnswers}
                </Text>
                <Text style={styles.statLabel}>Câu sai</Text>
              </View>
            </View>
          </View>

          {/* Question Breakdown */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownTitle}>📝 Chi tiết từng câu</Text>
            </View>
            <View style={styles.breakdownContent}>
              {session.questions.map((question, index) => {
                const answerStatus = getAnswerStatus(index);

                return (
                  <View key={question.questionId} style={styles.questionCard}>
                    <View style={styles.questionContent}>
                      <View style={styles.questionHeader}>
                        <View style={styles.questionInfo}>
                          <Text style={styles.questionNumber}>
                            Câu {index + 1}
                          </Text>
                          <Text style={styles.questionText}>
                            {question.questionText}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusIndicator,
                            {
                              backgroundColor: answerStatus.isCorrect
                                ? "#10B981"
                                : "#EF4444",
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {answerStatus.isCorrect ? "✓" : "✗"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.questionMeta}>
                        <Text style={styles.resultText}>
                          Kết quả:{" "}
                          <Text
                            style={[
                              styles.resultStatus,
                              {
                                color: answerStatus.isCorrect
                                  ? "#059669"
                                  : "#DC2626",
                              },
                            ]}
                          >
                            {answerStatus.status}
                          </Text>
                        </Text>
                        <Text style={styles.scoreText}>
                          Điểm:{" "}
                          <Text style={styles.scoreValue}>
                            {answerStatus.isCorrect ? 1 : 0}/1
                          </Text>
                        </Text>
                      </View>

                      {/* Show choices */}
                      <View style={styles.choicesContainer}>
                        {question.choices.map((choice, choiceIndex) => {
                          const isUserChoice =
                            answerStatus.selectedChoice?.choiceId ===
                            choice.choiceId;
                          const isCorrectChoice = choice.isCorrect;

                          let choiceStyle;
                          if (isCorrectChoice) {
                            choiceStyle = styles.correctChoice;
                          } else if (isUserChoice && !isCorrectChoice) {
                            choiceStyle = styles.incorrectChoice;
                          } else {
                            choiceStyle = styles.defaultChoice;
                          }

                          return (
                            <View key={choice.choiceId} style={choiceStyle}>
                              <View style={styles.choiceContent}>
                                <View
                                  style={[
                                    styles.choiceLetter,
                                    isCorrectChoice
                                      ? styles.correctLetter
                                      : isUserChoice && !isCorrectChoice
                                      ? styles.incorrectLetter
                                      : styles.defaultLetter,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.choiceLetterText,
                                      isCorrectChoice
                                        ? styles.correctLetterText
                                        : isUserChoice && !isCorrectChoice
                                        ? styles.incorrectLetterText
                                        : styles.defaultLetterText,
                                    ]}
                                  >
                                    {isCorrectChoice
                                      ? "✓"
                                      : isUserChoice && !isCorrectChoice
                                      ? "✗"
                                      : String.fromCharCode(65 + choiceIndex)}
                                  </Text>
                                </View>
                                <Text
                                  style={[
                                    styles.choiceText,
                                    isCorrectChoice
                                      ? styles.correctChoiceText
                                      : isUserChoice && !isCorrectChoice
                                      ? styles.incorrectChoiceText
                                      : styles.defaultChoiceText,
                                  ]}
                                >
                                  {choice.content}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>

                      {/* Show explanation if available */}
                      {question.explanation && (
                        <View style={styles.explanationContainer}>
                          <View style={styles.explanationHeader}>
                            <Text style={styles.explanationIcon}>💡</Text>
                            <View style={styles.explanationContent}>
                              <Text style={styles.explanationTitle}>
                                Giải thích:
                              </Text>
                              <Text style={styles.explanationText}>
                                {question.explanation}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.actionButtonEmoji}>🔄</Text>
              <Text style={styles.actionButtonText}>Xem lại câu hỏi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBackToHome}
              style={styles.homeButton}
            >
              <Text style={styles.actionButtonEmoji}>🏠</Text>
              <Text style={styles.actionButtonText}>Làm quiz mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: 16,
    textAlign: "center",
  },
  noResultsText: {
    color: "#065F46",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#059669",
    paddingHorizontal: screenWidth > 768 ? 24 : 20,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 20 : 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: screenWidth > 768 ? 24 : 20,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  performanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  performanceHeader: {
    padding: screenWidth > 768 ? 32 : 24,
    alignItems: "center",
  },
  performanceEmoji: {
    fontSize: screenWidth > 768 ? 64 : 56,
    marginBottom: 16,
  },
  performanceTitle: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 28 : 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  performanceMessage: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 18 : 16,
    opacity: 0.9,
    textAlign: "center",
  },
  accuracySection: {
    padding: screenWidth > 768 ? 32 : 24,
    alignItems: "center",
  },
  accuracyPercentage: {
    fontSize: screenWidth > 768 ? 64 : 56,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  accuracyLabel: {
    color: "#6B7280",
    fontSize: screenWidth > 768 ? 18 : 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: screenWidth > 768 ? 160 : 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  statHeader: {
    backgroundColor: "#10B981",
    padding: 16,
  },
  blueHeader: {
    backgroundColor: "#3B82F6",
  },
  purpleHeader: {
    backgroundColor: "#8B5CF6",
  },
  redHeader: {
    backgroundColor: "#EF4444",
  },
  statHeaderText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  statContent: {
    padding: 20,
    alignItems: "center",
  },
  statValue: {
    fontSize: screenWidth > 768 ? 36 : 32,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 8,
  },
  blueValue: {
    color: "#3B82F6",
  },
  purpleValue: {
    color: "#8B5CF6",
  },
  redValue: {
    color: "#EF4444",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: screenWidth > 768 ? 14 : 12,
    fontWeight: "500",
    textAlign: "center",
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  breakdownHeader: {
    backgroundColor: "#6B7280",
    padding: 20,
  },
  breakdownTitle: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 20 : 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  breakdownContent: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  questionContent: {
    padding: 20,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  questionInfo: {
    flex: 1,
    marginRight: 16,
  },
  questionNumber: {
    fontSize: screenWidth > 768 ? 18 : 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  questionText: {
    color: "#374151",
    fontSize: screenWidth > 768 ? 16 : 14,
    lineHeight: screenWidth > 768 ? 22 : 20,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  questionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultText: {
    color: "#6B7280",
    fontSize: screenWidth > 768 ? 14 : 12,
    fontWeight: "500",
  },
  resultStatus: {
    fontWeight: "bold",
  },
  scoreText: {
    color: "#6B7280",
    fontSize: screenWidth > 768 ? 14 : 12,
    fontWeight: "500",
  },
  scoreValue: {
    fontWeight: "bold",
    color: "#3B82F6",
  },
  choicesContainer: {
    gap: 8,
    marginBottom: 16,
  },
  choiceItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  defaultChoice: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  correctChoice: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
    backgroundColor: "#D1FAE5",
  },
  incorrectChoice: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2",
  },
  choiceContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  choiceLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultLetter: {
    backgroundColor: "#F3F4F6",
  },
  correctLetter: {
    backgroundColor: "#10B981",
  },
  incorrectLetter: {
    backgroundColor: "#EF4444",
  },
  choiceLetterText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  defaultLetterText: {
    color: "#6B7280",
  },
  correctLetterText: {
    color: "#FFFFFF",
  },
  incorrectLetterText: {
    color: "#FFFFFF",
  },
  choiceText: {
    flex: 1,
    fontSize: screenWidth > 768 ? 14 : 13,
  },
  defaultChoiceText: {
    color: "#6B7280",
  },
  correctChoiceText: {
    color: "#065F46",
    fontWeight: "500",
  },
  incorrectChoiceText: {
    color: "#DC2626",
  },
  explanationContainer: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  explanationIcon: {
    fontSize: 20,
  },
  explanationContent: {
    flex: 1,
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
  actionButtons: {
    gap: 16,
    marginBottom: 32,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    backgroundColor: "#3B82F6",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    backgroundColor: "#10B981",
  },
  actionButtonEmoji: {
    fontSize: screenWidth > 768 ? 24 : 20,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 18 : 16,
    fontWeight: "bold",
  },
});

export default QuizResultsScreen;
