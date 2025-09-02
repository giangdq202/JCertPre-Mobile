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
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/types";

const defaultAvatar = require("../../assets/no-avatar.png");

type ProfileScreenNavProp = NativeStackNavigationProp<
  AppStackParamList,
  "MainTabs"
>;

const ProfileScreen = () => {
  const { userInfo, handleLogout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavProp>();

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#a7f3d0", "#6ee7b7"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={
              userInfo?.avatarUrl ? { uri: userInfo.avatarUrl } : defaultAvatar
            }
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>
          {userInfo?.fullName || "Tên người dùng"}
        </Text>
        <Text style={styles.email}>
          {userInfo?.email || "Email chưa cập nhật"}
        </Text>
      </LinearGradient>

      {/* Cards */}
      <View style={styles.cardsContainer}>
        {/* Hồ sơ của tôi */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: "#93c5fd" }]}
          onPress={() => navigation.navigate("ProfileDetail")}
          activeOpacity={0.8}
        >
          <Feather name="user" size={28} color="#3b82f6" />
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>Hồ sơ của tôi</Text>
            <Text style={styles.cardValue}>Xem và chỉnh sửa thông tin</Text>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            color="#3b82f6"
            style={styles.chevron}
          />
        </TouchableOpacity>

        {/* Khóa học của tôi */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: "#fde68a" }]}
          onPress={() => navigation.navigate("MyCourse")}
          activeOpacity={0.8}
        >
          <Feather name="book-open" size={28} color="#f59e0b" />
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>Khóa học của tôi</Text>
            <Text style={styles.cardValue}>Danh sách khóa học đã đăng ký</Text>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            color="#f59e0b"
            style={styles.chevron}
          />
        </TouchableOpacity>

        {/* Số dư Credit */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: "#86efac" }]}
          onPress={() => navigation.navigate("Credit")}
          activeOpacity={0.8}
        >
          <Feather name="credit-card" size={28} color="#16a34a" />
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>Số dư Credit</Text>
            <LinearGradient
              colors={["#a7f3d0", "#6ee7b7"]}
              style={styles.creditValueWrapper}
            >
              <Text style={styles.cardValueWhite}>
                {formatCurrency(userInfo?.credit || 0)}
              </Text>
            </LinearGradient>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            color="#16a34a"
            style={styles.chevron}
          />
        </TouchableOpacity>

        {/* Lịch sử thanh toán */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: "#fdba74" }]}
          onPress={() => navigation.navigate("TransactionHistory")}
          activeOpacity={0.8}
        >
          <Feather name="clock" size={28} color="#f97316" />
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>Lịch sử thanh toán</Text>
            <Text style={styles.cardValue}>Xem chi tiết</Text>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            color="#f97316"
            style={styles.chevron}
          />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Feather name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
  header: {
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  avatarWrapper: {
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
    padding: 3,
    marginBottom: 12,
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  name: { fontSize: 22, fontWeight: "700", color: "#065f46" },
  email: { fontSize: 15, color: "#047857", marginTop: 2 },
  cardsContainer: { padding: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  cardText: { marginLeft: 12, flex: 1 },
  cardLabel: { fontSize: 14, color: "#374151" },
  cardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
    marginTop: 2,
  },
  creditValueWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  cardValueWhite: { color: "#fff", fontWeight: "700" },
  chevron: { marginLeft: "auto" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    marginHorizontal: 24,
    marginVertical: 30,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default ProfileScreen;
