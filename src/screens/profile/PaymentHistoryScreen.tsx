import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../auth/AuthContext";
import {
  getStudentCreditHistory,
  getStudentPaymentHistory,
} from "../../services/paymentService";
import {
  CreditTransactionItem,
  PaymentHistoryItem,
} from "../../navigation/types";
import { Ionicons } from "@expo/vector-icons";

const PaymentHistoryScreen = () => {
  const { userInfo } = useAuth();
  const navigation = useNavigation();
  const [creditTransactions, setCreditTransactions] = useState<
    CreditTransactionItem[]
  >([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"credit" | "payment">("credit");

  useEffect(() => {
    if (userInfo?.id) {
      fetchHistory();
    }
  }, [userInfo?.id]);

  const fetchHistory = async () => {
    if (!userInfo?.id) return;
    setIsLoading(true);
    setError("");

    try {
      const [creditData, paymentData] = await Promise.all([
        getStudentCreditHistory(userInfo.id),
        getStudentPaymentHistory(userInfo.id),
      ]);
      setCreditTransactions(creditData);
      setPaymentHistory(paymentData);
    } catch (err) {
      console.error("Fetch history error:", err);
      setError("Có lỗi xảy ra khi tải lịch sử giao dịch");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAmount = (amount: number) => amount.toLocaleString("vi-VN");

  const getTransactionType = (amount: number) =>
    amount > 0 ? "Nạp tiền" : "Chi tiêu";

  const getTransactionColor = (amount: number) =>
    amount > 0 ? "#16a34a" : "#dc2626";

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 8, color: "#64748b" }}>
          Đang tải lịch sử giao dịch...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Credit Balance */}
      <View style={styles.balanceCard}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="card-outline" size={22} color="#16a34a" />
          <Text style={styles.balanceLabel}>Credit hiện tại:</Text>
        </View>
        <Text style={styles.balanceValue}>{userInfo?.credit || 0} credit</Text>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "credit" && styles.tabBtnActive]}
          onPress={() => setActiveTab("credit")}
        >
          <Ionicons
            name="card-outline"
            size={16}
            color={activeTab === "credit" ? "#10b981" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "credit" && styles.tabTextActive,
            ]}
          >
            Credit ({creditTransactions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "payment" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("payment")}
        >
          <Ionicons
            name="cash-outline"
            size={16}
            color={activeTab === "payment" ? "#10b981" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "payment" && styles.tabTextActive,
            ]}
          >
            Thanh toán ({paymentHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        {activeTab === "credit" ? (
          creditTransactions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="card-outline"
                size={40}
                color="#9ca3af"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.emptyText}>Chưa có giao dịch credit nào</Text>
            </View>
          ) : (
            creditTransactions.map((transaction) => (
              <View key={transaction.transactionId} style={styles.itemCard}>
                <View style={styles.itemLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor:
                          transaction.amount > 0 ? "#dcfce7" : "#fee2e2",
                      },
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={18}
                      color={getTransactionColor(transaction.amount)}
                    />
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>
                      {getTransactionType(transaction.amount)}
                    </Text>
                    <Text style={styles.itemDesc}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.itemDate}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text
                    style={[
                      styles.itemAmount,
                      { color: getTransactionColor(transaction.amount) },
                    ]}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {formatAmount(transaction.amount)} credit
                  </Text>
                  <Text style={styles.itemBalance}>
                    Số dư: {formatAmount(transaction.balanceAfter)} credit
                  </Text>
                </View>
              </View>
            ))
          )
        ) : paymentHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="cash-outline"
              size={40}
              color="#9ca3af"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.emptyText}>Chưa có lịch sử thanh toán nào</Text>
          </View>
        ) : (
          paymentHistory.map((payment) => (
            <View
              key={payment.paymentId}
              style={[
                styles.itemCard,
                {
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
            >
              {/* Left side */}
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                {/* Icon */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                    backgroundColor:
                      payment.status === "Completed"
                        ? "#dcfce7"
                        : payment.status === "Failed"
                        ? "#fee2e2"
                        : "#fef9c3",
                  }}
                >
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={
                      payment.status === "Completed"
                        ? "#16a34a"
                        : payment.status === "Failed"
                        ? "#dc2626"
                        : "#ca8a04"
                    }
                  />
                </View>

                {/* Text info */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: "600", color: "#111" }}
                  >
                    {payment.description || "Thanh toán credit"}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#555" }}>
                    Loại:{" "}
                    {payment.paymentType === "Money" ? "Tiền mặt" : "Credit"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {formatDate(payment.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Right side */}
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#111" }}
                >
                  {formatAmount(payment.amount)} VND
                </Text>
                {payment.transactionId && (
                  <Text style={{ fontSize: 12, color: "#888" }}>
                    ID: {payment.transactionId}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },
  backBtn: {
    marginRight: 12,
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  headerSubtitle: { color: "#6b7280", fontSize: 14 },
  balanceCard: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "500",
    color: "#065f46",
  },
  balanceValue: { fontSize: 20, fontWeight: "bold", color: "#064e3b" },
  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 12,
  },
  errorText: { color: "#b91c1c", fontSize: 14 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: "#10b981" },
  tabText: { fontSize: 14, color: "#6b7280", marginLeft: 4 },
  tabTextActive: { color: "#10b981", fontWeight: "600" },
  emptyBox: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#6b7280", fontSize: 14 },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  itemLeft: { flexDirection: "row", gap: 10, flex: 1 },
  iconBox: {
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  itemTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  itemDesc: { fontSize: 13, color: "#6b7280" },
  itemDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  itemRight: { alignItems: "flex-end" },
  itemAmount: { fontSize: 14, fontWeight: "bold", color: "#111827" },
  itemBalance: { fontSize: 12, color: "#6b7280", marginTop: 2 },
});

export default PaymentHistoryScreen;
