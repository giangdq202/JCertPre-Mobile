import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Image,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Audio } from "expo-av";
import Icon from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import { useAuth } from "../../auth/AuthContext";
import {
  TestType,
  CourseLevel,
  createAutoTest,
  createTestFromTemplate,
  CreateAutoTestInput,
} from "../../services/testService";
import {
  startTestAttempt,
  submitTestAttempt,
  getTestAttemptWithScoreSummary,
  TestAttemptDto,
  TestAttemptWithScoreSummary,
} from "../../services/testAttemptService";
import {
  getQuestionsByTestId,
  TestQuestionDto,
} from "../../services/testQuestionService";
import { getQuestionById } from "../../services/questionService";
import { addOrUpdateAttemptAnswer } from "../../services/attemptAnswerService";
import {
  updateStudentLevel,
  getStudentProfile,
} from "../../services/studentProfileService";

const { width: screenWidth } = Dimensions.get("window");

type RootStackParamList = {
  TestDetail: {
    testOption: {
      id: string;
      title: string;
      testType: TestType;
      courseLevel: CourseLevel;
      estimatedDuration: number;
      templates: any[];
    };
  };
};

interface TestPart {
  partNumber: number;
  partName: string;
  durationMinutes: number;
  questions: TestQuestionDto[];
}

interface QuestionWithChoices {
  id: string;
  content: string;
  points: number;
  choices?: Array<{ id: string; content: string; isCorrect: boolean }>;
  questionAttachments?: Array<{ mediaType: string; mediaUrl: string }>;
}

const TestDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "TestDetail">>();
  const navigation = useNavigation();
  const { testOption } = route.params;
  const { userInfo } = useAuth();

  // Test states
  const [test, setTest] = useState<any>(null);
  const [testAttempt, setTestAttempt] = useState<TestAttemptDto | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestionDto[]>([]);
  const [testParts, setTestParts] = useState<TestPart[]>([]);

  // Current state
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionWithChoices | null>(null);

  // Timer states
  const [partTimeLeft, setPartTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [isPartTimeUp, setIsPartTimeUp] = useState(false);

  // Answer states
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Result states
  const [testResult, setTestResult] =
    useState<TestAttemptWithScoreSummary | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Audio states
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, Audio.Sound>>({});

  // Group questions by parts
  const groupQuestionsByParts = (questions: TestQuestionDto[]): TestPart[] => {
    console.log("Raw questions from API:", questions);

    const partsMap = new Map<number, TestPart>();

    questions.forEach((question) => {
      const partNum = question.partNumber || 1;
      console.log(
        `Question ${question.questionNumber}: partNumber=${question.partNumber}, partDurationMinutes=${question.partDurationMinutes}`
      );

      if (!partsMap.has(partNum)) {
        partsMap.set(partNum, {
          partNumber: partNum,
          partName: `Part ${partNum}`,
          durationMinutes: question.partDurationMinutes || 30,
          questions: [],
        });
      }
      partsMap.get(partNum)!.questions.push(question);
    });

    // Sort parts by part number and questions by question number
    const parts = Array.from(partsMap.values()).sort(
      (a, b) => a.partNumber - b.partNumber
    );
    parts.forEach((part) => {
      part.questions.sort((a, b) => a.questionNumber - b.questionNumber);
    });

    console.log("Grouped parts:", parts);
    return parts;
  };

  // Load question details
  const loadQuestion = async (questionId: string) => {
    try {
      const questionDetail = await getQuestionById(questionId);
      const convertedQuestion: QuestionWithChoices = {
        ...questionDetail,
        choices: questionDetail.choices?.map((choice) => ({
          id: choice.choiceId,
          content: choice.content,
          isCorrect: choice.isCorrect,
        })),
      };
      setCurrentQuestion(convertedQuestion);
    } catch (err) {
      // console.error("Failed to load question:", err);
      Alert.alert("Lỗi", "Không thể tải chi tiết câu hỏi");
    }
  };

  // Audio handling
  const handlePlayAudio = async (audioUrl: string) => {
    try {
      if (playingAudio === audioUrl) {
        if (audioRefs.current[audioUrl]) {
          await audioRefs.current[audioUrl].stopAsync();
          await audioRefs.current[audioUrl].unloadAsync();
          delete audioRefs.current[audioUrl];
        }
        setPlayingAudio(null);
        return;
      }

      if (playingAudio && audioRefs.current[playingAudio]) {
        await audioRefs.current[playingAudio].stopAsync();
        await audioRefs.current[playingAudio].unloadAsync();
        delete audioRefs.current[playingAudio];
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      audioRefs.current[audioUrl] = sound;
      setPlayingAudio(audioUrl);

      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
          delete audioRefs.current[audioUrl];
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Lỗi", "Không thể phát audio");
    }
  };

  // Cleanup audio
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(async (sound) => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          console.error("Error cleaning up audio:", error);
        }
      });
    };
  }, []);

  // Initialize test
  const initializeTest = async () => {
    if (!userInfo?.id) {
      Alert.alert("Lỗi đăng nhập", "Vui lòng đăng nhập để làm bài thi");
      return;
    }

    console.log(
      "TestDetailScreen - testType:",
      testOption.testType,
      "Type of:",
      typeof testOption.testType
    );
    console.log(
      "TestDetailScreen - courseLevel:",
      testOption.courseLevel,
      "Type of:",
      typeof testOption.courseLevel
    );

    setLoading(true);
    try {
      // Step 1: Create auto test
      const autoTestInput: CreateAutoTestInput = {
        testType: testOption.testType,
        courseLevel: testOption.courseLevel,
      };

      console.log("CreateAutoTestInput:", autoTestInput);
      console.log("TestOption templates:", testOption.templates);

      let createdTestResult;
      try {
        createdTestResult = await createAutoTest(autoTestInput, userInfo.id);
      } catch (createError: any) {
        console.log(
          "Auto test creation failed, trying template approach:",
          createError
        );

        // If auto-create fails, try using the first available template
        if (testOption.templates && testOption.templates.length > 0) {
          const firstTemplate = testOption.templates[0];
          console.log("Using template fallback:", firstTemplate);

          try {
            createdTestResult = await createTestFromTemplate(
              firstTemplate.templateId,
              userInfo.id,
              testOption.testType,
              testOption.courseLevel
            );
          } catch (templateError: any) {
            console.log("Template approach also failed:", templateError);

            // Create a mock test result as last resort
            createdTestResult = {
              testId: `template_${firstTemplate.templateId}_${Date.now()}`,
              title: testOption.title,
              description: `Bài thi ${testOption.title} được tạo từ template`,
            };
          }
        } else {
          throw createError;
        }
      }

      // Convert CreateAutoTestResult to TestDto format
      const createdTest = {
        testId: createdTestResult.testId,
        title: createdTestResult.title || "Auto Generated Test",
        description: createdTestResult.description || "",
        testType: testOption.testType,
        courseLevel: testOption.courseLevel,
        durationMinutes: 0,
        maxAttempts: 3,
        availableFrom: new Date().toISOString(),
        availableTo: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: 1,
        createdByUserId: userInfo.id,
      };
      setTest(createdTest);

      // Step 2: Start test attempt
      const attempt = await startTestAttempt({
        testId: createdTest.testId,
        userId: userInfo.id,
      });
      setTestAttempt(attempt);

      // Step 3: Get all test questions
      const questions = await getQuestionsByTestId(createdTest.testId);
      setTestQuestions(questions);

      // Step 4: Group questions by parts
      const parts = groupQuestionsByParts(questions);
      setTestParts(parts);

      // Step 5: Calculate total time and part time
      const totalDuration = parts.reduce(
        (sum, part) => sum + part.durationMinutes,
        0
      );
      setTotalTimeLeft(totalDuration * 60);
      setPartTimeLeft(parts[0]?.durationMinutes * 60 || 0);

      // Step 6: Load first question
      if (parts[0]?.questions[0]) {
        await loadQuestion(parts[0].questions[0].questionId);
      }

      Alert.alert("Thành công", "Bài thi đã được khởi tạo thành công");
    } catch (err: any) {
      console.log("Failed to initialize test:", err);
      if (err?.response?.data?.errorCode === "MAX_ATTEMPTS_REACHED") {
        Alert.alert(
          "Số lần làm bài đã đạt giới hạn",
          "Bạn đã sử dụng hết số lần làm bài cho phép!"
        );
      } else if (err?.response?.status === 400) {
        Alert.alert(
          "Chưa có mẫu đề thi",
          "Hệ thống chưa có mẫu đề thi cho loại bài thi này. Vui lòng liên hệ quản trị viên để thiết lập mẫu đề thi."
        );
      } else if (err?.response?.status === 401) {
        Alert.alert(
          "Phiên đăng nhập đã hết hạn",
          "Vui lòng đăng nhập lại để tiếp tục làm bài thi."
        );
      } else if (err?.response?.status === 403) {
        Alert.alert(
          "Không có quyền truy cập",
          "Bạn không có quyền truy cập vào bài thi này."
        );
      } else if (err?.response?.status === 404) {
        Alert.alert(
          "Không tìm thấy bài thi",
          "Bài thi không tồn tại hoặc đã bị xóa."
        );
      } else if (err?.response?.status === 405) {
        Alert.alert(
          "Phương thức không được hỗ trợ",
          "Endpoint tạo bài thi tự động không khả dụng. Vui lòng liên hệ quản trị viên."
        );
      } else if (err?.response?.status === 500) {
        Alert.alert(
          "Lỗi hệ thống",
          "Có lỗi xảy ra trong hệ thống. Vui lòng thử lại sau."
        );
      } else {
        Alert.alert(
          "Lỗi khởi tạo bài thi",
          `Không thể bắt đầu bài thi. Lỗi: ${
            err?.message || "Không xác định"
          }. Vui lòng thử lại.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Timer effect for part time
  useEffect(() => {
    if (partTimeLeft > 0 && !isPartTimeUp) {
      const timer = setTimeout(() => {
        setPartTimeLeft(partTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (partTimeLeft === 0 && !isPartTimeUp) {
      setIsPartTimeUp(true);
      if (currentPartIndex < testParts.length - 1) {
        moveToNextPart();
      }
    }
  }, [partTimeLeft, isPartTimeUp, currentPartIndex, testParts.length]);

  // Timer effect for total time
  useEffect(() => {
    if (totalTimeLeft > 0) {
      const timer = setTimeout(() => {
        setTotalTimeLeft(totalTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (totalTimeLeft === 0) {
      handleAutoSubmit();
    }
  }, [totalTimeLeft]);

  // Move to next part
  const moveToNextPart = useCallback(() => {
    if (currentPartIndex < testParts.length - 1) {
      const nextPartIndex = currentPartIndex + 1;
      const nextPart = testParts[nextPartIndex];

      setCurrentPartIndex(nextPartIndex);
      setCurrentQuestionIndex(0);
      setPartTimeLeft(nextPart.durationMinutes * 60);
      setIsPartTimeUp(false);

      if (nextPart.questions[0]) {
        loadQuestion(nextPart.questions[0].questionId);
      }
    }
  }, [currentPartIndex, testParts]);

  // Navigate to question
  const navigateToQuestion = async (
    partIndex: number,
    questionIndex: number
  ) => {
    if (partIndex < currentPartIndex) {
      Alert.alert(
        "Không thể quay lại",
        "Bạn không thể quay lại phần đã hoàn thành."
      );
      return;
    }

    const question = testParts[partIndex]?.questions[questionIndex];
    if (question) {
      setCurrentPartIndex(partIndex);
      setCurrentQuestionIndex(questionIndex);
      if (partIndex !== currentPartIndex) {
        const nextPart = testParts[partIndex];
        setPartTimeLeft(nextPart.durationMinutes * 60);
        setIsPartTimeUp(false);
      }
      await loadQuestion(question.questionId);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = async (choiceId: string) => {
    if (!currentQuestion || !testAttempt) return;

    const questionId = currentQuestion.id;
    const newAnswers = new Map(userAnswers);
    newAnswers.set(questionId, choiceId);
    setUserAnswers(newAnswers);

    try {
      await addOrUpdateAttemptAnswer({
        attemptId: testAttempt.attemptId,
        questionId: questionId,
        choiceId: choiceId,
      });
    } catch (err) {
      console.error("Failed to save answer:", err);
    }
  };

  // Handle test submission
  const handleSubmitTest = async () => {
    if (!testAttempt) return;

    setSubmitting(true);
    try {
      await submitTestAttempt({ attemptId: testAttempt.attemptId });

      const result = await getTestAttemptWithScoreSummary(
        testAttempt.attemptId
      );
      setTestResult(result);

      setShowResult(true);

      Alert.alert(
        "Nộp bài thành công",
        "Bài thi của bạn đã được nộp và chấm điểm"
      );
    } catch (err) {
      console.error("Failed to submit test:", err);
      Alert.alert("Lỗi nộp bài", "Không thể nộp bài thi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto submit when time is up
  const handleAutoSubmit = useCallback(async () => {
    if (testAttempt && !submitting) {
      try {
        await submitTestAttempt({ attemptId: testAttempt.attemptId });

        const result = await getTestAttemptWithScoreSummary(
          testAttempt.attemptId
        );
        setTestResult(result);

        setShowResult(true);

        Alert.alert("Hết thời gian", "Bài thi đã được tự động nộp");
      } catch (err) {
        console.error("Failed to auto submit test:", err);
        Alert.alert("Lỗi tự động nộp bài", "Không thể tự động nộp bài thi");
      }
    }
  }, [testAttempt, submitting]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize on mount
  useEffect(() => {
    initializeTest();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang khởi tạo bài thi...</Text>
      </View>
    );
  }

  // Show test result if available
  if (showResult && testResult) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Kết quả bài thi</Text>
          <Text style={styles.resultSubtitle}>{test?.title}</Text>

          <View
            style={[
              styles.resultStatus,
              testResult.attempt.isPass ? styles.passStatus : styles.failStatus,
            ]}
          >
            <Text
              style={[
                styles.resultStatusText,
                testResult.attempt.isPass ? styles.passText : styles.failText,
              ]}
            >
              {testResult.attempt.isPass ? "ĐẠT" : "KHÔNG ĐẠT"}
            </Text>
            <Text style={styles.resultScore}>
              Tổng điểm: {testResult.scoreSummary.total_score}/
              {testResult.scoreSummary.total_max_score}(
              {testResult.scoreSummary.total_max_score > 0
                ? Math.round(
                    (testResult.scoreSummary.total_score /
                      testResult.scoreSummary.total_max_score) *
                      100
                  )
                : 0}
              %)
            </Text>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Quay lại trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setShowResult(false);
                setTestResult(null);
                initializeTest();
              }}
            >
              <Text style={styles.retryButtonText}>Làm bài thi khác</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!test || !testAttempt || !currentQuestion) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-triangle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Không thể tải bài thi</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentPart = testParts[currentPartIndex];
  const currentTestQuestion = currentPart?.questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      {/* Header with timer */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.testTitle}>{test.title}</Text>
            <Text style={styles.testSubtitle}>
              Part {currentPart?.partNumber} - Câu{" "}
              {currentTestQuestion?.questionNumber}
            </Text>
          </View>

          <View style={styles.timerContainer}>
            {/* Part Timer */}
            <View style={styles.timerItem}>
              <Text style={styles.timerLabel}>
                Part {currentPart?.partNumber}
              </Text>
              <Text
                style={[
                  styles.timerValue,
                  partTimeLeft < 300 && styles.timerWarning,
                ]}
              >
                {formatTime(partTimeLeft)}
              </Text>
            </View>

            {/* Total Timer */}
            <View style={styles.timerItem}>
              <Text style={styles.timerLabel}>Tổng</Text>
              <Text
                style={[
                  styles.timerValue,
                  totalTimeLeft < 600 && styles.timerWarning,
                ]}
              >
                {formatTime(totalTimeLeft)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Question Content */}
        <View style={styles.questionContainer}>
          <View style={styles.questionHeader}>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>
                Câu {currentTestQuestion?.questionNumber}
              </Text>
            </View>
            <Text style={styles.questionPoints}>
              {currentQuestion?.points || 0} điểm
            </Text>
          </View>

          <ScrollView style={styles.questionContent}>
            <Text style={styles.questionText}>{currentQuestion?.content}</Text>

            {/* Question attachments - Audio support */}
            {currentQuestion?.questionAttachments &&
              currentQuestion.questionAttachments.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  {currentQuestion.questionAttachments.map(
                    (attachment, index) => (
                      <View key={index} style={styles.attachmentItem}>
                        {attachment.mediaType.startsWith("image/") ? (
                          <Image
                            source={{ uri: attachment.mediaUrl }}
                            style={styles.attachmentImage}
                            resizeMode="contain"
                          />
                        ) : attachment.mediaType.startsWith("audio/") ? (
                          <View style={styles.audioContainer}>
                            <TouchableOpacity
                              style={styles.audioButton}
                              onPress={() =>
                                handlePlayAudio(attachment.mediaUrl)
                              }
                            >
                              <Icon
                                name={
                                  playingAudio === attachment.mediaUrl
                                    ? "pause"
                                    : "play"
                                }
                                size={20}
                                color="#FFFFFF"
                              />
                            </TouchableOpacity>
                            <Text style={styles.audioText}>Audio câu hỏi</Text>
                          </View>
                        ) : (
                          <TouchableOpacity style={styles.documentButton}>
                            <FontAwesome
                              name="file-text-o"
                              size={20}
                              color="#3B82F6"
                            />
                            <Text style={styles.documentText}>
                              Tài liệu đính kèm
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )
                  )}
                </View>
              )}
          </ScrollView>
        </View>

        {/* Answer Choices */}
        <View style={styles.answersContainer}>
          <Text style={styles.answersTitle}>Chọn đáp án:</Text>
          <ScrollView style={styles.answersList}>
            {currentQuestion?.choices?.map((choice, index) => {
              const isSelected =
                userAnswers.get(currentQuestion.id) === choice.id;
              const letter = String.fromCharCode(65 + index); // A, B, C, D

              return (
                <TouchableOpacity
                  key={choice.id}
                  style={[
                    styles.choiceButton,
                    isSelected && styles.selectedChoice,
                  ]}
                  onPress={() => handleAnswerSelect(choice.id)}
                >
                  <View style={styles.choiceContent}>
                    <View
                      style={[
                        styles.choiceLetter,
                        isSelected && styles.selectedChoiceLetter,
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceLetterText,
                          isSelected && styles.selectedChoiceLetterText,
                        ]}
                      >
                        {letter}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.choiceText,
                        isSelected && styles.selectedChoiceText,
                      ]}
                    >
                      {choice.content}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentPartIndex === 0 &&
                currentQuestionIndex === 0 &&
                styles.disabledButton,
            ]}
            onPress={() => {
              if (currentQuestionIndex > 0) {
                navigateToQuestion(currentPartIndex, currentQuestionIndex - 1);
              } else if (currentPartIndex > 0) {
                const prevPart = testParts[currentPartIndex - 1];
                navigateToQuestion(
                  currentPartIndex - 1,
                  prevPart.questions.length - 1
                );
              }
            }}
            disabled={currentPartIndex === 0 && currentQuestionIndex === 0}
          >
            <Icon name="chevron-left" size={20} color="#6B7280" />
            <Text style={styles.navButtonText}>Câu trước</Text>
          </TouchableOpacity>

          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {userAnswers.size} / {testQuestions.length} câu đã trả lời
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentPartIndex === testParts.length - 1 &&
                currentQuestionIndex === currentPart.questions.length - 1 &&
                styles.disabledButton,
            ]}
            onPress={() => {
              const currentPartQuestions = currentPart.questions;
              if (currentQuestionIndex < currentPartQuestions.length - 1) {
                navigateToQuestion(currentPartIndex, currentQuestionIndex + 1);
              } else if (currentPartIndex < testParts.length - 1) {
                navigateToQuestion(currentPartIndex + 1, 0);
              }
            }}
            disabled={
              currentPartIndex === testParts.length - 1 &&
              currentQuestionIndex === currentPart.questions.length - 1
            }
          >
            <Text style={styles.navButtonText}>Câu sau</Text>
            <Icon name="chevron-right" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Question Navigation Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Danh sách câu hỏi</Text>

          {testParts.map((part, partIndex) => (
            <View key={part.partNumber} style={styles.partContainer}>
              <Text
                style={[
                  styles.partTitle,
                  partIndex === currentPartIndex
                    ? styles.currentPart
                    : partIndex < currentPartIndex
                    ? styles.completedPart
                    : styles.futurePart,
                ]}
              >
                Part {part.partNumber} ({part.durationMinutes} phút)
              </Text>

              <View style={styles.questionsGrid}>
                {part.questions.map((question, questionIndex) => {
                  const isAnswered = userAnswers.has(question.questionId);
                  const isCurrent =
                    partIndex === currentPartIndex &&
                    questionIndex === currentQuestionIndex;
                  const canAccess = partIndex >= currentPartIndex;

                  return (
                    <TouchableOpacity
                      key={`${part.partNumber}_${question.questionNumber}_${questionIndex}`}
                      style={[
                        styles.questionButton,
                        isCurrent && styles.currentQuestion,
                        isAnswered && styles.answeredQuestion,
                        !canAccess && styles.lockedQuestion,
                      ]}
                      onPress={() =>
                        navigateToQuestion(partIndex, questionIndex)
                      }
                      disabled={!canAccess}
                    >
                      <Text
                        style={[
                          styles.questionButtonText,
                          isCurrent && styles.currentQuestionText,
                          isAnswered && styles.answeredQuestionText,
                          !canAccess && styles.lockedQuestionText,
                        ]}
                      >
                        {question.questionNumber}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitTest}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Nộp bài</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorButton: {
    marginTop: 16,
    backgroundColor: "#6B7280",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  testSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  timerContainer: {
    alignItems: "flex-end",
  },
  timerItem: {
    alignItems: "center",
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  timerValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  timerWarning: {
    color: "#EF4444",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  questionBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  questionBadgeText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "500",
  },
  questionPoints: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 14,
  },
  questionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 24,
    marginBottom: 16,
  },
  attachmentsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  attachmentItem: {
    width: "48%", // Adjust as needed for 2 columns
    aspectRatio: 1.2, // Adjust as needed for aspect ratio
    borderRadius: 8,
    overflow: "hidden",
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  audioButton: {
    padding: 8,
  },
  audioText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  documentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  documentText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  answersContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  answersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  answersList: {
    // No specific styles for ScrollView, content handles its own scrolling
  },
  choiceButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  selectedChoice: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  choiceContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  choiceLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 14,
    fontWeight: "500",
    marginRight: 12,
  },
  selectedChoiceLetter: {
    backgroundColor: "#3B82F6",
  },
  choiceLetterText: {
    color: "#6B7280",
  },
  selectedChoiceLetterText: {
    color: "#FFFFFF",
  },
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    lineHeight: 22,
  },
  selectedChoiceText: {
    color: "#111827",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "500",
  },
  progressInfo: {
    // No specific styles for View, content handles its own layout
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
  },
  sidebar: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 1,
    borderLeftColor: "#E5E7EB",
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  partContainer: {
    marginBottom: 20,
  },
  partTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  currentPart: {
    color: "#3B82F6",
  },
  completedPart: {
    color: "#10B981",
  },
  futurePart: {
    color: "#6B7280",
  },
  questionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  questionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  currentQuestion: {
    backgroundColor: "#3B82F6",
  },
  answeredQuestion: {
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  lockedQuestion: {
    backgroundColor: "#F9FAFB",
  },
  questionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  currentQuestionText: {
    color: "#FFFFFF",
  },
  answeredQuestionText: {
    color: "#10B981",
  },
  lockedQuestionText: {
    color: "#D1D5DB",
  },
  submitButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  resultStatus: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  passStatus: {
    backgroundColor: "#D1FAE5",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  failStatus: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  resultStatusText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  passText: {
    color: "#10B981",
  },
  failText: {
    color: "#EF4444",
  },
  resultScore: {
    fontSize: 16,
    color: "#6B7280",
  },
  resultActions: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  retryButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default TestDetailScreen;
