import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import dayjs from "dayjs";
import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "../../auth/AuthContext";

// Services
import { getCourseById, CourseDto } from "../../services/courseService";
import { getLessonsByCourseId } from "../../services/lessonService";
import { LessonDto } from "../../types/lessonDto";
import {
  getDocumentsByLessonId,
  DocumentDto,
} from "../../services/documentService";
import { getByLessonId } from "../../services/testService";
import { TestDto } from "../../types/testDto";
import {
  getAllTestAttemptsByUserId,
  TestAttemptDto,
  TestAttemptStatus,
} from "../../services/testAttemptService";
import { getLessonProgressByUserAndLesson } from "../../services/lessonProgressService";

// Components
import { TestInterface } from "../../components/TestInterface";
import { VideoLessonPlayer } from "../../components/VideoLessonPlayer";

type RootStackParamList = {
  LearnCourse: { courseId: string };
};

const LearnCourseScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "LearnCourse">>();
  const { courseId } = route.params;
  const { userInfo, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [videoDoc, setVideoDoc] = useState<DocumentDto | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>(
    {}
  );
  const [lessonTests, setLessonTests] = useState<
    Record<string, TestDto | null>
  >({});
  const [testAttempts, setTestAttempts] = useState<TestAttemptDto[]>([]);
  const [passedTestIds, setPassedTestIds] = useState<Set<string>>(new Set());
  const [currentTest, setCurrentTest] = useState<TestDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const courseExpired = useMemo(
    () =>
      course?.endDate ? dayjs(course.endDate).isBefore(dayjs(), "day") : false,
    [course?.endDate]
  );

  /** Fetch toàn bộ dữ liệu khóa học và bài học */
  const fetchCourseData = useCallback(async () => {
    if (!courseId || authLoading || !userInfo?.id) return;
    setLoading(true);

    try {
      // Lấy thông tin khóa học
      const courseData = await getCourseById(courseId);
      setCourse(courseData);

      // Lấy danh sách bài học (sửa lỗi: dùng .items)
      const lessonResponse = await getLessonsByCourseId(courseId);
      const lessonsData = lessonResponse.items || [];
      setLessons(lessonsData);

      // Chọn bài học đầu tiên mặc định
      if (lessonsData.length > 0) {
        setSelectedLessonId(lessonsData[0].lessonId);
      }

      // Lấy tiến độ bài học
      const progressMap: Record<string, number> = {};
      await Promise.all(
        lessonsData.map(async (lesson) => {
          try {
            const res = await getLessonProgressByUserAndLesson(
              userInfo.id,
              lesson.lessonId
            );
            progressMap[lesson.lessonId] = res?.completionRate || 0;
          } catch {
            progressMap[lesson.lessonId] = 0;
          }
        })
      );
      setLessonProgress(progressMap);

      // Lấy danh sách bài test đã làm
      const attempts = await getAllTestAttemptsByUserId(userInfo.id);
      setTestAttempts(attempts || []);

      // Đánh dấu bài test đã pass
      const passedSet = new Set<string>();
      attempts?.forEach((a) => {
        if (a.status === TestAttemptStatus.Completed && a.isPass) {
          passedSet.add(a.testId);
        }
      });
      setPassedTestIds(passedSet);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setCourse(null);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, authLoading, userInfo?.id]);

  /** Fetch tài nguyên của bài học */
  const fetchLessonResources = useCallback(async () => {
    if (!selectedLessonId) return;

    try {
      const docs = await getDocumentsByLessonId(selectedLessonId);
      setDocuments(docs || []);

      // Lấy video đầu tiên (hỗ trợ URL có querystring và nhiều định dạng)
      const video = docs?.find((d) =>
        /\.(mp4|mov|m3u8|webm)(\?|$)/i.test(d.fileUrl || "")
      );
      setVideoDoc(video || null);

      // Lấy bài test nếu chưa có
      if (!lessonTests[selectedLessonId]) {
        try {
          const test = await getByLessonId(selectedLessonId);
          setLessonTests((prev) => ({
            ...prev,
            [selectedLessonId]: test || null,
          }));
        } catch {
          setLessonTests((prev) => ({ ...prev, [selectedLessonId]: null }));
        }
      }
    } catch (error) {
      console.error("Error fetching lesson resources:", error);
      setDocuments([]);
      setVideoDoc(null);
    }
  }, [selectedLessonId, lessonTests]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  useEffect(() => {
    fetchLessonResources();
  }, [fetchLessonResources]);

  const isLessonCompleted = (lessonId: string) =>
    (lessonProgress[lessonId] || 0) >= 100;
  const isTestPassed = (testId: string) => passedTestIds.has(testId);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Đang tải khóa học...</Text>
      </View>
    );
  }

  if (currentTest) {
    return (
      <TestInterface
        test={currentTest}
        onBack={() => setCurrentTest(null)}
        onTestCompleted={fetchCourseData}
      />
    );
  }

  const selectedLesson = lessons.find((l) => l.lessonId === selectedLessonId);

  return (
    <ScrollView style={styles.container}>
      {courseExpired && (
        <View style={styles.expiredBox}>
          <Text style={styles.expiredTitle}>Khóa học đã hết hạn</Text>
          <Text style={styles.expiredText}>
            Khóa học kết thúc vào {dayjs(course?.endDate).format("DD/MM/YYYY")}
          </Text>
        </View>
      )}

      <Text style={styles.lessonTitle}>{selectedLesson?.title}</Text>

      {videoDoc ? (
        <VideoLessonPlayer
          courseId={courseId}
          lessonId={selectedLessonId!}
          videoUrl={videoDoc.fileUrl}
        />
      ) : (
        <View style={styles.noVideoBox}>
          <Text>Không có video cho bài học này</Text>
        </View>
      )}

      {selectedLesson?.content && (
        <View style={styles.contentBox}>
          <Text>{selectedLesson.content}</Text>
        </View>
      )}

      {documents.filter(
        (d) => !/\.(mp4|mov|m3u8|webm)(\?|$)/i.test(d.fileUrl || "")
      ).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tài liệu</Text>
          {documents
            .filter(
              (d) => !/\.(mp4|mov|m3u8|webm)(\?|$)/i.test(d.fileUrl || "")
            )
            .map((doc, i) => (
              <TouchableOpacity
                key={doc.documentId}
                style={styles.docItem}
                onPress={() => Linking.openURL(doc.fileUrl)}
              >
                <Text>Tài liệu Bài {i + 1}</Text>
                <Text style={styles.docDownload}>Tải</Text>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {/* {selectedLessonId && lessonTests[selectedLessonId] && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bài kiểm tra</Text>
          <TouchableOpacity
            style={[
              styles.testButton,
              {
                backgroundColor: isTestPassed(
                  lessonTests[selectedLessonId]!.testId
                )
                  ? "#4CAF50"
                  : "#2196F3",
              },
            ]}
            onPress={() => setCurrentTest(lessonTests[selectedLessonId]!)}
            disabled={courseExpired}
          >
            <Text style={styles.testButtonText}>
              {courseExpired
                ? "Khóa học hết hạn"
                : isTestPassed(lessonTests[selectedLessonId]!.testId)
                ? "Làm lại bài test"
                : "Làm bài test"}
            </Text>
          </TouchableOpacity>
        </View>
      )} */}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Danh sách bài học</Text>
        {lessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.lessonId}
            style={[
              styles.lessonItem,
              selectedLessonId === lesson.lessonId && styles.selectedLesson,
            ]}
            onPress={() => setSelectedLessonId(lesson.lessonId)}
          >
            <Icon
              name={
                isLessonCompleted(lesson.lessonId) ? "check-circle" : "circle"
              }
              size={20}
              color={isLessonCompleted(lesson.lessonId) ? "#4CAF50" : "#B0BEC5"}
              style={{ marginRight: 8 }}
            />
            <Text>{lesson.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  expiredBox: {
    backgroundColor: "#FFE5E5",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  expiredTitle: { color: "#D32F2F", fontWeight: "bold" },
  expiredText: { color: "#B71C1C" },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 40,
  },
  noVideoBox: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 12,
  },
  contentBox: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: "bold", marginBottom: 6 },
  docItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  docDownload: { color: "#388E3C" },
  testButton: { padding: 12, borderRadius: 6, marginTop: 6 },
  testButtonText: { color: "#FFF", textAlign: "center" },
  lessonItem: {
    padding: 10,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "#FFF",
  },
  selectedLesson: { backgroundColor: "#E0F7FA" },
});

export default LearnCourseScreen;
