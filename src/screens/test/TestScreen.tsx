import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import backgroundImage from "../../assets/test.jpg";

const { width } = Dimensions.get("window");
const testImage = require("../../assets/test1.jpg");

const testTemplates = [
  {
    id: "1",
    typeName: "Ngữ pháp N5",
    courseLevel: 1,
    description: "Kiểm tra ngữ pháp trình độ N5",
    tests: [
      {
        id: "t1",
        title: "Đề số 1",
        description: "Cơ bản N5",
        durationMinutes: 30,
        availableFrom: "2025-08-01",
        availableTo: "2025-08-31",
        maxAttempts: 3,
      },
      {
        id: "t2",
        title: "Đề số 2",
        description: "Bài nâng cao",
        durationMinutes: 45,
        availableFrom: "2025-08-05",
        availableTo: "2025-08-30",
        maxAttempts: 2,
      },
    ],
  },
  {
    id: "2",
    typeName: "Từ vựng N4",
    courseLevel: 2,
    description: "Từ vựng trình độ N4",
    tests: [
      {
        id: "t3",
        title: "Từ vựng - Đề 1",
        description: "Từ vựng cơ bản",
        durationMinutes: 25,
        availableFrom: "2025-08-01",
        availableTo: "2025-08-31",
        maxAttempts: 3,
      },
    ],
  },
  {
    id: "3",
    typeName: "Đọc hiểu N3",
    courseLevel: 3,
    description: "Đọc hiểu nâng cao N3",
    tests: [
      {
        id: "t4",
        title: "Đề số 1",
        description: "Bài đọc nhanh",
        durationMinutes: 20,
        availableFrom: "2025-08-01",
        availableTo: "2025-08-20",
        maxAttempts: 2,
      },
    ],
  },
  {
    id: "4",
    typeName: "Nghe hiểu N2",
    courseLevel: 4,
    description: "Nghe hiểu trung cấp",
    tests: [
      {
        id: "t5",
        title: "Đề số 1",
        description: "Luyện nghe tổng hợp",
        durationMinutes: 30,
        availableFrom: "2025-08-10",
        availableTo: "2025-08-31",
        maxAttempts: 3,
      },
    ],
  },
  {
    id: "5",
    typeName: "Tổng hợp N1",
    courseLevel: 5,
    description: "Tổng hợp luyện đề JLPT",
    tests: [
      {
        id: "t6",
        title: "Đề số 1",
        description: "Đề luyện thi tổng hợp",
        durationMinutes: 50,
        availableFrom: "2025-08-01",
        availableTo: "2025-08-31",
        maxAttempts: 1,
      },
    ],
  },
];

export default function TestScreen() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const filteredTemplates = selectedLevel
    ? testTemplates.filter((t) => t.courseLevel === selectedLevel)
    : testTemplates;

  const allTests = filteredTemplates.flatMap((template) => template.tests);

  const renderTest = ({ item }: { item: any }) => (
    <ImageBackground
      source={testImage}
      resizeMode="cover"
      style={styles.testCard}
      imageStyle={{ borderRadius: 12 }}
    >
      <View style={styles.overlay}>
        <Text style={styles.testTitle}>{item.title}</Text>
        <Text style={styles.testDesc}>{item.description}</Text>

        <View style={styles.row}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#fff" />
          <Text style={styles.infoText}>{item.durationMinutes} phút</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={16}
            color="#fff"
          />
          <Text style={styles.infoText}>
            Từ: {new Date(item.availableFrom).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons
            name="calendar-remove"
            size={16}
            color="#fff"
          />
          <Text style={styles.infoText}>
            Đến: {new Date(item.availableTo).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="repeat" size={16} color="#fff" />
          <Text style={styles.infoText}>
            Làm tối đa: {item.maxAttempts} lần
          </Text>
        </View>
      </View>
    </ImageBackground>
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Bài Thi Thử JLPT</Text>

        <View style={styles.levelSelector}>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[
                styles.levelBtn,
                selectedLevel === lvl && styles.levelBtnActive,
              ]}
              onPress={() =>
                setSelectedLevel(selectedLevel === lvl ? null : lvl)
              }
            >
              <Text
                style={
                  selectedLevel === lvl
                    ? styles.levelTextActive
                    : styles.levelText
                }
              >
                N{6 - lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={allTests}
          renderItem={renderTest}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.rowWrap}
          contentContainerStyle={styles.testList}
          scrollEnabled={false}
        />
      </ScrollView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 16,
    color: "#111827",
  },
  levelSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  levelBtn: {
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    margin: 6,
  },
  levelBtnActive: {
    backgroundColor: "#10b981",
  },
  levelText: {
    color: "#10b981",
    fontWeight: "500",
  },
  levelTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
  testList: {
    paddingBottom: 30,
  },
  rowWrap: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  testCard: {
    width: (width - 48) / 2,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    justifyContent: "space-between",
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  testDesc: {
    fontSize: 14,
    color: "#f0fdf4",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  infoText: {
    color: "#f0fdf4",
    fontSize: 12,
  },
});
