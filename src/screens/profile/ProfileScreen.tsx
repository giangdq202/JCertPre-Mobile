import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";

const avatar = require("../../assets/no-avatar.png"); // Avatar mặc định

const ProfileScreen = () => {
  const { userInfo, handleLogout } = useAuth(); // ← Dùng từ context
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#bbf7d0", "#4ade80", "#22c55e"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Image source={avatar} style={styles.avatar} />
        <Text style={styles.name}>
          {userInfo?.fullName || "Tên người dùng"}
        </Text>
        <Text style={styles.email}>
          {userInfo?.email || "Email chưa cập nhật"}
        </Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <Option icon="user" label="Thông tin cá nhân" />
        <Option icon="lock" label="Đổi mật khẩu" />
        <Option icon="credit-card" label="Lịch sử mua khóa học" />
        <Option icon="book" label="Khoá học đã mua" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt & Credit</Text>
        <Option icon="bell" label="Thông báo" />
        <Option
          icon="dollar-sign"
          label={`Credit hiện có: ${formatCurrency(120000)}`}
        />

        <Option icon="plus-circle" label="Nạp thêm Credit" />
        <Option icon="moon" label="Giao diện tối" />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Option = ({ icon, label }: { icon: any; label: string }) => (
  <TouchableOpacity style={styles.option}>
    <Feather name={icon} size={20} color="#16a34a" />
    <Text style={styles.optionText}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf5",
  },
  header: {
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#064e3b",
  },
  email: {
    fontSize: 14,
    color: "#047857",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#065f46",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    margin: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
});

export default ProfileScreen;
