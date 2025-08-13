import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getStudentPaymentHistory } from "../../services/paymentService";
import { useAuth } from "../../auth/AuthContext";
import { PaymentHistoryItem } from "../../navigation/types";

const PaymentHistoryScreen = () => {
  const { userInfo } = useAuth();
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!userInfo) return;
    setLoading(true);
    try {
      const data = await getStudentPaymentHistory(userInfo.id);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: PaymentHistoryItem }) => (
    <View style={styles.item}>
      <Text>{item.method}</Text>
      <Text>{item.amount}</Text>
      <Text>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#10b981" />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử thanh toán</Text>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0fdf4" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
});

export default PaymentHistoryScreen;
