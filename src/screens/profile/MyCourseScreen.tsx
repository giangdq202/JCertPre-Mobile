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
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  AppStackParamList,
  Course as CourseType,
} from "../../navigation/types";
import { getMyEnrollments } from "../../services/enrollmentService";
import { getCourseById } from "../../services/courseService";
import { useAuth } from "../../auth/AuthContext";
import colors from "../../styles/colors";

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "MainTabs">;

const MyCourseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userInfo } = useAuth();

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

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
                title: courseData.title || "Khóa học không tên",
                description: courseData.description || "",
                level: courseData.level ?? 0,
                thumbnailUrl: courseData.thumbnailUrl || "",
                startDate: courseData.startDate || "",
                endDate: courseData.endDate || "",
                price: courseData.price ?? 0,
              };
            } catch (err) {
              console.error(err);
              return {
                courseId: enrollment.courseId,
                title: enrollment.courseTitle || "Khóa học không tên",
                description: enrollment.courseDescription || "",
                level: 0,
                thumbnailUrl: "",
                startDate: "",
                endDate: "",
                price: 0,
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

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);

      const matchesLevel =
        selectedLevel === "" || getLevelString(course.level) === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [courses, searchTerm, selectedLevel]);

  const renderItem = ({ item }: { item: CourseType }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("LearnCourse", { courseId: item.courseId })
      }
    >
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      ) : (
        <LinearGradient
          colors={[colors.lightGray, colors.gray]}
          style={[styles.thumbnail, styles.placeholder]}
        >
          <Text style={styles.placeholderText}>No Image</Text>
        </LinearGradient>
      )}

      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <LinearGradient
            colors={[colors.primary, colors.green]}
            style={styles.levelBadge}
          >
            <Text style={styles.levelText}>{getLevelString(item.level)}</Text>
          </LinearGradient>
        </View>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description ?? ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 8, color: colors.darkGray }}>
          Đang tải khóa học...
        </Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.red }}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setError(null);
            setLoading(true);
          }}
        >
          <Text style={{ color: colors.white }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <ImageBackground
      source={require("../../assets/profile.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.3)"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khóa học của tôi</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={{ flex: 1, padding: 16 }}>
        <TextInput
          style={styles.search}
          placeholder="Tìm khóa học..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={colors.gray}
        />

        <View style={styles.filterRow}>
          {["N5", "N4", "N3", "N2", "N1"].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelOption,
                selectedLevel === level && styles.levelOptionActive,
              ]}
              onPress={() =>
                setSelectedLevel(selectedLevel === level ? "" : level)
              }
            >
              <Text
                style={[
                  styles.levelOptionText,
                  selectedLevel === level && styles.levelOptionTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => String(item.courseId)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <View style={{ marginTop: 20 }}>
              <Text style={{ textAlign: "center", color: colors.lightGray }}>
                Không tìm thấy khóa học
              </Text>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    elevation: 4,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  retryBtn: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  search: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 12,
    fontSize: 14,
    color: colors.darkGray,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  levelOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  levelOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelOptionText: { fontSize: 14, fontWeight: "600", color: colors.darkGray },
  levelOptionTextActive: { color: colors.white },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbnail: { width: "100%", height: 160 },
  placeholder: { justifyContent: "center", alignItems: "center" },
  placeholderText: { color: colors.gray, fontSize: 14 },
  cardContent: { padding: 14 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    flex: 1,
    marginRight: 8,
  },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  levelText: { color: colors.white, fontWeight: "bold", fontSize: 12 },
  desc: { fontSize: 13, color: colors.gray, marginVertical: 6 },
});

export default MyCourseScreen;
