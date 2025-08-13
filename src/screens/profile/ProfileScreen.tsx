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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/types";
import Option from "../../components/Option";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "MainTabs"
>;

const avatar = require("../../assets/no-avatar.png");

const ProfileScreen = () => {
  const { userInfo, handleLogout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#d1fae5", "#32CD32"]}
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

      {/* Credit Card */}
      <View style={styles.creditCard}>
        <Feather name="credit-card" size={24} color="#32CD32" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.creditLabel}>Số dư Credit</Text>
          <Text style={styles.creditValue}>{formatCurrency(120000)}</Text>
        </View>

        {/* Nút nạp thêm */}
        <TouchableOpacity
          style={styles.topUpButton}
          onPress={() => console.log("Nạp thêm credit")}
        >
          <Feather name="plus-circle" size={22} color="#fff" />
          <Text style={styles.topUpText}>Nạp</Text>
        </TouchableOpacity>
      </View>

      {/* Tài khoản */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <View>
          <Option
            icon="user"
            label="Thông tin cá nhân"
            onPress={() => navigation.navigate("ProfileDetail")}
          />
        </View>
        <Option icon="lock" label="Đổi mật khẩu" />
        <Option
          icon="clock"
          label="Lịch sử mua khóa học"
          onPress={() => navigation.navigate("TransactionHistory")}
        />

        <Option icon="book" label="Khoá học đã mua" />
      </View>

      {/* Cài đặt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Khác</Text>
        <Option icon="bell" label="Thông báo" />
        <Option icon="help-circle" label="Hỗ trợ" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  header: {
    paddingVertical: 36,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065f46",
  },
  email: {
    fontSize: 14,
    color: "#047857",
  },

  creditCard: {
    marginHorizontal: 20,
    marginTop: -20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  creditLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  creditValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#047857",
  },

  section: {
    marginTop: 28,
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
    backgroundColor: "#10b981",
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
  topUpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  topUpText: {
    marginLeft: 4,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ProfileScreen;
