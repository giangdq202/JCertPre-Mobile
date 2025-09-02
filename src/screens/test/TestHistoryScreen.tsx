import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "../../auth/AuthContext";
import {
  getAllTestAttemptsByUserId,
  getTestAttemptWithScoreSummary,
  TestAttemptDto,
  TestAttemptWithScoreSummary,
} from "../../services/testAttemptService";

type RootStackParamList = {
  TestHistory: {
    testTemplateTypeId: string;
    testTemplateTypeName: string;
  };
};

const TestHistoryScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "TestHistory">>();
  const navigation = useNavigation();
  const { testTemplateTypeId, testTemplateTypeName } = route.params;
  const { userInfo } = useAuth();

  const [attempts, setAttempts] = useState<TestAttemptWithScoreSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    if (!userInfo?.id) return;

    try {
      setLoading(true);
      const allAttempts = await getAllTestAttemptsByUserId(userInfo.id);

      // lọc attempt đúng testId
      const filteredAttempts = allAttempts.filter(
        (attempt) => attempt.testId === testTemplateTypeId
      );

      // gọi thêm API lấy score cho từng attempt
      const attemptsWithScore = await Promise.all(
        filteredAttempts.map(async (a) => {
          try {
            const detail = await getTestAttemptWithScoreSummary(a.attemptId);
            return detail;
          } catch {
            return {
              attempt: a,
              scoreSummary: null,
            } as unknown as TestAttemptWithScoreSummary;
          }
        })
      );

      setAttempts(attemptsWithScore);
    } catch (error) {
      // console.error("Error loading test history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (isPass?: boolean) => {
    return isPass ? "#10B981" : "#EF4444";
  };

  const getStatusText = (isPass?: boolean) => {
    return isPass ? "ĐẠT" : "KHÔNG ĐẠT";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử bài thi</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.testTitle}>{testTemplateTypeName}</Text>

        {attempts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="file-text" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Chưa có lịch sử bài thi</Text>
          </View>
        ) : (
          <ScrollView style={styles.attemptsList}>
            {attempts.map(({ attempt, scoreSummary }) => (
              <View key={attempt.attemptId} style={styles.attemptCard}>
                <View style={styles.attemptHeader}>
                  <Text style={styles.attemptNumber}>
                    Lần thi {attempt.attemptNumber}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(attempt.isPass) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(attempt.isPass) },
                      ]}
                    >
                      {getStatusText(attempt.isPass)}
                    </Text>
                  </View>
                </View>

                <View style={styles.attemptDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {formatDate(attempt.startTime)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Icon name="clock" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      Thời gian làm bài:{" "}
                      {Math.round(
                        (new Date(attempt.endTime).getTime() -
                          new Date(attempt.startTime).getTime()) /
                          60000
                      )}{" "}
                      phút
                    </Text>
                  </View>

                  {scoreSummary && (
                    <View style={styles.detailRow}>
                      <Icon name="award" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>
                        Điểm: {scoreSummary.total_score}/
                        {scoreSummary.total_max_score}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#6B7280" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  content: { flex: 1, padding: 20 },
  testTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 16, fontSize: 16, color: "#6B7280" },
  attemptsList: { flex: 1 },
  attemptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attemptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  attemptNumber: { fontSize: 16, fontWeight: "600", color: "#111827" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "500" },
  attemptDetails: { gap: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 14, color: "#6B7280" },
});

export default TestHistoryScreen;
