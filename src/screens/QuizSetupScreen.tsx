import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuiz } from '../contexts/QuizContext';
import { ContentName, CourseLevel, SubContentName } from '../types/quiz';

type RootStackParamList = {
  QuizSetup: undefined;
  Quiz: undefined;
  QuizResults: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const QuizSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { startQuiz, state, error } = useQuiz();

  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>(CourseLevel.N5);
  const [selectedContentName, setSelectedContentName] = useState<ContentName>(ContentName.Vocabulary);
  const [selectedSubContentName, setSelectedSubContentName] = useState<SubContentName>(SubContentName.Mondai1);

  const loading = state === 'loading';

  // Labels for display
  const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
    [CourseLevel.N5]: "N5",
    [CourseLevel.N4]: "N4", 
    [CourseLevel.N3]: "N3",
    [CourseLevel.N2]: "N2",
    [CourseLevel.N1]: "N1",
  };

  const CONTENT_NAME_LABELS: Record<ContentName, string> = {
    [ContentName.Kanji]: "Chữ Hán",
    [ContentName.Vocabulary]: "Từ Vựng",
    [ContentName.Grammar]: "Ngữ Pháp",
    [ContentName.Reading]: "Đọc Hiểu",
    [ContentName.Listening]: "Nghe Hiểu",
  };

  const SUBCONTENT_NAME_LABELS: Record<SubContentName, string> = {
    [SubContentName.Mondai1]: "Đọc chữ Hán",
    [SubContentName.Mondai2]: "Nhớ chữ Hán",
    [SubContentName.Mondai3]: "Chọn từ phù hợp với câu",
    [SubContentName.Mondai4]: "Tìm câu có cách diễn đạt giống",
    [SubContentName.Mondai5]: "Chọn ngữ pháp phù hợp với câu",
    [SubContentName.Mondai6]: "Sắp xếp câu",
    [SubContentName.Mondai7]: "Tìm đáp án đúng để hoàn thành đoạn văn",
    [SubContentName.Mondai8]: "Đoạn văn ngắn",
    [SubContentName.Mondai9]: "Trung văn",
    [SubContentName.Mondai10]: "Tìm kiếm thông tin",
    [SubContentName.Mondai11]: "Hiểu đề bài",
    [SubContentName.Mondai12]: "Hiểu điểm chính",
    [SubContentName.Mondai13]: "Suy luận thông tin",
    [SubContentName.Mondai14]: "Tổng hợp thông tin",
  };

  const getSubContentOptions = (contentName: ContentName): SubContentName[] => {
    switch (contentName) {
      case ContentName.Kanji:
        return [SubContentName.Mondai1, SubContentName.Mondai2];
      case ContentName.Vocabulary:
        return [SubContentName.Mondai3, SubContentName.Mondai4];
      case ContentName.Grammar:
        return [SubContentName.Mondai5, SubContentName.Mondai6, SubContentName.Mondai7];
      case ContentName.Reading:
        return [SubContentName.Mondai8, SubContentName.Mondai9, SubContentName.Mondai10];
      case ContentName.Listening:
        return [SubContentName.Mondai11, SubContentName.Mondai12, SubContentName.Mondai13, SubContentName.Mondai14];
      default:
        return [SubContentName.Mondai1];
    }
  };

  useEffect(() => {
    const availableSubContents = getSubContentOptions(selectedContentName);
    if (!availableSubContents.includes(selectedSubContentName)) {
      setSelectedSubContentName(availableSubContents[0]);
    }
  }, [selectedContentName, selectedSubContentName]);

  const handleStartQuiz = async () => {
    try {
      await startQuiz({
        numberOfQuestions,
        contentName: selectedContentName,
        level: selectedLevel,
        subContentName: selectedSubContentName,
      });

      // Navigate only if no error occurred
      if (!error) {
        navigation.navigate('Quiz');
      }
    } catch (err) {
      // Error will be handled by context
      console.error('Failed to start quiz:', err);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const questionOptions = [5, 10, 15, 20];
  const levelOptions = Object.entries(COURSE_LEVEL_LABELS);
  const contentOptions = Object.entries(CONTENT_NAME_LABELS);
  const subContentOptions = getSubContentOptions(selectedContentName).map(sc => 
    [sc.toString(), SUBCONTENT_NAME_LABELS[sc]]
  );

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Header */}
      <View className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleGoBack}
            className="flex-row items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-medium">← Quay lại</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">🎯 Cấu hình Quiz</Text>
          <View className="w-20" />
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="max-w-lg mx-auto">
          {/* Welcome Card */}
          <View className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
            <View className="text-center mb-6">
              <Text className="text-4xl mb-4">📚</Text>
              <Text className="text-2xl font-bold text-green-800 mb-2">Quiz Tiếng Nhật</Text>
              <Text className="text-green-600 text-lg">Chọn cấu hình và bắt đầu luyện tập</Text>
            </View>
          </View>

          {/* Configuration Cards */}
          <View className="space-y-6">
            {/* Number of Questions */}
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <View className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                <Text className="text-white font-bold text-lg">📊 Số câu hỏi</Text>
              </View>
              <View className="p-6">
                <View className="grid grid-cols-4 gap-3">
                  {questionOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => setNumberOfQuestions(option)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        numberOfQuestions === option
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text className={`text-center font-bold text-lg ${
                        numberOfQuestions === option ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Course Level */}
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <View className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                <Text className="text-white font-bold text-lg">🎓 Cấp độ</Text>
              </View>
              <View className="p-6">
                <View className="grid grid-cols-5 gap-3">
                  {levelOptions.map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setSelectedLevel(parseInt(value) as CourseLevel)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedLevel === parseInt(value)
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text className={`text-center font-bold text-lg ${
                        selectedLevel === parseInt(value) ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Content Name */}
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <View className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                <Text className="text-white font-bold text-lg">📖 Nội dung</Text>
              </View>
              <View className="p-6">
                <View className="space-y-3">
                  {contentOptions.map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setSelectedContentName(parseInt(value) as ContentName)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedContentName === parseInt(value)
                          ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text className={`text-center font-bold text-lg ${
                        selectedContentName === parseInt(value) ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* SubContent Name */}
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <View className="bg-gradient-to-r from-teal-500 to-teal-600 p-4">
                <Text className="text-white font-bold text-lg">🎯 Loại bài</Text>
              </View>
              <View className="p-6">
                <View className="space-y-3">
                  {subContentOptions.map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setSelectedSubContentName(parseInt(value) as SubContentName)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSubContentName === parseInt(value)
                          ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text className={`font-medium text-base ${
                        selectedSubContentName === parseInt(value) ? 'text-teal-600' : 'text-gray-600'
                      }`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Start Quiz Button */}
            <TouchableOpacity
              onPress={handleStartQuiz}
              disabled={loading}
              className={`py-6 rounded-2xl mb-8 shadow-xl transition-all ${
                loading 
                  ? 'bg-gray-400' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 transform hover:scale-105'
              }`}
            >
              <View className="flex-row items-center justify-center gap-3">
                {loading ? (
                  <>
                    <View className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <Text className="text-white text-xl font-bold">Đang tải...</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white text-2xl">🚀</Text>
                    <Text className="text-white text-xl font-bold">Bắt đầu Quiz</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuizSetupScreen;
