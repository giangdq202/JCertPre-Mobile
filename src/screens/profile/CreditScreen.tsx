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
} from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { createStudentCreditPurchase } from "../../services/paymentService";
import { CreateCreditPurchaseRequest } from "../../navigation/types";

const CreditScreen = () => {
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
      console.error(err);
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Nạp Credit</Text>
      <Text style={styles.subHeader}>
        Nạp credit để mua khóa học và tham gia kỳ thi
      </Text>

      {/* Credit hiện tại */}
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

      {/* Button */}
      <TouchableOpacity
        style={[
          styles.button,
          (isLoading || creditAmount <= 0) && { backgroundColor: "#A5B4FC" },
        ]}
        disabled={isLoading || creditAmount <= 0}
        onPress={handlePurchase}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
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
  );
};

export default CreditScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: "#EFF6FF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: "#1E40AF",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1E40AF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  paymentBox: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: "#E0F2FE",
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1E3A8A",
  },
  infoText: {
    fontSize: 13,
    color: "#1E40AF",
    marginBottom: 4,
  },
});
