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

// Helper: nhận diện video từ url
const isVideoFile = (url?: string) => {
  if (!url) return false;
  return (
    /\.(mp4|mov|m3u8|webm)(\?|$)/i.test(url) ||
    url.includes("youtube.com") ||
    url.includes("vimeo.com")
  );
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

  /** Fetch toàn bộ dữ liệu khóa học */
  const fetchCourseData = useCallback(async () => {
    if (!courseId || authLoading || !userInfo?.id) return;
    setLoading(true);

    try {
      const courseData = await getCourseById(courseId);
      setCourse(courseData);

      const lessonResponse = await getLessonsByCourseId(courseId);
      const lessonsData = Array.isArray(lessonResponse?.items)
        ? lessonResponse.items
        : [];
      setLessons(lessonsData);

      if (lessonsData.length > 0) {
        setSelectedLessonId(lessonsData[0].lessonId);
      }

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

      const attempts = await getAllTestAttemptsByUserId(userInfo.id);
      setTestAttempts(attempts || []);

      const passedSet = new Set<string>();
      attempts?.forEach((a) => {
        if (a.status === TestAttemptStatus.Completed && a.isPass) {
          passedSet.add(a.testId);
        }
      });
      setPassedTestIds(passedSet);
    } catch (error) {
      console.error("❌ Error fetching course data:", error);
      setCourse(null);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, authLoading, userInfo?.id]);

  /** Fetch tài nguyên bài học */
  const fetchLessonResources = useCallback(async () => {
    if (!selectedLessonId) return;
    try {
      const docs = await getDocumentsByLessonId(selectedLessonId);
      setDocuments(docs || []);

      const video = docs?.find((d) => isVideoFile(d.fileUrl));
      setVideoDoc(video || null);

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
      console.error("❌ Error fetching lesson resources:", error);
      setDocuments([]);
      setVideoDoc(null);
    }
  }, [selectedLessonId]);

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

      {/* Debug chỉ hiển thị khi dev */}
      {/* {__DEV__ && (
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>🔍 Debug Info:</Text>
          <Text style={styles.debugText}>
            Selected Lesson ID: {selectedLessonId}
          </Text>
          <Text style={styles.debugText}>
            Video Doc: {videoDoc ? "Found" : "Not found"}
          </Text>
          <Text style={styles.debugText}>
            Documents Count: {documents.length}
          </Text>
          {videoDoc && (
            <Text style={styles.debugText}>Video URL: {videoDoc.fileUrl}</Text>
          )}
        </View>
      )} */}

      {/* {videoDoc ? (
        <VideoLessonPlayer
          courseId={courseId}
          lessonId={selectedLessonId!}
          videoUrl={videoDoc.fileUrl}
        />
      ) : (
        <View style={styles.noVideoBox}>
          <Text style={styles.noVideoText}>Không có video cho bài học này</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchLessonResources}
          ></TouchableOpacity> */}

      {/* 
          // Demo video 
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => {
              const demoVideo = {
                documentId: "demo-video",
                lessonId: selectedLessonId!,
                documentName: "Video Demo",
                fileUrl:
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                uploadedAt: new Date().toISOString(),
              };
              setVideoDoc(demoVideo);
            }}
          >
            <Text style={styles.demoButtonText}>🎬 Xem video demo</Text>
          </TouchableOpacity>
          */}
      {/* </View>
      )} */}

      {selectedLesson?.content && (
        <View style={styles.contentBox}>
          <Text>{selectedLesson.content}</Text>
        </View>
      )}

      {documents.filter((d) => !isVideoFile(d.fileUrl)).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tài liệu</Text>
          {documents
            .filter((d) => !isVideoFile(d.fileUrl))
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
  debugBox: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFEAA7",
  },
  debugText: {
    fontSize: 12,
    color: "#856404",
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  noVideoText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  demoButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  demoButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default LearnCourseScreen;
