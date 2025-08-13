import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Course } from "../../navigation/types";

const { width } = Dimensions.get("window");

type CourseDetailRouteProp = RouteProp<
  { params: { course: Course } },
  "params"
>;

const CourseDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<CourseDetailRouteProp>();
  const { course } = route.params;

  return (
    <LinearGradient colors={["#f0fdf4", "#ffffff"]} style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={course.thumbnailUrl} style={styles.image} />

        <View style={styles.contentContainer}>
          <Text style={styles.levelBadge}>
            Trình độ: JLPT {["N5", "N4", "N3", "N2", "N1"][course.level]}
          </Text>

          <Text style={styles.title}>{course.title}</Text>

          <Text style={styles.price}>
            {course.price.toLocaleString("vi-VN")} VND
          </Text>

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>Giới thiệu khóa học</Text>
          <Text style={styles.description}>{course.description}</Text>

          <TouchableOpacity style={styles.enrollButton}>
            <Text style={styles.enrollText}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: width,
    height: 240,
    resizeMode: "cover",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  levelBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#10b981",
    color: "white",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 30,
  },
  enrollButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  enrollText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CourseDetailScreen;
