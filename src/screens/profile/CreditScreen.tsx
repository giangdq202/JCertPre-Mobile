import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  ImageBackground,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../auth/AuthContext";
import { createStudentCreditPurchase } from "../../services/paymentService";
import { CreateCreditPurchaseRequest } from "../../navigation/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/types";
import colors from "../../styles/colors";

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "MainTabs">;

const CreditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userInfo } = useAuth();
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!userInfo?.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }

    if (creditAmount <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số credit muốn nạp");
      return;
    }

    setIsLoading(true);
    try {
      const request: CreateCreditPurchaseRequest = {
        userId: userInfo.id,
        creditAmount,
      };

      const response = await createStudentCreditPurchase(request);

      if (response.paymentUrl) {
        Linking.openURL(response.paymentUrl);
      } else {
        Alert.alert("Thông báo", "Không lấy được đường dẫn thanh toán");
      }
    } catch (err: any) {
      // console.error(err);

      // Xử lý lỗi cụ thể
      if (err?.response?.status === 400) {
        const errorMessage = err.response.data?.message || "";
        const errorCode = err.response.data?.errorCode || "";

        if (
          errorCode === "INVALID_AMOUNT" ||
          errorMessage.toLowerCase().includes("amount")
        ) {
          Alert.alert(
            "Lỗi",
            "Số lượng credit không hợp lệ. Vui lòng nhập số lượng từ 1 đến 1,000,000."
          );
        } else if (errorCode === "USER_NOT_FOUND") {
          Alert.alert(
            "Lỗi",
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
        } else {
          Alert.alert(
            "Lỗi",
            errorMessage || "Thông tin không hợp lệ. Vui lòng kiểm tra lại."
          );
        }
      } else if (err?.response?.status === 401) {
        Alert.alert(
          "Lỗi xác thực",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (err?.response?.status === 500) {
        Alert.alert(
          "Lỗi hệ thống",
          "Có lỗi xảy ra từ hệ thống. Vui lòng thử lại sau."
        );
      } else {
        // Lỗi mạng hoặc lỗi khác
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Có lỗi xảy ra khi tạo đơn hàng";
        Alert.alert("Lỗi", errorMessage);
      }

      // Không throw lại error để tránh popup mặc định của React Native
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/profile.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.darkGray + "cc", colors.darkGray + "88"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nạp Credit</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Thông tin Credit hiện tại */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Credit hiện tại</Text>
          <Text style={styles.infoValue}>{userInfo?.credit || 0} credit</Text>
        </View>

        {/* Nhập số credit */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Số credit muốn nạp</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Nhập số credit"
            placeholderTextColor={colors.gray}
            value={creditAmount ? creditAmount.toString() : ""}
            onChangeText={(text) => setCreditAmount(parseInt(text) || 0)}
          />
          <Text style={styles.inputHint}>1 credit = 1 VND</Text>
        </View>

        {/* Thanh toán */}
        {creditAmount > 0 && (
          <View style={styles.paymentBox}>
            <Text style={styles.infoLabel}>Số tiền cần thanh toán</Text>
            <Text style={styles.infoValue}>
              {creditAmount.toLocaleString("vi-VN")} VND
            </Text>
          </View>
        )}

        {/* Button Nạp Credit */}
        <TouchableOpacity
          style={[
            styles.button,
            (isLoading || creditAmount <= 0) && {
              backgroundColor: colors.gray,
            },
          ]}
          disabled={isLoading || creditAmount <= 0}
          onPress={handlePurchase}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Nạp Credit</Text>
          )}
        </TouchableOpacity>

        {/* Thông tin thanh toán */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Thông tin thanh toán</Text>
          <Text style={styles.infoText}>
            • Thanh toán qua PayOS (an toàn, bảo mật)
          </Text>
          <Text style={styles.infoText}>
            • Hỗ trợ: ATM, Internet Banking, QR Code
          </Text>
          <Text style={styles.infoText}>
            • Credit được cộng ngay sau khi thanh toán thành công
          </Text>
          <Text style={styles.infoText}>
            • Vui lòng liên hệ hỗ trợ nếu gặp vấn đề
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default CreditScreen;

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    elevation: 6,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 5,
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
    backgroundColor: colors.black + "33",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  infoBox: {
    backgroundColor: colors.white + "DD",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.darkGray,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: colors.darkGray,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightBlue,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.white + "DD",
    color: colors.black,
  },
  inputHint: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
    fontWeight: "700",
  },
  paymentBox: {
    backgroundColor: colors.lightBlue + "CC",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: colors.lightBlue + "CC",
    padding: 18,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: colors.darkGray,
  },
  infoText: {
    fontSize: 13,
    color: colors.darkGray,
    marginBottom: 4,
  },
});
