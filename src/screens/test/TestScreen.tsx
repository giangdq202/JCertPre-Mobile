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
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import backgroundImage from "../../assets/test.jpg";

const { width } = Dimensions.get("window");
const testImage = require("../../assets/test1.jpg");

const testTemplates = [
  {
    id: "1",
    title: "Từ vựng N5 - Đề 1",
    description: "Luyện từ vựng trình độ N5",
    testType: 0,
    courseLevel: 0,
    durationMinutes: 20,
    availableFrom: "2025-08-01T00:00:00.000Z",
    availableTo: "2025-12-31T23:59:59.000Z",
    maxAttempts: 3,
    passingPercentage: 60,
    thumbnailUrl: require("../../assets/test1.jpg"),
  },
  {
    id: "2",
    title: "Ngữ pháp N5 - Đề 1",
    description: "Luyện ngữ pháp trình độ N5",
    testType: 1,
    courseLevel: 0,
    durationMinutes: 20,
    availableFrom: "2025-08-01T00:00:00.000Z",
    availableTo: "2025-12-31T23:59:59.000Z",
    maxAttempts: 3,
    passingPercentage: 60,
    thumbnailUrl: require("../../assets/test1.jpg"),
  },
  {
    id: "3",
    title: "Đọc hiểu N5 - Đề 1",
    description: "Luyện đọc hiểu trình độ N5",
    testType: 2,
    courseLevel: 0,
    durationMinutes: 15,
    availableFrom: "2025-08-01T00:00:00.000Z",
    availableTo: "2025-12-31T23:59:59.000Z",
    maxAttempts: 3,
    passingPercentage: 60,
    thumbnailUrl: require("../../assets/test1.jpg"),
  },
  {
    id: "4",
    title: "Từ vựng N4 - Đề 1",
    description: "Luyện từ vựng trình độ N4",
    testType: 0,
    courseLevel: 1,
    durationMinutes: 20,
    availableFrom: "2025-08-01T00:00:00.000Z",
    availableTo: "2025-12-31T23:59:59.000Z",
    maxAttempts: 3,
    passingPercentage: 60,
    thumbnailUrl: require("../../assets/test1.jpg"),
  },
  {
    id: "5",
    title: "Ngữ pháp N4 - Đề 1",
    description: "Luyện ngữ pháp trình độ N4",
    testType: 1,
    courseLevel: 1,
    durationMinutes: 20,
    availableFrom: "2025-08-01T00:00:00.000Z",
    availableTo: "2025-12-31T23:59:59.000Z",
    maxAttempts: 3,
    passingPercentage: 60,
    thumbnailUrl: require("../../assets/test1.jpg"),
  },
  {
    id: "6",
    title: "Đọc hiểu N4 - Đề 1",
    description: "Luyện đọc hiểu trình độ N4",
    testType: 2,
    courseLevel: 1,
    durationMinutes: 15,
    availableFrom: "2025-08-01T00:00:00.000Z",
    availableTo: "2025-12-31T23:59:59.000Z",
    maxAttempts: 3,
    passingPercentage: 60,
    thumbnailUrl: require("../../assets/test1.jpg"),
  },
  {
    id: "7",
    title: "Từ vựng N3 - Đề 1",
    description: "Luyện từ vựng trình độ N3",
    testType: 0,
    courseLevel: 2,
    durationMinutes: 25,
    availableFrom: "2025-08-01T00:00:00.000Z",
    availableTo: "2025-12-31T23:59:59.000Z",
    maxAttempts: 3,
    passingPercentage: 60,
    thumbnailUrl: require("../../assets/test1.jpg"),
  },
  {
    id: "8",
    title: "Ngữ pháp N3 - Đề 1",
    description: "Luyện ngữ pháp trình độ N3",
    testType: 1,
    courseLevel: 2,
    durationMinutes: 25,
    availableFrom: "2025-08-01T00:00:00.000Z",
    availableTo: "2025-12-31T23:59:59.000Z",
    maxAttempts: 3,
    passingPercentage: 60,
    thumbnailUrl: require("../../assets/test1.jpg"),
  },
  {
    id: "9",
    title: "Đọc hiểu N3 - Đề 1",
    description: "Luyện đọc hiểu trình độ N3",
    testType: 2,
    courseLevel: 2,
    durationMinutes: 20,
    availableFrom: "2025-08-01T00:00:00.000Z",
    availableTo: "2025-12-31T23:59:59.000Z",
    maxAttempts: 3,
    passingPercentage: 60,
    thumbnailUrl: require("../../assets/test1.jpg"),
  },
];

export default function TestScreen() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredTemplates =
    selectedLevel !== null
      ? testTemplates.filter((t) => t.courseLevel === selectedLevel)
      : testTemplates;

  const renderTest = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedTest(item);
        setModalVisible(true);
      }}
    >
      <ImageBackground
        source={item.thumbnailUrl || testImage}
        resizeMode="cover"
        style={styles.testCard}
        imageStyle={{ borderRadius: 12 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.testTitle}>{item.title}</Text>
          <Text style={styles.testDesc}>{item.testTypeLabel}</Text>

          <View style={styles.row}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#fff"
            />
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
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Bài Thi Thử JLPT</Text>

        <View style={styles.levelSelector}>
          {[0, 1, 2, 3, 4].map((lvl) => (
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
                N{5 - lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredTemplates}
          renderItem={renderTest}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.rowWrap}
          contentContainerStyle={styles.testList}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            {selectedTest && (
              <>
                <Text style={styles.modalTitle}>{selectedTest.title}</Text>
                <Text style={styles.modalSub}>
                  {selectedTest.testTypeLabel}
                </Text>
                <Text style={styles.modalDesc}>{selectedTest.description}</Text>

                <View style={styles.modalInfoRow}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color="#10b981"
                  />
                  <Text style={styles.modalInfoText}>
                    Thời lượng: {selectedTest.durationMinutes} phút
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={18}
                    color="#10b981"
                  />
                  <Text style={styles.modalInfoText}>
                    Thời gian:{" "}
                    {new Date(selectedTest.availableFrom).toLocaleDateString()}{" "}
                    - {new Date(selectedTest.availableTo).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <MaterialCommunityIcons
                    name="repeat"
                    size={18}
                    color="#10b981"
                  />
                  <Text style={styles.modalInfoText}>
                    Làm tối đa: {selectedTest.maxAttempts} lần
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Bắt đầu làm bài</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalClose}>Huỷ</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 10,
    justifyContent: "space-between",
  },
  testTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  testDesc: {
    fontSize: 13,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111827",
    textAlign: "center",
  },
  modalSub: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalInfoText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#111827",
  },
  modalBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalClose: {
    marginTop: 16,
    textAlign: "center",
    color: "#9ca3af",
    textDecorationLine: "underline",
  },
});
