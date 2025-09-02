import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import Icon from "react-native-vector-icons/FontAwesome";

import { useAuth } from "../auth/AuthContext";
import { useLessonProgress } from "../hooks/useLessonProgress";

import {
  TestAttemptDto,
  startTestAttempt,
  submitTestAttempt,
  getTestAttemptWithScoreSummary,
  getAttemptAnswersByAttemptId,
  addOrUpdateAttemptAnswer,
} from "../services/testAttemptService";

import { TestDto } from "../types/testDto";
import { getQuestionsByTestId } from "../services/testQuestionService";
import { getQuestionById } from "../services/questionService";

export interface QuestionAttachment {
  mediaType: string;
  mediaUrl: string;
}

export interface Choice {
  choiceId: string;
  content: string;
}

export interface QuestionDto {
  id: string;
  content: string;
  points: number;
  questionAttachments?: QuestionAttachment[];
  choices?: Choice[];
}

interface TestInterfaceProps {
  test: TestDto;
  lessonId?: string;
  courseId?: string;
  onBack: () => void;
  onTestCompleted?: () => void;
}

interface QuestionWithDetails {
  testQuestion: { questionId: string; questionNumber: number };
  questionDetails: QuestionDto;
}

interface UserAnswer {
  questionId: string;
  choiceId?: string;
  textAnswer?: string;
}

