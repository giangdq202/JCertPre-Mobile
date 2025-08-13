import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/types";

const courseImages = [
  require("../../assets/course1.png"),
  require("../../assets/course2.png"),
  require("../../assets/course3.png"),
  require("../../assets/course4.png"),
  require("../../assets/course5.png"),
];

interface Course {
  id: string;
  title: string;
  description: string;
  level: number;
  courseType: number;
  price: number;
  thumbnailUrl: any;
}

const allCourses: Course[] = [
  {
    id: "1",
    title: "JLPT N5 Complete Course - Beginner Japanese",
    description:
      "Khóa học chuẩn bị JLPT N5 toàn diện bao gồm hiragana, katakana, kanji cơ bản (100 ký tự), các mẫu ngữ pháp thiết yếu và từ vựng (hơn 800 từ).",
    level: 0,
    courseType: 0,
    price: 1500000,
    thumbnailUrl: courseImages[4],
  },
  {
    id: "2",
    title: "JLPT N4 Intensive Course - Elementary Japanese",
    description:
      "Tăng cường kỹ năng trình độ N4 về ngữ pháp, từ vựng (hơn 1500 từ) và nghe hiểu. Phù hợp cho người đã có kiến thức cơ bản.",
    level: 1,
    courseType: 0,
    price: 1700000,
    thumbnailUrl: courseImages[3],
  },
  {
    id: "3",
    title: "JLPT N3 Practice & Review Course",
    description:
      "Luyện thi N3 tập trung vào đề thi thử, đọc hiểu, ngữ pháp trung cấp và từ vựng (hơn 3000 từ).",
    level: 2,
    courseType: 0,
    price: 1800000,
    thumbnailUrl: courseImages[2],
  },
  {
    id: "4",
    title: "JLPT N2 Advanced Grammar & Kanji Course",
    description:
      "Nâng cao ngữ pháp và kanji cho kỳ thi JLPT N2. Hoàn hảo cho học viên sử dụng tiếng Nhật nâng cao.",
    level: 3,
    courseType: 0,
    price: 2000000,
    thumbnailUrl: courseImages[1],
  },
  {
    id: "5",
    title: "JLPT N1 Master Course - Proficiency Level",
    description:
      "Luyện thi JLPT N1 với vốn từ vựng nâng cao, kanji (hơn 2000 từ), ngữ pháp và bài luyện hiểu sâu.",
    level: 4,
    courseType: 0,
    price: 2500000,
    thumbnailUrl: courseImages[0],
  },
];

interface Transaction {
  id: string;
  courseId: string;
  date: string;
  amount: number;
  status: "success" | "pending" | "failed";
}

const mockTransactions: Transaction[] = [
  {
    id: "t1",
    courseId: "1",
    date: "2025-08-05",
    amount: 1500000,
    status: "success",
  },
  {
    id: "t2",
    courseId: "3",
    date: "2025-07-28",
    amount: 1800000,
    status: "pending",
  },
  {
    id: "t3",
    courseId: "5",
    date: "2025-07-15",
    amount: 2500000,
    status: "failed",
  },
];

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "TransactionHistory"
>;

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const renderItem = ({ item }: { item: Transaction }) => {
    const course = allCourses.find((c) => c.id === item.courseId);
    const statusColors = {
      success: "#10B981",
      pending: "#F59E0B",
      failed: "#EF4444",
    };

    if (!course) return null;

    return (
      <View style={styles.card}>
        <Image source={course.thumbnailUrl} style={styles.thumbnail} />
        <View style={{ flex: 1 }}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString("vi-VN")}
          </Text>
          <Text style={styles.amount}>
            {item.amount.toLocaleString("vi-VN")}₫
          </Text>
        </View>
        <Text style={[styles.status, { color: statusColors[item.status] }]}>
          {item.status === "success"
            ? "Thành công"
            : item.status === "pending"
            ? "Đang xử lý"
            : "Thất bại"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Transaction List */}
      <FlatList
        data={mockTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  backButton: {
    backgroundColor: "#E5E7EB",
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  courseTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  date: { fontSize: 13, color: "#6B7280", marginVertical: 2 },
  amount: { fontSize: 14, fontWeight: "700", color: "#2563EB" },
  status: { fontSize: 13, fontWeight: "600" },
});

export default TransactionHistoryScreen;
