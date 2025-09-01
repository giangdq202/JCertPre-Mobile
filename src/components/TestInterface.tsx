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
} from "react-native";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";

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
      console.error(err);
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
        console.error(err);
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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
      <View className="flex-1 justify-center items-center p-4">
        <FontAwesome
          name="play"
          size={60}
          color="#3B82F6"
          style={{ marginBottom: 16 }}
        />
        <Text className="text-2xl font-bold mb-4">{test.title}</Text>
        <Text className="text-gray-600 mb-6">{test.description}</Text>
        <TouchableOpacity
          onPress={onBack}
          className="bg-gray-500 px-6 py-3 rounded-lg mb-2"
        >
          <Text className="text-white text-center">Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleStartTest}
          className="bg-blue-600 px-8 py-3 rounded-lg"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center">Bắt đầu làm bài</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (testStatus === "completed" && testResult) {
    return (
      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-6">
          <FontAwesome
            name="check-circle"
            size={60}
            color="#22C55E"
            style={{ marginBottom: 12 }}
          />
          <Text className="text-xl font-bold mb-2">Hoàn thành bài test!</Text>
          {testResult.scoreSummary && (
            <View className="w-full">
              <Text className="text-lg font-bold">
                Tổng điểm: {testResult.scoreSummary.total_score}/
                {testResult.scoreSummary.total_max_score}
              </Text>
              <Text>
                Kết quả: {testResult.attempt.isPass ? "ĐẠT" : "KHÔNG ĐẠT"}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onBack}
            className="bg-blue-600 px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-white text-center">Quay lại bài học</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (testStatus === "in_progress" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestion.questionDetails.id];

    return (
      <ScrollView className="flex-1 p-4">
        <View className="bg-blue-600 p-4 rounded-lg mb-4">
          <Text className="text-white font-bold text-lg">{test.title}</Text>
          <Text className="text-blue-100">
            Câu {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <Text className="text-blue-100">
            Thời gian còn lại: {formatTime(timeLeft)}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-gray-800 font-semibold mb-2">
            Câu {currentQuestion.testQuestion.questionNumber} -{" "}
            {currentQuestion.questionDetails.points} điểm
          </Text>
          <Text className="text-gray-700 mb-4">
            {currentQuestion.questionDetails.content}
          </Text>

          {currentQuestion.questionDetails.questionAttachments?.map(
            (att, idx) => {
              if (att.mediaType.startsWith("image/")) {
                return (
                  <Image
                    key={idx}
                    source={{ uri: att.mediaUrl }}
                    className="w-full h-48 rounded-lg mb-4"
                  />
                );
              } else if (att.mediaType.startsWith("audio/")) {
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handlePlayAudio(att.mediaUrl)}
                    className="bg-blue-100 px-4 py-2 rounded-lg flex-row items-center mb-4"
                  >
                    <FontAwesome
                      name={playingAudio === att.mediaUrl ? "pause" : "play"}
                      size={16}
                      color="#1E40AF"
                    />
                    <Text className="ml-2">
                      {playingAudio === att.mediaUrl
                        ? "Tạm dừng"
                        : "Phát audio"}
                    </Text>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    key={idx}
                    className="bg-gray-100 px-4 py-2 rounded-lg mb-4"
                  >
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
            className={`p-3 mb-2 rounded-lg border-2 ${
              currentAnswer?.choiceId === choice.choiceId
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <Text>{choice.content}</Text>
          </TouchableOpacity>
        ))}

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            onPress={() =>
              setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
            }
            className="bg-gray-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Câu trước</Text>
          </TouchableOpacity>
          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              onPress={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Câu tiếp</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowSubmitConfirm(true)}
              className="bg-green-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Nộp bài</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal visible={showSubmitConfirm} transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-6 rounded-lg w-11/12">
              <Text className="text-xl font-bold mb-4">Xác nhận nộp bài</Text>
              <Text className="mb-2">
                Bạn đã trả lời {getAnsweredQuestionsCount()}/{totalQuestions}{" "}
                câu hỏi.
              </Text>
              <Text className="mb-4">Bạn có chắc chắn muốn nộp bài?</Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setShowSubmitConfirm(false)}
                  className="bg-gray-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white">Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitTest}
                  className="bg-green-600 px-4 py-2 rounded-lg"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white">Nộp bài</Text>
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
    <View className="flex-1 justify-center items-center p-4">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-600 mt-2">Đang tải bài test...</Text>
    </View>
  );
};