export const TestInterface: React.FC<TestInterfaceProps> = ({
  test,
  lessonId,
  courseId,
  onBack,
  onTestCompleted,
}) => {
  const { userInfo } = useAuth();
  const { markLessonCompleted } = useLessonProgress();

  const [currentAttempt, setCurrentAttempt] = useState<TestAttemptDto | null>(
    null
  );
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [testStatus, setTestStatus] = useState<
    "not_started" | "in_progress" | "completed" | "time_up"
  >("not_started");
  const [testResult, setTestResult] = useState<any | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, Audio.Sound>>({});

  // ---------- TIMER ----------
  useEffect(() => {
    if (testStatus === "in_progress" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (testStatus === "in_progress" && timeLeft === 0) {
      handleAutoSubmit();
    }
  }, [timeLeft, testStatus]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ---------- AUDIO ----------
  const handlePlayAudio = async (audioUrl: string) => {
    try {
      if (playingAudio && playingAudio !== audioUrl) {
        const prevAudio = audioRefs.current[playingAudio];
        if (prevAudio) await prevAudio.stopAsync();
      }
      let audio = audioRefs.current[audioUrl];
      if (!audio) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );
        audioRefs.current[audioUrl] = sound;
        audio = sound;
        audio.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) setPlayingAudio(null);
        });
      } else {
        await audio.playAsync();
      }
      setPlayingAudio(audioUrl);
    } catch (err) {
      Alert.alert("Lỗi audio", "Không thể phát âm thanh");
      setPlayingAudio(null);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((sound) => sound.unloadAsync());
      audioRefs.current = {};
    };
  }, []);

  // ---------- LOAD QUESTIONS ----------
  useEffect(() => {
    const loadTotalQuestions = async () => {
      try {
        const testQuestions = await getQuestionsByTestId(test.testId);
        setTotalQuestions(testQuestions.length);
      } catch (err) {
        setTotalQuestions(0);
      }
    };
    loadTotalQuestions();
  }, [test.testId]);

  // ---------- START TEST ----------
  const handleStartTest = async () => {
    if (!userInfo?.id)
      return Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập");
    setIsLoading(true);
    try {
      const attempt = await startTestAttempt({
        testId: test.testId,
        userId: userInfo.id,
      });
      setCurrentAttempt(attempt);

      setTimeLeft(
        Math.max(
          0,
          Math.floor((new Date(attempt.endTime).getTime() - Date.now()) / 1000)
        )
      );

      const testQuestions = await getQuestionsByTestId(test.testId);
      const questionsWithDetails: QuestionWithDetails[] = await Promise.all(
        testQuestions.map(async (tq) => ({
          testQuestion: tq,
          questionDetails: await getQuestionById(tq.questionId),
        }))
      );
      questionsWithDetails.sort(
        (a, b) => a.testQuestion.questionNumber - b.testQuestion.questionNumber
      );
      setQuestions(questionsWithDetails);

      const existingAnswers = await getAttemptAnswersByAttemptId(
        attempt.attemptId
      );
      const answersMap: Record<string, UserAnswer> = {};
      existingAnswers.forEach((ans: UserAnswer) => {
        answersMap[ans.questionId] = {
          questionId: ans.questionId,
          choiceId: ans.choiceId,
          textAnswer: ans.textAnswer,
        };
      });

      setUserAnswers(answersMap);

      setTestStatus("in_progress");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể bắt đầu bài test");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- ANSWER CHANGE ----------
  const handleAnswerChange = async (
    questionId: string,
    choiceId?: string,
    textAnswer?: string
  ) => {
    if (!currentAttempt) return;
    const newAnswer: UserAnswer = { questionId, choiceId, textAnswer };
    setUserAnswers((prev) => ({ ...prev, [questionId]: newAnswer }));
    try {
      await addOrUpdateAttemptAnswer({
        attemptId: currentAttempt.attemptId,
        questionId,
        choiceId,
        textAnswer,
      });
    } catch (err) {
      // Handle error silently
    }
  };

  // ---------- SUBMIT ----------
  const handleAutoSubmit = async () => {
    setTestStatus("time_up");
    await handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!currentAttempt) return;
    setIsSubmitting(true);
    try {
      await submitTestAttempt({ attemptId: currentAttempt.attemptId });
      const result = await getTestAttemptWithScoreSummary(
        currentAttempt.attemptId
      );
      setTestResult(result);
      setTestStatus("completed");

      if (result?.attempt?.isPass && lessonId && courseId) {
        await markLessonCompleted(lessonId, courseId);
        Alert.alert("Chúc mừng!", "Bạn đã pass bài test!");
      } else {
        Alert.alert("Nộp bài thành công", "Kết quả test đã được lưu");
      }
      onTestCompleted?.();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể nộp bài");
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  const getAnsweredQuestionsCount = () => Object.keys(userAnswers).length;

  // ---------- RENDER ----------
  if (testStatus === "not_started") {
    return (
      <View style={styles.container}>
        <Icon
          name="play"
          size={60}
          color="#3B82F6"
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.title}>{test.title}</Text>
        <Text style={styles.description}>{test.description}</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleStartTest} style={styles.startButton}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Bắt đầu làm bài</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (testStatus === "completed" && testResult) {
    return (
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.completedContainer}>
          <Icon
            name="check-circle"
            size={60}
            color="#22C55E"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.completedTitle}>Hoàn thành bài test!</Text>
          {testResult.scoreSummary && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Tổng điểm: {testResult.scoreSummary.total_score}/
                {testResult.scoreSummary.total_max_score}
              </Text>
              <Text style={styles.resultText}>
                Kết quả: {testResult.attempt.isPass ? "ĐẠT" : "KHÔNG ĐẠT"}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.buttonText}>Quay lại bài học</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (testStatus === "in_progress" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestion.questionDetails.id];

    return (
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{test.title}</Text>
          <Text style={styles.headerSubtitle}>
            Câu {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <Text style={styles.headerSubtitle}>
            Thời gian còn lại: {formatTime(timeLeft)}
          </Text>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            Câu {currentQuestion.testQuestion.questionNumber} -{" "}
            {currentQuestion.questionDetails.points} điểm
          </Text>
          <Text style={styles.questionContent}>
            {currentQuestion.questionDetails.content}
          </Text>

          {currentQuestion.questionDetails.questionAttachments?.map(
            (att, idx) => {
              if (att.mediaType.startsWith("image/")) {
                return (
                  <Image
                    key={idx}
                    source={{ uri: att.mediaUrl }}
                    style={styles.questionImage}
                  />
                );
              } else if (att.mediaType.startsWith("audio/")) {
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handlePlayAudio(att.mediaUrl)}
                    style={styles.audioButton}
                  >
                    <Icon
                      name={playingAudio === att.mediaUrl ? "pause" : "play"}
                      size={16}
                      color="#1E40AF"
                    />
                    <Text style={styles.audioText}>
                      {playingAudio === att.mediaUrl
                        ? "Tạm dừng"
                        : "Phát audio"}
                    </Text>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity key={idx} style={styles.fileButton}>
                    <Text>Tải file {att.mediaType}</Text>
                  </TouchableOpacity>
                );
              }
            }
          )}
        </View>

        {currentQuestion.questionDetails.choices?.map((choice) => (
          <TouchableOpacity
            key={choice.choiceId}
            onPress={() =>
              handleAnswerChange(
                currentQuestion.questionDetails.id,
                choice.choiceId
              )
            }
            style={[
              styles.choiceButton,
              currentAnswer?.choiceId === choice.choiceId &&
                styles.selectedChoice,
            ]}
          >
            <Text style={styles.choiceText}>{choice.content}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={() =>
              setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
            }
            style={styles.navButton}
          >
            <Text style={styles.buttonText}>Câu trước</Text>
          </TouchableOpacity>
          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              onPress={() => setCurrentQuestionIndex((prev) => prev + 1)}
              style={[styles.navButton, styles.nextButton]}
            >
              <Text style={styles.buttonText}>Câu tiếp</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowSubmitConfirm(true)}
              style={[styles.navButton, styles.submitButton]}
            >
              <Text style={styles.buttonText}>Nộp bài</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal visible={showSubmitConfirm} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Xác nhận nộp bài</Text>
              <Text style={styles.modalText}>
                Bạn đã trả lời {getAnsweredQuestionsCount()}/{totalQuestions}{" "}
                câu hỏi.
              </Text>
              <Text style={styles.modalText}>
                Bạn có chắc chắn muốn nộp bài?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setShowSubmitConfirm(false)}
                  style={styles.modalButton}
                >
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitTest}
                  style={[styles.modalButton, styles.submitButton]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Nộp bài</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>Đang tải bài test...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#6B7280",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  completedContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  scoreContainer: {
    width: "100%",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  resultText: {
    fontSize: 16,
  },
  headerContainer: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  headerSubtitle: {
    color: "#DBEAFE",
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1F2937",
  },
  questionContent: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
  },
  questionImage: {
    width: "100%",
    height: 192,
    borderRadius: 8,
    marginBottom: 16,
  },
  audioButton: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  audioText: {
    marginLeft: 8,
  },
  fileButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  choiceButton: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  selectedChoice: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  choiceText: {
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  navButton: {
    backgroundColor: "#6B7280",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nextButton: {
    backgroundColor: "#2563EB",
  },
  submitButton: {
    backgroundColor: "#059669",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 8,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalText: {
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    backgroundColor: "#6B7280",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.45,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    color: "#666",
    marginTop: 8,
  },
});
