import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppStackParamList, Course } from "../../navigation/types";
import {
  checkEnrollmentStatus,
  enrollSelfInCourse,
  CheckEnrollmentStatusResult,
} from "../../services/enrollmentService";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "CourseDetail"
>;
type RoutePropType = RouteProp<AppStackParamList, "CourseDetail">;

const CourseDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { course } = route.params;

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy thông tin khóa học</Text>
      </View>
    );
  }

  const courseId = course.courseId;

  const [courseDetail, setCourseDetail] = useState<Course>(course);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnroll, setCheckingEnroll] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        setCheckingEnroll(true);
        const status: CheckEnrollmentStatusResult = await checkEnrollmentStatus(
          courseId
        );
        setEnrolled(status.isEnrolled);
      } catch (error) {
        // console.error("Lỗi kiểm tra ghi danh:", error);
      } finally {
        setCheckingEnroll(false);
      }
    };
    fetchEnrollment();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      setModalVisible(false);
      setCheckingEnroll(true);
      await enrollSelfInCourse({ courseId: courseDetail.courseId });
      setEnrolled(true);
      Alert.alert("Thành công", "Bạn đã đăng ký khóa học!");
    } catch (error: any) {
      // Không log error để tránh popup
      // console.error("Enroll error:", error);

      // Xử lý các loại lỗi cụ thể
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || "";
        const errorCode = error.response.data?.errorCode || "";

        // Kiểm tra lỗi thiếu credit
        if (
          errorCode === "INSUFFICIENT_CREDIT" ||
          errorMessage.toLowerCase().includes("credit") ||
          errorMessage.toLowerCase().includes("không đủ") ||
          errorMessage.toLowerCase().includes("insufficient")
        ) {
          Alert.alert(
            "Không đủ Credit",
            `Bạn không có đủ credit để đăng ký khóa học này. Khóa học cần ${courseDetail.price} credit.\n\nVui lòng nạp thêm credit để tiếp tục.`,
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Nạp Credit",
                onPress: () => navigation.navigate("Credit"),
              },
            ]
          );
        } else {
          // Hiển thị message từ server hoặc message mặc định
          const displayMessage =
            errorMessage || "Bạn không đủ credit để đăng ký khóa học này.";
          Alert.alert("Lỗi đăng ký", displayMessage);
        }
      } else if (error.response?.status === 409) {
        Alert.alert("Thông báo", "Bạn đã đăng ký khóa học này rồi!");
      } else if (error.response?.status === 401) {
        Alert.alert(
          "Lỗi xác thực",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else {
        // Lỗi khác
        const genericMessage =
          error.response?.data?.message ||
          "Không thể đăng ký khóa học. Vui lòng thử lại sau.";
        Alert.alert("Lỗi", genericMessage);
      }

      // Không throw lại error để tránh popup mặc định của React Native
      return;
    } finally {
      setCheckingEnroll(false);
    }
  };

  return (
    <LinearGradient colors={["#f0fdf4", "#ffffff"]} style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: courseDetail.thumbnailUrl }}
          style={styles.image}
        />

        <View style={styles.contentContainer}>
          <Text style={styles.levelBadge}>
            Trình độ: JLPT {["N5", "N4", "N3", "N2", "N1"][courseDetail.level]}
          </Text>

          <Text style={styles.title}>{courseDetail.title}</Text>

          <Text style={styles.price}>
            {courseDetail.price === 0
              ? "Miễn phí"
              : `${courseDetail.price.toLocaleString("vi-VN")} VND`}
          </Text>

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>Giới thiệu khóa học</Text>
          <Text style={styles.description}>{courseDetail.description}</Text>

          <TouchableOpacity
            style={[
              styles.enrollButton,
              enrolled && { backgroundColor: "#9ca3af" },
            ]}
            disabled={enrolled || checkingEnroll}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.enrollText}>
              {enrolled ? "Đã đăng ký" : "Đăng ký ngay"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal confirm */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Xác nhận đăng ký</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn đăng ký khóa học này không?
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#10b981" }]}
                onPress={handleEnroll}
              >
                <Text style={styles.modalBtnText}>Đồng ý</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#9ca3af" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Huỷ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  image: { width: width, height: 240, resizeMode: "cover" },
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
  sectionDivider: { height: 1, backgroundColor: "#e5e7eb", marginBottom: 20 },
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
  enrollText: { color: "white", fontSize: 16, fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBtnText: { color: "white", fontWeight: "600", fontSize: 16 },
});

export default CourseDetailScreen;
