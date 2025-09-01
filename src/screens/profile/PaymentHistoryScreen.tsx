import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import colors from "../../styles/colors";
import { useAuth } from "../../auth/AuthContext";
import {
  getStudentCreditHistory,
  getStudentPaymentHistory,
} from "../../services/paymentService";
import {
  CreditTransactionItem,
  PaymentHistoryItem,
} from "../../navigation/types";

const PaymentHistoryScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();

  const [creditTransactions, setCreditTransactions] = useState<
    CreditTransactionItem[]
  >([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"credit" | "payment">("credit");
  const [selectedTransaction, setSelectedTransaction] = useState<
    CreditTransactionItem | PaymentHistoryItem | null
  >(null);

  useEffect(() => {
    if (userInfo?.id) fetchHistory();
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
    amount > 0 ? colors.success : colors.danger;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 8, color: colors.gray }}>
          Đang tải lịch sử giao dịch...
        </Text>
      </View>
    );
  }

  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedTransaction}
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chi tiết giao dịch</Text>

            {"transactionId" in selectedTransaction && (
              <>
                {/* <Text>ID: {selectedTransaction.transactionId}</Text> */}
                <Text>Mô tả: {selectedTransaction.description}</Text>
                <Text>
                  Số tiền: {formatAmount(selectedTransaction.amount)}{" "}
                  {activeTab === "credit" ? "credit" : "VND"}
                </Text>
                {"balanceAfter" in selectedTransaction && (
                  <Text>
                    Số dư sau giao dịch:{" "}
                    {formatAmount(selectedTransaction.balanceAfter)} credit
                  </Text>
                )}
                <Text>
                  Ngày giao dịch: {formatDate(selectedTransaction.createdAt)}
                </Text>
              </>
            )}

            {"paymentId" in selectedTransaction && (
              <>
                <Text>
                  Loại:{" "}
                  {selectedTransaction.paymentType === "Money"
                    ? "Tiền mặt"
                    : "Credit"}
                </Text>
              </>
            )}

            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setSelectedTransaction(null)}
            >
              <Text style={{ color: "white" }}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
      </View>

      {/* Credit Balance */}
      <View style={styles.balanceCard}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="card-outline" size={20} color={colors.primary} />
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
            color={activeTab === "credit" ? colors.primary : colors.darkGray}
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
            color={activeTab === "payment" ? colors.primary : colors.darkGray}
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
                color={colors.gray}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.emptyText}>Chưa có giao dịch credit nào</Text>
            </View>
          ) : (
            creditTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.transactionId}
                style={styles.itemCard}
                onPress={() => setSelectedTransaction(transaction)}
              >
                <View style={styles.itemLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor:
                          transaction.amount > 0
                            ? colors.background
                            : colors.danger + "33",
                      },
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={18}
                      color={getTransactionColor(transaction.amount)}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.itemTitle}>
                      {getTransactionType(transaction.amount)}
                    </Text>
                    <Text
                      style={styles.itemDesc}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {transaction.description}
                    </Text>
                    <Text style={styles.itemDateHighlighted}>
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
              </TouchableOpacity>
            ))
          )
        ) : paymentHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="cash-outline"
              size={40}
              color={colors.gray}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.emptyText}>Chưa có lịch sử thanh toán nào</Text>
          </View>
        ) : (
          paymentHistory.map((payment) => (
            <TouchableOpacity
              key={payment.paymentId}
              style={styles.itemCard}
              onPress={() => setSelectedTransaction(payment)}
            >
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        payment.status === "Completed"
                          ? colors.background
                          : payment.status === "Failed"
                          ? colors.danger + "33"
                          : colors.warning + "33",
                    },
                  ]}
                >
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={
                      payment.status === "Completed"
                        ? colors.success
                        : payment.status === "Failed"
                        ? colors.danger
                        : colors.warning
                    }
                  />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {payment.description || "Thanh toán credit"}
                  </Text>
                  <Text style={styles.itemDesc}>
                    Loại:{" "}
                    {payment.paymentType === "Money" ? "Tiền mặt" : "Credit"}
                  </Text>
                  <Text style={styles.itemDateHighlighted}>
                    {formatDate(payment.createdAt)}
                  </Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemAmount}>
                  {formatAmount(payment.amount)} VND
                </Text>
                {payment.transactionId && (
                  <Text style={styles.itemBalance}>
                    ID: {payment.transactionId}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {renderTransactionDetails()}
    </View>
  );
};

export default PaymentHistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 50,
  },
  backBtn: {
    marginRight: 12,
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: colors.darkGray },
  balanceCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "500",
    color: colors.success,
  },
  balanceValue: { fontSize: 20, fontWeight: "bold", color: colors.primary },
  errorBox: {
    backgroundColor: colors.danger + "33",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 14 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.darkGray, marginLeft: 4 },
  tabTextActive: { color: colors.primary, fontWeight: "600" },
  emptyBox: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: colors.gray, fontSize: 14 },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  itemLeft: { flexDirection: "row", flex: 1 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  itemTitle: { fontSize: 15, fontWeight: "600", color: colors.darkGray },
  itemDesc: { fontSize: 13, color: colors.gray },
  itemDateHighlighted: { fontSize: 12, color: colors.primary, marginTop: 2 },
  itemRight: { alignItems: "flex-end" },
  itemAmount: { fontSize: 14, fontWeight: "bold", color: colors.darkGray },
  itemBalance: { fontSize: 12, color: colors.gray, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.darkGray,
  },
  modalCloseBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
