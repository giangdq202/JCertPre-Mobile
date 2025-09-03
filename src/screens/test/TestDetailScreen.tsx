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

const { width: screenWidth } = Dimensions.get("window");

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

  // Mock question data for fallback mode
  const mockQuestionData = useRef<Map<string, QuestionWithChoices>>(new Map());

  // Create mock questions for fallback mode
  const createMockQuestions = (
    testId: string,
    courseLevel: CourseLevel
  ): TestQuestionDto[] => {
    const mockQuestions: TestQuestionDto[] = [];
    const levelName = CourseLevel[courseLevel];

    // Create 5 mock questions for demonstration
    for (let i = 1; i <= 5; i++) {
      const questionId = `mock_${testId}_q${i}`;

      // Create TestQuestionDto
      mockQuestions.push({
        testQuestionId: `mock_test_question_${testId}_${i}`,
        testId: testId,
        questionId: questionId,
        questionNumber: i,
        partNumber: 1,
        partDurationMinutes: 30,
      });

      // Create mock question data
      const mockQuestion: QuestionWithChoices = {
        id: questionId,
        content: `Câu hỏi mẫu ${i} - JLPT ${levelName}\n\nĐây là câu hỏi mẫu để demo chức năng làm bài thi. Hãy chọn đáp án đúng nhất.`,
        points: 1,
        choices: [
          {
            id: `mock_${testId}_q${i}_a`,
            content: "Đáp án A - Lựa chọn đầu tiên",
            isCorrect: i === 1, // First question has A as correct
          },
          {
            id: `mock_${testId}_q${i}_b`,
            content: "Đáp án B - Lựa chọn thứ hai",
            isCorrect: i === 2, // Second question has B as correct
          },
          {
            id: `mock_${testId}_q${i}_c`,
            content: "Đáp án C - Lựa chọn thứ ba",
            isCorrect: i === 3, // Third question has C as correct
          },
          {
            id: `mock_${testId}_q${i}_d`,
            content: "Đáp án D - Lựa chọn cuối cùng",
            isCorrect: i === 4 || i === 5, // Fourth and fifth questions have D as correct
          },
        ],
        questionAttachments: [],
      };

      // Store mock question data
      mockQuestionData.current.set(questionId, mockQuestion);
    }

    return mockQuestions;
  };

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
      // COMMENTED OUT DEMO/FALLBACK LOGIC - FORCE REAL API CALLS
      // Check if this is a mock question
      /*
      if (questionId.startsWith("mock_")) {
        // Find the mock question data
        const mockQuestion = mockQuestionData.current.get(questionId);
        if (mockQuestion) {
          setCurrentQuestion(mockQuestion);
          return;
        }
      }
      */

      // Load real question from API
      console.log("Loading question details for questionId:", questionId);
      const questionDetail = await getQuestionById(questionId);
      console.log("Question detail fetched:", questionDetail);

      const convertedQuestion: QuestionWithChoices = {
        ...questionDetail,
        choices: questionDetail.choices?.map((choice) => ({
          id: choice.choiceId,
          content: choice.content,
          isCorrect: choice.isCorrect,
        })),
      };
      console.log("Converted question:", convertedQuestion);
      setCurrentQuestion(convertedQuestion);
    } catch (err) {
      console.error("Failed to load question:", err);
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

      // COMMENTED OUT DEMO/FALLBACK LOGIC - FORCE REAL API CALLS
      // Check if this is a fallback test option (no templates)
      /*
      if (!testOption.templates || testOption.templates.length === 0) {
        console.log(
          "Fallback test option detected, creating basic test structure"
        );
        createdTestResult = {
          testId: `fallback_${testOption.testType}_${
            testOption.courseLevel
          }_${Date.now()}`,
          title: testOption.title,
          description: `Bài thi ${testOption.title} cơ bản (chế độ fallback)`,
        };
      } else {
      */
      // Try auto-create first (like web version)
      try {
        console.log("Trying auto-create first (like web version)...");
        createdTestResult = await createAutoTest(autoTestInput, userInfo.id);
        console.log("Auto-create succeeded:", createdTestResult);
      } catch (createError: any) {
        console.log("Auto-create failed:", createError);

        // Check if it's a 403 error (permission denied)
        if (createError?.response?.status === 403) {
          console.log(
            "403 Forbidden - User may not have permission to create auto test"
          );
          throw new Error(
            "Bạn không có quyền tạo bài thi tự động. Vui lòng liên hệ quản trị viên để được cấp quyền."
          );
        }

        // If auto-create fails, try template-based approach as fallback
        if (testOption.templates && testOption.templates.length > 0) {
          const firstTemplate = testOption.templates[0];
          console.log(
            "Trying template-based approach as fallback:",
            firstTemplate
          );

          try {
            createdTestResult = await createTestFromTemplate(
              firstTemplate.templateId,
              userInfo.id,
              testOption.testType,
              testOption.courseLevel
            );
            console.log(
              "Template-based test created successfully:",
              createdTestResult
            );
          } catch (templateError: any) {
            console.log("Template approach also failed:", templateError);
            throw templateError;
          }
        } else {
          // If no templates and auto-create fails, throw error
          console.log("No templates available and auto-create failed");
          throw new Error(
            "Không có mẫu đề thi cho loại bài thi này. Vui lòng liên hệ quản trị viên để thiết lập mẫu đề thi."
          );
        }
      }
      // }

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
      let attempt: TestAttemptDto;

      // COMMENTED OUT DEMO/FALLBACK LOGIC - FORCE REAL API CALLS
      // Check if this is a fallback test - skip API call
      /*
      if (createdTest.testId.startsWith("fallback_")) {
        console.log("Fallback test detected, creating mock test attempt");
        attempt = {
          attemptId: `mock_attempt_${createdTest.testId}_${Date.now()}`,
          testId: createdTest.testId,
          userId: userInfo.id,
          attemptNumber: 1,
          startTime: new Date().toISOString(),
          endTime: "",
          isPass: false,
          status: 0, // In progress
        };
        setTestAttempt(attempt);
      } else {
      */
      try {
        attempt = await startTestAttempt({
          testId: createdTest.testId,
          userId: userInfo.id,
        });
        setTestAttempt(attempt);
      } catch (attemptError: any) {
        console.log("Failed to start test attempt:", attemptError);
        throw attemptError;
      }
      // }

      // Step 3: Get all test questions
      let questions: TestQuestionDto[] = [];

      // COMMENTED OUT DEMO/FALLBACK LOGIC - FORCE REAL API CALLS
      // Check if this is a fallback test - skip API call
      /*
      if (createdTest.testId.startsWith("fallback_")) {
        console.log("Fallback test detected, creating mock questions");
        questions = createMockQuestions(
          createdTest.testId,
          testOption.courseLevel
        );
        setTestQuestions(questions);
      } else {
      */
      try {
        console.log(
          "Fetching real questions from API for testId:",
          createdTest.testId
        );
        questions = await getQuestionsByTestId(createdTest.testId);
        console.log("Questions fetched from API:", questions);
        setTestQuestions(questions);
      } catch (questionError: any) {
        console.log("Failed to get test questions:", questionError);
        throw questionError;
      }
      // }

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
        console.log(
          "Loading first question:",
          parts[0].questions[0].questionId
        );
        await loadQuestion(parts[0].questions[0].questionId);
      } else {
        console.log("No questions found in parts:", parts);
      }

      console.log("Test initialization completed successfully");
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
      } else if (err?.message) {
        // Handle custom error messages
        Alert.alert("Lỗi khởi tạo bài thi", err.message);
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
      // COMMENTED OUT DEMO/FALLBACK LOGIC - FORCE REAL API CALLS
      // Skip API call for mock attempts
      /*
      if (testAttempt.attemptId.startsWith("mock_attempt_")) {
        console.log("Mock attempt - skipping answer submission to API");
        return;
      }
      */

      console.log("Saving answer to API:", {
        attemptId: testAttempt.attemptId,
        questionId: questionId,
        choiceId: choiceId,
      });

      await addOrUpdateAttemptAnswer({
        attemptId: testAttempt.attemptId,
        questionId: questionId,
        choiceId: choiceId,
      });

      console.log("Answer saved successfully");
    } catch (err) {
      console.error("Failed to save answer:", err);
      Alert.alert("Lỗi", "Không thể lưu câu trả lời");
    }
  };

  // Handle test submission
  const handleSubmitTest = async () => {
    if (!testAttempt) return;

    setSubmitting(true);
    try {
      // COMMENTED OUT DEMO/FALLBACK LOGIC - FORCE REAL API CALLS
      // Handle mock attempt submission
      /*
      if (testAttempt.attemptId.startsWith("mock_attempt_")) {
        console.log("Submitting mock test attempt");

        // Calculate mock score
        let correctAnswers = 0;
        let totalQuestions = testQuestions.length;

        userAnswers.forEach((choiceId, questionId) => {
          const mockQuestion = mockQuestionData.current.get(questionId);
          if (mockQuestion) {
            const correctChoice = mockQuestion.choices?.find(
              (c) => c.isCorrect
            );
            if (correctChoice && correctChoice.id === choiceId) {
              correctAnswers++;
            }
          }
        });

        const mockResult: TestAttemptWithScoreSummary = {
          attempt: {
            ...testAttempt,
            endTime: new Date().toISOString(),
            isPass: correctAnswers >= Math.ceil(totalQuestions * 0.6), // 60% to pass
            status: 1, // Completed
          },
          scoreSummary: {
            testScoreSummaryId: `mock_score_${testAttempt.attemptId}`,
            testId: testAttempt.testId,
            testAttemptId: testAttempt.attemptId,
            kanji_score: Math.floor(correctAnswers * 0.2),
            vocab_score: Math.floor(correctAnswers * 0.2),
            grammar_score: Math.floor(correctAnswers * 0.2),
            reading_score: Math.floor(correctAnswers * 0.2),
            listening_score: Math.floor(correctAnswers * 0.2),
            kanji_max_score: Math.floor(totalQuestions * 0.2),
            vocab_max_score: Math.floor(totalQuestions * 0.2),
            grammar_max_score: Math.floor(totalQuestions * 0.2),
            reading_max_score: Math.floor(totalQuestions * 0.2),
            listening_max_score: Math.floor(totalQuestions * 0.2),
            total_score: correctAnswers,
            total_max_score: totalQuestions,
            percentage_score: Math.round(
              (correctAnswers / totalQuestions) * 100
            ),
            passing_percentage: 60,
          },
        };

        setTestResult(mockResult);
        setShowResult(true);

        Alert.alert(
          "Nộp bài thành công",
          "Bài thi mẫu đã được hoàn thành. Đây là chế độ demo."
        );
        return;
      }
      */

      // Handle real test submission
      console.log("Submitting real test attempt:", testAttempt.attemptId);
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
        // COMMENTED OUT DEMO/FALLBACK LOGIC - FORCE REAL API CALLS
        // Handle mock attempt auto submission
        /*
        if (testAttempt.attemptId.startsWith("mock_attempt_")) {
          console.log("Auto submitting mock test attempt");

          // Calculate mock score
          let correctAnswers = 0;
          let totalQuestions = testQuestions.length;

          userAnswers.forEach((choiceId, questionId) => {
            const mockQuestion = mockQuestionData.current.get(questionId);
            if (mockQuestion) {
              const correctChoice = mockQuestion.choices?.find(
                (c) => c.isCorrect
              );
              if (correctChoice && correctChoice.id === choiceId) {
                correctAnswers++;
              }
            }
          });

          const mockResult: TestAttemptWithScoreSummary = {
            attempt: {
              ...testAttempt,
              endTime: new Date().toISOString(),
              isPass: correctAnswers >= Math.ceil(totalQuestions * 0.6), // 60% to pass
              status: 1, // Completed
            },
            scoreSummary: {
              testScoreSummaryId: `mock_score_${testAttempt.attemptId}`,
              testId: testAttempt.testId,
              testAttemptId: testAttempt.attemptId,
              kanji_score: Math.floor(correctAnswers * 0.2),
              vocab_score: Math.floor(correctAnswers * 0.2),
              grammar_score: Math.floor(correctAnswers * 0.2),
              reading_score: Math.floor(correctAnswers * 0.2),
              listening_score: Math.floor(correctAnswers * 0.2),
              kanji_max_score: Math.floor(totalQuestions * 0.2),
              vocab_max_score: Math.floor(totalQuestions * 0.2),
              grammar_max_score: Math.floor(totalQuestions * 0.2),
              reading_max_score: Math.floor(totalQuestions * 0.2),
              listening_max_score: Math.floor(totalQuestions * 0.2),
              total_score: correctAnswers,
              total_max_score: totalQuestions,
              percentage_score: Math.round(
                (correctAnswers / totalQuestions) * 100
              ),
              passing_percentage: 60,
            },
          };

          setTestResult(mockResult);
          setShowResult(true);

          Alert.alert(
            "Hết thời gian",
            "Bài thi mẫu đã được tự động nộp. Đây là chế độ demo."
          );
          return;
        }
        */

        // Handle real test auto submission
        console.log(
          "Auto submitting real test attempt:",
          testAttempt.attemptId
        );
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
  }, [testAttempt, submitting, userAnswers, testQuestions]);

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
    const percentage =
      testResult.scoreSummary.total_max_score > 0
        ? Math.round(
            (testResult.scoreSummary.total_score /
              testResult.scoreSummary.total_max_score) *
              100
          )
        : 0;

    return (
      <View style={styles.container}>
        <View style={styles.resultHeader}>
          <TouchableOpacity
            style={styles.resultBackButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.resultHeaderTitle}>Kết quả bài thi</Text>
        </View>

        <ScrollView
          style={styles.resultContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Test Info Card */}
          <View style={styles.testInfoCard}>
            <View style={styles.testInfoHeader}>
              <Icon name="award" size={24} color="#3B82F6" />
              <Text style={styles.testInfoTitle}>{test?.title}</Text>
            </View>
            <Text style={styles.testInfoSubtitle}>
              Hoàn thành lúc{" "}
              {new Date(
                testResult.attempt.endTime || Date.now()
              ).toLocaleString("vi-VN")}
            </Text>
          </View>

          {/* Result Status Card */}
          <View
            style={[
              styles.resultStatusCard,
              testResult.attempt.isPass
                ? styles.passStatusCard
                : styles.failStatusCard,
            ]}
          >
            <View style={styles.resultIconContainer}>
              <Icon
                name={testResult.attempt.isPass ? "check-circle" : "x-circle"}
                size={48}
                color={testResult.attempt.isPass ? "#10B981" : "#EF4444"}
              />
            </View>

            <Text
              style={[
                styles.resultStatusText,
                testResult.attempt.isPass ? styles.passText : styles.failText,
              ]}
            >
              {testResult.attempt.isPass ? "ĐẠT" : "KHÔNG ĐẠT"}
            </Text>

            <Text style={styles.resultStatusSubtext}>
              {testResult.attempt.isPass
                ? "Chúc mừng! Bạn đã vượt qua bài thi"
                : "Hãy cố gắng hơn nữa trong lần tiếp theo"}
            </Text>
          </View>

          {/* Score Details Card */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreCardTitle}>Chi tiết điểm số</Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Điểm đạt được</Text>
                <Text style={styles.scoreValue}>
                  {testResult.scoreSummary.total_score}
                </Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Tổng điểm</Text>
                <Text style={styles.scoreValue}>
                  {testResult.scoreSummary.total_max_score}
                </Text>
              </View>
            </View>

            <View style={styles.percentageContainer}>
              <View style={styles.percentageBar}>
                <View
                  style={[
                    styles.percentageFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: testResult.attempt.isPass
                        ? "#10B981"
                        : "#EF4444",
                    },
                  ]}
                />
              </View>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.resultActions}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="home" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Về trang chủ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => {
                setShowResult(false);
                setTestResult(null);
                initializeTest();
              }}
            >
              <Icon name="refresh-cw" size={20} color="#3B82F6" />
              <Text style={styles.secondaryActionText}>Làm bài khác</Text>
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
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.testTitle}>{test.title}</Text>
              <Text style={styles.testSubtitle}>
                Part {currentPart?.partNumber} • Câu{" "}
                {currentTestQuestion?.questionNumber}
              </Text>
            </View>
          </View>

          <View style={styles.timerSection}>
            <View style={styles.timerCard}>
              <View style={styles.timerHeader}>
                <Icon name="clock" size={16} color="#EF4444" />
                <Text style={styles.timerLabel}>Thời gian còn lại</Text>
              </View>
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

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(userAnswers.size / testQuestions.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {userAnswers.size}/{testQuestions.length} câu đã trả lời
          </Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Question List Section */}
        <View style={styles.questionListSection}>
          <View style={styles.questionListHeader}>
            <Icon name="list" size={20} color="#3B82F6" />
            <Text style={styles.questionListTitle}>Danh sách câu hỏi</Text>
          </View>

          <ScrollView
            style={styles.questionListContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {testParts.map((part, partIndex) => (
              <View key={part.partNumber} style={styles.partSection}>
                <View style={styles.partHeader}>
                  <Text
                    style={[
                      styles.partTitle,
                      partIndex === currentPartIndex
                        ? styles.currentPartTitle
                        : partIndex < currentPartIndex
                        ? styles.completedPartTitle
                        : styles.futurePartTitle,
                    ]}
                  >
                    Part {part.partNumber}
                  </Text>
                  <Text style={styles.partDuration}>
                    {part.durationMinutes} phút
                  </Text>
                </View>

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
          </ScrollView>
        </View>

        {/* Question Content Section */}
        <View style={styles.questionContentSection}>
          <ScrollView
            style={styles.questionScrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Question Card */}
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionBadge}>
                  <Text style={styles.questionBadgeText}>
                    Câu {currentTestQuestion?.questionNumber}
                  </Text>
                </View>
                <View style={styles.questionMeta}>
                  <View style={styles.pointsBadge}>
                    <Icon name="star" size={14} color="#F59E0B" />
                    <Text style={styles.pointsText}>
                      {currentQuestion?.points || 0} điểm
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.questionContent}>
                <Text style={styles.questionText}>
                  {currentQuestion?.content}
                </Text>

                {/* Question Attachments */}
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
                                <Text style={styles.audioText}>
                                  Audio câu hỏi
                                </Text>
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
              </View>
            </View>

            {/* Answer Choices */}
            <View style={styles.answersCard}>
              <Text style={styles.answersTitle}>Chọn đáp án:</Text>
              <View style={styles.choicesContainer}>
                {currentQuestion?.choices?.map((choice, index) => {
                  const isSelected =
                    userAnswers.get(currentQuestion.id) === choice.id;
                  const letter = String.fromCharCode(65 + index);

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
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <Icon name="check" size={16} color="#10B981" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Navigation Controls */}
          <View style={styles.navigationControls}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentPartIndex === 0 &&
                  currentQuestionIndex === 0 &&
                  styles.disabledButton,
              ]}
              onPress={() => {
                if (currentQuestionIndex > 0) {
                  navigateToQuestion(
                    currentPartIndex,
                    currentQuestionIndex - 1
                  );
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
                  navigateToQuestion(
                    currentPartIndex,
                    currentQuestionIndex + 1
                  );
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

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitTest}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Icon name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Nộp bài</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  errorButton: {
    marginTop: 16,
    backgroundColor: "#64748B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Header Styles
  header: {
    backgroundColor: "#1E293B",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  testSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  timerSection: {
    alignItems: "flex-end",
  },
  timerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 120,
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timerLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 4,
    fontWeight: "500",
  },
  timerValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  timerWarning: {
    color: "#F87171",
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "500",
  },

  // Main Content
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  questionListSection: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 16,
  },
  questionListHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  questionListTitle: {
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 8,
  },
  questionListContainer: {
    paddingHorizontal: 20,
  },
  partSection: {
    marginRight: 20,
    minWidth: 120,
  },
  questionContentSection: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Question Styles
  questionScrollView: {
    flex: 1,
    padding: screenWidth > 768 ? 24 : 20,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: screenWidth > 768 ? 28 : 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  questionBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  questionBadgeText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
  },
  questionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  questionContent: {
    // No specific styles needed
  },
  questionText: {
    fontSize: screenWidth > 768 ? 19 : 17,
    color: "#1E293B",
    lineHeight: screenWidth > 768 ? 30 : 26,
    fontWeight: "500",
  },
  attachmentsContainer: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  attachmentItem: {
    width: "48%",
    aspectRatio: 1.2,
    borderRadius: 12,
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
    borderRadius: 12,
    gap: 8,
  },
  audioButton: {
    padding: 8,
  },
  audioText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  documentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  documentText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },

  // Answer Styles
  answersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: screenWidth > 768 ? 28 : 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  answersTitle: {
    fontSize: screenWidth > 768 ? 19 : 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: screenWidth > 768 ? 18 : 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedChoice: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  choiceContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  choiceLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  selectedChoiceLetter: {
    backgroundColor: "#3B82F6",
  },
  choiceLetterText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
  },
  selectedChoiceLetterText: {
    color: "#FFFFFF",
  },
  choiceText: {
    flex: 1,
    fontSize: screenWidth > 768 ? 17 : 16,
    color: "#1E293B",
    lineHeight: screenWidth > 768 ? 26 : 24,
    fontWeight: "500",
  },
  selectedChoiceText: {
    color: "#1E293B",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },

  // Navigation Controls
  navigationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: screenWidth > 768 ? 24 : 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: screenWidth > 768 ? 20 : 16,
    paddingVertical: screenWidth > 768 ? 12 : 10,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: screenWidth > 768 ? 16 : 14,
    color: "#3B82F6",
    fontWeight: "600",
  },

  partHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  partTitle: {
    fontSize: screenWidth > 768 ? 15 : 13,
    fontWeight: "600",
  },
  currentPartTitle: {
    color: "#3B82F6",
  },
  completedPartTitle: {
    color: "#10B981",
  },
  futurePartTitle: {
    color: "#64748B",
  },
  partDuration: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  questionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  questionButton: {
    width: screenWidth > 768 ? 32 : 28,
    height: screenWidth > 768 ? 32 : 28,
    borderRadius: screenWidth > 768 ? 16 : 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },
  currentQuestion: {
    backgroundColor: "#3B82F6",
  },
  answeredQuestion: {
    backgroundColor: "#D1FAE5",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  lockedQuestion: {
    backgroundColor: "#F1F5F9",
  },
  questionButtonText: {
    fontSize: screenWidth > 768 ? 13 : 11,
    fontWeight: "600",
    color: "#64748B",
  },
  currentQuestionText: {
    color: "#FFFFFF",
  },
  answeredQuestionText: {
    color: "#10B981",
  },
  lockedQuestionText: {
    color: "#CBD5E1",
  },
  submitButton: {
    backgroundColor: "#EF4444",
    paddingVertical: screenWidth > 768 ? 14 : 12,
    paddingHorizontal: screenWidth > 768 ? 20 : 16,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 15 : 13,
    fontWeight: "700",
  },

  // Result Styles
  resultHeader: {
    backgroundColor: "#1E293B",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  resultBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  resultHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  testInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  testInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  testInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 12,
  },
  testInfoSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  resultStatusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  passStatusCard: {
    borderWidth: 2,
    borderColor: "#10B981",
  },
  failStatusCard: {
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  resultIconContainer: {
    marginBottom: 16,
  },
  resultStatusText: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  passText: {
    color: "#10B981",
  },
  failText: {
    color: "#EF4444",
  },
  resultStatusSubtext: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  scoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  scoreCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreItem: {
    flex: 1,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
  },
  scoreDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 20,
  },
  percentageContainer: {
    alignItems: "center",
  },
  percentageBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 12,
  },
  percentageFill: {
    height: "100%",
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  resultActions: {
    gap: 16,
  },
  primaryActionButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryActionButton: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  secondaryActionText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default TestDetailScreen;
