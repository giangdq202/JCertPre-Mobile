import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "react-native";
import backgroundImage from "../../assets/courses.jpg";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const courseImages = [
  require("../../assets/course1.png"),
  require("../../assets/course2.png"),
  require("../../assets/course3.png"),
  require("../../assets/course4.png"),
  require("../../assets/course5.png"),
];

type Course = {
  id: string;
  title: string;
  description: string;
  level: number;
  courseType: number;
  price: number;
  thumbnailUrl: any;
};

const levelLabels = ["N5", "N4", "N3", "N2", "N1"];

const allCourses: Course[] = [
  {
    id: "1",
    title: "JLPT N5 Complete Course - Beginner Japanese",
    description:
      "Khóa học chuẩn bị JLPT N5 toàn diện bao gồm hiragana, katakana, kanji cơ bản (100 ký tự), các mẫu ngữ pháp thiết yếu và từ vựng (hơn 800 từ). Phù hợp cho người mới bắt đầu hoàn toàn.",
    level: 0,
    courseType: 0,
    price: 1500000,
    thumbnailUrl: courseImages[0],
  },
  {
    id: "2",
    title: "JLPT N4 Intensive Course - Elementary Japanese",
    description:
      "Tăng cường kỹ năng trình độ N4 về ngữ pháp, từ vựng (hơn 1500 từ) và nghe hiểu. Phù hợp cho người đã có kiến thức cơ bản về tiếng Nhật.",
    level: 1,
    courseType: 0,
    price: 1700000,
    thumbnailUrl: courseImages[1],
  },
  {
    id: "3",
    title: "JLPT N3 Practice & Review Course",
    description:
      "Khóa học luyện thi N3 tập trung vào thực hành với đề thi thử, đọc hiểu, ngữ pháp trung cấp và từ vựng (hơn 3000 từ).",
    level: 2,
    courseType: 0,
    price: 1800000,
    thumbnailUrl: courseImages[2],
  },
  {
    id: "4",
    title: "JLPT N2 Advanced Grammar & Kanji Course",
    description:
      "Nâng cao ngữ pháp và khả năng nhận diện kanji cho kỳ thi JLPT N2. Hoàn hảo cho học viên chuẩn bị sử dụng tiếng Nhật nâng cao.",
    level: 3,
    courseType: 0,
    price: 2000000,
    thumbnailUrl: courseImages[3],
  },
  {
    id: "5",
    title: "JLPT N1 Master Course - Proficiency Level",
    description:
      "Khóa luyện thi trình độ cao nhất JLPT N1 với vốn từ vựng nâng cao, kanji (hơn 2000 từ), ngữ pháp và các bài luyện hiểu sâu.",
    level: 4,
    courseType: 0,
    price: 2500000,
    thumbnailUrl: courseImages[4],
  },
];

export default function CourseScreen() {
  const [searchText, setSearchText] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const filteredCourses = allCourses.filter((course) => {
    const matchSearch = course.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchLevel = selectedLevel === null || course.level === selectedLevel;
    return matchSearch && matchLevel;
  });

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#777"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Tìm kiếm khóa học, từ vựng..."
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#777"
          />
        </View>

        {/* Bộ lọc cấp độ */}
        <View style={styles.levelFilter}>
          {levelLabels.map((label, index) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.levelButton,
                selectedLevel === index && styles.levelButtonSelected,
              ]}
              onPress={() =>
                setSelectedLevel(selectedLevel === index ? null : index)
              }
            >
              <Text
                style={[
                  styles.levelButtonText,
                  selectedLevel === index && styles.levelButtonTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Danh sách khóa học */}
        <ScrollView
          contentContainerStyle={styles.courseList}
          keyboardShouldPersistTaps="handled"
        >
          {filteredCourses.map((course) => (
            <View key={course.id} style={styles.card}>
              <Image
                source={course.thumbnailUrl}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.content}>
                <Text style={styles.title}>{course.title}</Text>
                <Text style={styles.description} numberOfLines={3}>
                  {course.description}
                </Text>
                <Text style={styles.price}>
                  {course.price.toLocaleString("vi-VN")} VND
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F4",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 40,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 48,
  },

  searchIcon: {
    marginRight: 10,
    color: "#777",
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },
  levelFilter: {
    flexDirection: "row",
    flexWrap: "wrap", // cho xuống dòng nếu không đủ chỗ
    gap: 8,
    marginBottom: 16,
    justifyContent: "center",
  },

  levelButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },

  levelButtonSelected: {
    backgroundColor: "#10b981",
  },

  levelButtonText: {
    fontSize: 14,
    color: "#374151",
  },

  levelButtonTextSelected: {
    color: "white",
    fontWeight: "600",
  },

  courseList: {
    paddingBottom: 80,
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10b981",
  },
});
