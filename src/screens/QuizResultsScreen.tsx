import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuiz } from '../contexts/QuizContext';

type RootStackParamList = {
  QuizSetup: undefined;
  Quiz: undefined;
  QuizResults: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const QuizResultsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { session, resetQuiz } = useQuiz();

  if (!session || !session.endTime) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-green-50 via-green-100 to-green-200">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <Text className="text-4xl mb-4 text-center">😕</Text>
            <Text className="text-green-700 font-medium text-lg text-center">Không có kết quả quiz nào.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const totalTime = session.endTime.getTime() - session.startTime.getTime();
  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  const accuracy = session.questions.length > 0
    ? Math.round((session.score / session.questions.length) * 100)
    : 0;
  const correctAnswers = session.score;
  const wrongAnswers = session.questions.length - session.score;

  const handleRetry = () => {
    resetQuiz();
    navigation.navigate('QuizSetup');
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
        color: "from-yellow-400 to-yellow-600",
        bgColor: "from-yellow-50 to-yellow-100"
      };
    } else if (accuracy >= 70) {
      return {
        emoji: "🎉",
        title: "Tốt lắm!",
        message: "Kết quả khá ấn tượng!",
        color: "from-green-400 to-green-600",
        bgColor: "from-green-50 to-green-100"
      };
    } else if (accuracy >= 50) {
      return {
        emoji: "👍",
        title: "Khá tốt!",
        message: "Bạn đang tiến bộ!",
        color: "from-blue-400 to-blue-600",
        bgColor: "from-blue-50 to-blue-100"
      };
    } else {
      return {
        emoji: "💪",
        title: "Cố gắng thêm!",
        message: "Lần sau sẽ tốt hơn!",
        color: "from-orange-400 to-orange-600",
        bgColor: "from-orange-50 to-orange-100"
      };
    }
  };

  const getAnswerStatus = (questionIndex: number) => {
    const answerChoiceId = session.answers[questionIndex];
    if (!answerChoiceId) return { isCorrect: false, status: 'Chưa trả lời' };

    const question = session.questions[questionIndex];
    const selectedChoice = question.choices.find(c => c.choiceId === answerChoiceId);
    return {
      isCorrect: selectedChoice?.isCorrect || false,
      status: selectedChoice?.isCorrect ? 'Đúng' : 'Sai',
      selectedChoice,
      correctChoice: question.choices.find(c => c.isCorrect)
    };
  };

  const performance = getPerformanceData();

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Header */}
      <View className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <View className="flex-row items-center justify-center">
          <Text className="text-white text-xl font-bold">🏁 Kết quả Quiz</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="max-w-4xl mx-auto space-y-6">
          {/* Performance Card */}
          <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
            <View className={`bg-gradient-to-r ${performance.color} p-8`}>
              <View className="text-center">
                <Text className="text-6xl mb-4">{performance.emoji}</Text>
                <Text className="text-white text-3xl font-bold mb-2">{performance.title}</Text>
                <Text className="text-white text-lg opacity-90">{performance.message}</Text>
              </View>
            </View>
            
            <View className={`bg-gradient-to-r ${performance.bgColor} p-8`}>
              <View className="text-center">
                <Text className="text-6xl font-bold text-gray-800 mb-2">
                  {accuracy}%
                </Text>
                <Text className="text-gray-600 text-lg">Độ chính xác</Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="grid grid-cols-2 gap-4">
            {/* Score Card */}
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <View className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                <Text className="text-white font-bold text-lg text-center">� Điểm số</Text>
              </View>
              <View className="p-6 text-center">
                <Text className="text-4xl font-bold text-green-600 mb-2">
                  {session.score}/{session.questions.length}
                </Text>
                <Text className="text-gray-600 font-medium">Tổng điểm</Text>
              </View>
            </View>

            {/* Time Card */}
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <View className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                <Text className="text-white font-bold text-lg text-center">⏱️ Thời gian</Text>
              </View>
              <View className="p-6 text-center">
                <Text className="text-4xl font-bold text-blue-600 mb-2">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </Text>
                <Text className="text-gray-600 font-medium">Tổng thời gian</Text>
              </View>
            </View>

            {/* Correct Answers Card */}
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <View className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                <Text className="text-white font-bold text-lg text-center">✅ Đúng</Text>
              </View>
              <View className="p-6 text-center">
                <Text className="text-4xl font-bold text-purple-600 mb-2">
                  {correctAnswers}
                </Text>
                <Text className="text-gray-600 font-medium">Câu đúng</Text>
              </View>
            </View>

            {/* Wrong Answers Card */}
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <View className="bg-gradient-to-r from-red-500 to-red-600 p-4">
                <Text className="text-white font-bold text-lg text-center">❌ Sai</Text>
              </View>
              <View className="p-6 text-center">
                <Text className="text-4xl font-bold text-red-600 mb-2">
                  {wrongAnswers}
                </Text>
                <Text className="text-gray-600 font-medium">Câu sai</Text>
              </View>
            </View>
          </View>

          {/* Question Breakdown */}
          <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
            <View className="bg-gradient-to-r from-gray-500 to-gray-600 p-6">
              <Text className="text-white text-xl font-bold text-center">📝 Chi tiết từng câu</Text>
            </View>
            <View className="p-6">
              <View className="space-y-4">
                {session.questions.map((question, index) => {
                  const answerStatus = getAnswerStatus(index);

                  return (
                    <View key={question.questionId} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                      <View className="p-6">
                        <View className="flex-row justify-between items-start mb-4">
                          <View className="flex-1 mr-4">
                            <Text className="text-lg font-bold text-gray-800 mb-2">
                              Câu {index + 1}
                            </Text>
                            <Text className="text-gray-700 leading-relaxed line-clamp-2">
                              {question.questionText}
                            </Text>
                          </View>
                          <View className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                            answerStatus.isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            <Text className="text-white text-xl font-bold">
                              {answerStatus.isCorrect ? '✓' : '✗'}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row justify-between items-center mb-4">
                          <Text className="text-gray-600 font-medium">
                            Kết quả: <Text className={`font-bold ${
                              answerStatus.isCorrect ? 'text-green-600' : 'text-red-600'
                            }`}>{answerStatus.status}</Text>
                          </Text>
                          <Text className="text-gray-600 font-medium">
                            Điểm: <Text className="font-bold text-blue-600">{answerStatus.isCorrect ? 1 : 0}/1</Text>
                          </Text>
                        </View>

                        {/* Show choices */}
                        <View className="space-y-2 mb-4">
                          {question.choices.map((choice, choiceIndex) => {
                            const isUserChoice = answerStatus.selectedChoice?.choiceId === choice.choiceId;
                            const isCorrectChoice = choice.isCorrect;
                            
                            let choiceStyle = "p-3 rounded-xl border";
                            if (isCorrectChoice) {
                              choiceStyle += " border-green-400 bg-green-50";
                            } else if (isUserChoice && !isCorrectChoice) {
                              choiceStyle += " border-red-400 bg-red-50";
                            } else {
                              choiceStyle += " border-gray-200 bg-white";
                            }

                            return (
                              <View key={choice.choiceId} className={choiceStyle}>
                                <View className="flex-row items-center gap-3">
                                  <Text className={`w-6 h-6 rounded-full text-center text-sm font-bold ${
                                    isCorrectChoice ? 'bg-green-500 text-white' :
                                    isUserChoice && !isCorrectChoice ? 'bg-red-500 text-white' :
                                    'bg-gray-200 text-gray-600'
                                  }`}>
                                    {isCorrectChoice ? '✓' : 
                                     isUserChoice && !isCorrectChoice ? '✗' :
                                     String.fromCharCode(65 + choiceIndex)}
                                  </Text>
                                  <Text className={`flex-1 ${
                                    isCorrectChoice ? 'text-green-700 font-medium' :
                                    isUserChoice && !isCorrectChoice ? 'text-red-700' :
                                    'text-gray-600'
                                  }`}>
                                    {choice.content}
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>

                        {/* Show explanation if available */}
                        {question.explanation && (
                          <View className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                            <View className="flex-row items-start gap-3">
                              <Text className="text-xl">💡</Text>
                              <View className="flex-1">
                                <Text className="text-blue-800 font-bold mb-2">Giải thích:</Text>
                                <Text className="text-blue-700 leading-relaxed">
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
          </View>

          {/* Action Buttons */}
          <View className="space-y-4 mb-8">
            <TouchableOpacity
              onPress={handleRetry}
              className="bg-gradient-to-r from-blue-500 to-blue-600 py-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all"
            >
              <View className="flex-row items-center justify-center gap-3">
                <Text className="text-white text-2xl">🔄</Text>
                <Text className="text-white text-xl font-bold">Xem lại câu hỏi</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBackToHome}
              className="bg-gradient-to-r from-green-500 to-green-600 py-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all"
            >
              <View className="flex-row items-center justify-center gap-3">
                <Text className="text-white text-2xl">🏠</Text>
                <Text className="text-white text-xl font-bold">Làm quiz mới</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuizResultsScreen;
