import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuiz } from "../contexts/QuizContext";
import { ContentName, CourseLevel, SubContentName } from "../types/quiz";

type RootStackParamList = {
  QuizSetup: undefined;
  Quiz: undefined;
  QuizResults: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const QuizSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { startQuiz, state, error } = useQuiz();

  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>(
    CourseLevel.N5
  );
  const [selectedContentName, setSelectedContentName] = useState<ContentName>(
    ContentName.Vocabulary
  );
  const [selectedSubContentName, setSelectedSubContentName] =
    useState<SubContentName>(SubContentName.Mondai1);

  const loading = state === "loading";

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
        return [
          SubContentName.Mondai5,
          SubContentName.Mondai6,
          SubContentName.Mondai7,
        ];
      case ContentName.Reading:
        return [
          SubContentName.Mondai8,
          SubContentName.Mondai9,
          SubContentName.Mondai10,
        ];
      case ContentName.Listening:
        return [
          SubContentName.Mondai11,
          SubContentName.Mondai12,
          SubContentName.Mondai13,
          SubContentName.Mondai14,
        ];
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
        navigation.navigate("Quiz");
      }
    } catch (err) {
      // Error will be handled by context
      console.error("Failed to start quiz:", err);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const questionOptions = [5, 10, 15, 20];
  const levelOptions = Object.entries(COURSE_LEVEL_LABELS);
  const contentOptions = Object.entries(CONTENT_NAME_LABELS);
  const subContentOptions = getSubContentOptions(selectedContentName).map(
    (sc) => [sc.toString(), SUBCONTENT_NAME_LABELS[sc]]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎯 Cấu hình Quiz</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeEmoji}>📚</Text>
            <Text style={styles.welcomeTitle}>Quiz Tiếng Nhật</Text>
            <Text style={styles.welcomeSubtitle}>
              Chọn cấu hình và bắt đầu luyện tập
            </Text>
          </View>

          {/* Configuration Cards */}
          <View style={styles.configSection}>
            {/* Number of Questions */}
            <View style={styles.configCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>📊 Số câu hỏi</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.optionsGrid}>
                  {questionOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => setNumberOfQuestions(option)}
                      style={[
                        styles.optionButton,
                        numberOfQuestions === option &&
                          styles.selectedOptionButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          numberOfQuestions === option &&
                            styles.selectedOptionButtonText,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Course Level */}
            <View style={styles.configCard}>
              <View style={[styles.cardHeader, styles.purpleHeader]}>
                <Text style={styles.cardHeaderText}>🎓 Cấp độ</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.levelGrid}>
                  {levelOptions.map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() =>
                        setSelectedLevel(parseInt(value) as CourseLevel)
                      }
                      style={[
                        styles.levelButton,
                        selectedLevel === parseInt(value) &&
                          styles.selectedLevelButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelButtonText,
                          selectedLevel === parseInt(value) &&
                            styles.selectedLevelButtonText,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Content Name */}
            <View style={styles.configCard}>
              <View style={[styles.cardHeader, styles.orangeHeader]}>
                <Text style={styles.cardHeaderText}>📖 Nội dung</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.contentOptions}>
                  {contentOptions.map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() =>
                        setSelectedContentName(parseInt(value) as ContentName)
                      }
                      style={[
                        styles.contentButton,
                        selectedContentName === parseInt(value) &&
                          styles.selectedContentButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.contentButtonText,
                          selectedContentName === parseInt(value) &&
                            styles.selectedContentButtonText,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* SubContent Name */}
            <View style={styles.configCard}>
              <View style={[styles.cardHeader, styles.tealHeader]}>
                <Text style={styles.cardHeaderText}>🎯 Loại bài</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.subContentOptions}>
                  {subContentOptions.map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() =>
                        setSelectedSubContentName(
                          parseInt(value) as SubContentName
                        )
                      }
                      style={[
                        styles.subContentButton,
                        selectedSubContentName === parseInt(value) &&
                          styles.selectedSubContentButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.subContentButtonText,
                          selectedSubContentName === parseInt(value) &&
                            styles.selectedSubContentButtonText,
                        ]}
                      >
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
              style={[
                styles.startButton,
                loading && styles.startButtonDisabled,
              ]}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.spinner} />
                  <Text style={styles.startButtonText}>Đang tải...</Text>
                </View>
              ) : (
                <View style={styles.startButtonContent}>
                  <Text style={styles.startButtonEmoji}>🚀</Text>
                  <Text style={styles.startButtonText}>Bắt đầu Quiz</Text>
                </View>
              )}
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
  header: {
    backgroundColor: "#059669",
    paddingHorizontal: screenWidth > 768 ? 24 : 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 20 : 18,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: screenWidth > 768 ? 24 : 20,
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: screenWidth > 768 ? 32 : 24,
    marginBottom: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  welcomeEmoji: {
    fontSize: screenWidth > 768 ? 48 : 40,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: screenWidth > 768 ? 24 : 20,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: screenWidth > 768 ? 16 : 14,
    color: "#059669",
    textAlign: "center",
  },
  configSection: {
    gap: 20,
  },
  configCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  cardHeader: {
    backgroundColor: "#3B82F6",
    padding: 16,
  },
  purpleHeader: {
    backgroundColor: "#8B5CF6",
  },
  orangeHeader: {
    backgroundColor: "#F97316",
  },
  tealHeader: {
    backgroundColor: "#14B8A6",
  },
  cardHeaderText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 18 : 16,
    fontWeight: "bold",
  },
  cardContent: {
    padding: screenWidth > 768 ? 24 : 20,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  optionButton: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOptionButton: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  optionButtonText: {
    fontSize: screenWidth > 768 ? 18 : 16,
    fontWeight: "bold",
    color: "#6B7280",
  },
  selectedOptionButtonText: {
    color: "#3B82F6",
  },
  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  levelButton: {
    flex: 1,
    minWidth: 50,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedLevelButton: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F3E8FF",
  },
  levelButtonText: {
    fontSize: screenWidth > 768 ? 16 : 14,
    fontWeight: "bold",
    color: "#6B7280",
  },
  selectedLevelButtonText: {
    color: "#8B5CF6",
  },
  contentOptions: {
    gap: 12,
  },
  contentButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  selectedContentButton: {
    borderColor: "#F97316",
    backgroundColor: "#FEF3C7",
  },
  contentButtonText: {
    fontSize: screenWidth > 768 ? 18 : 16,
    fontWeight: "bold",
    color: "#6B7280",
    textAlign: "center",
  },
  selectedContentButtonText: {
    color: "#F97316",
  },
  subContentOptions: {
    gap: 12,
  },
  subContentButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  selectedSubContentButton: {
    borderColor: "#14B8A6",
    backgroundColor: "#CCFBF1",
  },
  subContentButtonText: {
    fontSize: screenWidth > 768 ? 14 : 13,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  selectedSubContentButtonText: {
    color: "#14B8A6",
  },
  startButton: {
    backgroundColor: "#059669",
    paddingVertical: screenWidth > 768 ? 20 : 18,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  startButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  startButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  startButtonEmoji: {
    fontSize: screenWidth > 768 ? 24 : 20,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: screenWidth > 768 ? 20 : 18,
    fontWeight: "bold",
  },
  spinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderTopColor: "transparent",
    borderRadius: 10,
  },
});

export default QuizSetupScreen;
