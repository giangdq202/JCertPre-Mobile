// src/screens/profile/ProfileScreen.tsx
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

const avatar = require("../../assets/no-avatar.png");

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

      <View style={styles.cardsContainer}>
        {/* Credit Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Credit")}
        >
          <Feather name="credit-card" size={28} color="#32CD32" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardLabel}>Số dư Credit</Text>
            <Text style={styles.cardValue}>
              {formatCurrency(userInfo?.credit || 0)}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            color="#32CD32"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* Payment History Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("TransactionHistory")}
        >
          <Feather name="clock" size={28} color="#FFB74D" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardLabel}>Lịch sử thanh toán</Text>
            <Text style={styles.cardValue}>Xem chi tiết</Text>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            color="#FFB74D"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
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
  name: { fontSize: 20, fontWeight: "700", color: "#065f46" },
  email: { fontSize: 14, color: "#047857" },
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
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardLabel: { fontSize: 14, color: "#6b7280" },
  cardValue: { fontSize: 16, fontWeight: "700", color: "#047857" },
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
  logoutText: { marginLeft: 8, fontSize: 15, color: "#fff", fontWeight: "600" },
});

export default ProfileScreen;
