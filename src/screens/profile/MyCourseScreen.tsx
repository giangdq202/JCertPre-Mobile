import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  AppStackParamList,
  Course as CourseType,
} from "../../navigation/types";
import { getMyEnrollments } from "../../services/enrollmentService";
import { getCourseById } from "../../services/courseService";
import { useAuth } from "../../auth/AuthContext";

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "MainTabs">;

const MyCourseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userInfo } = useAuth();

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // ---------------- Fetch enrolled courses ----------------
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const enrollments = await getMyEnrollments();

        const courseList: CourseType[] = await Promise.all(
          enrollments.map(async (enrollment) => {
            try {
              const courseData = await getCourseById(enrollment.courseId);
              return {
                courseId: enrollment.courseId,
                title: courseData.title,
                description: courseData.description,
                level: courseData.level,
                price: courseData.price,
                thumbnailUrl: courseData.thumbnailUrl || "",
                startDate: courseData.startDate,
                endDate: courseData.endDate,
              };
            } catch (err) {
              console.error(err);
              return {
                courseId: enrollment.courseId,
                title: enrollment.courseTitle || "Unknown Course",
                description: enrollment.courseDescription || "",
                level: 0,
                price: 0,
                thumbnailUrl: "",
              };
            }
          })
        );

        setCourses(courseList);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ---------------- Helpers ----------------
  const getLevelString = (level: number) => {
    const map: Record<number, string> = {
      0: "N5",
      1: "N4",
      2: "N3",
      3: "N2",
      4: "N1",
    };
    return map[level] || "N5";
  };

  // ---------------- Filters ----------------
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        selectedLevel === "" || getLevelString(course.level) === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [courses, searchTerm, selectedLevel]);

  // ---------------- Render course card ----------------
  const renderItem = ({ item }: { item: CourseType }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("CourseDetail", { course: item })}
    >
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{getLevelString(item.level)}</Text>
          </View>
        </View>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>{item.price.toLocaleString()} VNĐ</Text>
      </View>
    </TouchableOpacity>
  );

  // ---------------- Loading / Error ----------------
  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ marginTop: 8 }}>Đang tải khóa học...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setError(null);
            setLoading(true);
          }}
        >
          <Text style={{ color: "white" }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb", padding: 16 }}>
      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Tìm khóa học..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Filter by level */}
      <View style={styles.filterRow}>
        <TextInput
          style={styles.filterInput}
          placeholder="Cấp độ (N5-N1)"
          value={selectedLevel}
          onChangeText={setSelectedLevel}
        />
      </View>

      {/* Course List */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.courseId}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: 20, color: "#6b7280" }}
          >
            Không tìm thấy khóa học
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  retryBtn: {
    backgroundColor: "#22c55e",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  search: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 12,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  filterInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontSize: 14,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnail: { width: "100%", height: 160 },
  placeholder: {
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: "#9ca3af", fontSize: 14 },
  cardContent: { padding: 14 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#111827", flex: 1 },
  levelBadge: {
    backgroundColor: "#B3E5FC",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: { color: "#0284C7", fontWeight: "bold", fontSize: 12 },
  desc: { fontSize: 13, color: "#6b7280", marginVertical: 6 },
  price: { fontSize: 14, fontWeight: "bold", color: "#22c55e" },
});

export default MyCourseScreen;
