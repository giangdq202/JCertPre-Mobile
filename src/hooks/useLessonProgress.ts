import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../auth/AuthContext";
import {
  getLessonProgressByUserAndCourse,
  getLessonProgressByUserAndLesson,
  createLessonProgress,
  updateLessonProgress,
  deleteLessonProgress,
  getUserCourseCompletionRate,
  isLessonCompleted,
  markLessonAsCompleted,
  updateLessonProgressRate,
  LessonProgressDto,
} from "../services/lessonProgressService";

import {
  hasUserPassedTest,
  getUserPassedTestIds,
  canUserProceedToNextLesson,
  getTestCompletionSummary,
} from "../services/testCompletionService";

export const useLessonProgress = () => {
  const { userInfo, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Wrapper gọi API, xử lý loading và lỗi */
  const callApi = useCallback(
    async <T>(apiCall: () => Promise<T>, defaultMsg: string): Promise<T> => {
      if (!userInfo?.id && !authLoading)
        throw new Error("User not authenticated");
      setLoading(true);
      try {
        const result = await apiCall();
        setError(null);
        return result;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err.message || defaultMsg;
        setError(msg);
        Alert.alert("Lỗi", msg);
        console.error(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userInfo?.id, authLoading]
  );

  // ===== Lesson Progress Handlers =====

  const getProgressByUserAndCourseHandler = useCallback(
    (courseId: string) =>
      callApi(
        () => getLessonProgressByUserAndCourse(userInfo!.id, courseId),
        "Không thể lấy tiến độ khóa học"
      ),
    [callApi, userInfo?.id]
  );

  const getProgressByUserAndLessonHandler = useCallback(
    (lessonId: string) =>
      callApi(
        () => getLessonProgressByUserAndLesson(userInfo!.id, lessonId),
        "Không thể lấy tiến độ bài học"
      ),
    [callApi, userInfo?.id]
  );

  const createProgressHandler = useCallback(
    (lessonId: string, courseId?: string) =>
      callApi(
        () =>
          createLessonProgress(
            { userId: userInfo!.id, lessonId, courseId: courseId! },
            0
          ),
        "Không thể tạo tiến độ bài học"
      ),
    [callApi, userInfo?.id]
  );

  const updateProgressHandler = useCallback(
    (progressId: string, completionRate: number) =>
      callApi(
        () => updateLessonProgress(progressId, { completionRate }),
        "Không thể cập nhật tiến độ"
      ),
    [callApi]
  );

  const deleteProgressHandler = useCallback(
    (progressId: string) =>
      callApi(() => deleteLessonProgress(progressId), "Không thể xóa tiến độ"),
    [callApi]
  );

  const getCourseCompletionRateHandler = useCallback(
    (courseId: string) =>
      callApi(
        () => getUserCourseCompletionRate(userInfo!.id, courseId),
        "Không thể lấy tỉ lệ hoàn thành khóa học"
      ),
    [callApi, userInfo?.id]
  );

  const checkLessonCompletedHandler = useCallback(
    (lessonId: string) =>
      callApi(
        () => isLessonCompleted(userInfo!.id, lessonId),
        "Không thể kiểm tra bài học hoàn thành"
      ),
    [callApi, userInfo?.id]
  );

  const markLessonCompletedHandler = useCallback(
    (lessonId: string, courseId?: string) =>
      callApi(
        () => markLessonAsCompleted(userInfo!.id, lessonId, courseId),
        "Không thể đánh dấu bài học hoàn thành"
      ),
    [callApi, userInfo?.id]
  );

  const updateLessonProgressRateHandler = useCallback(
    (lessonId: string, completionRate: number, courseId?: string) =>
      callApi(
        () =>
          updateLessonProgressRate(
            userInfo!.id,
            lessonId,
            completionRate,
            courseId
          ),
        "Không thể cập nhật tỉ lệ tiến độ bài học"
      ),
    [callApi, userInfo?.id]
  );

  // ===== Test Handlers =====

  const checkTestPassedHandler = useCallback(
    (testId: string) =>
      callApi(
        () => hasUserPassedTest(userInfo!.id, testId),
        "Không thể kiểm tra kết quả test"
      ),
    [callApi, userInfo?.id]
  );

  const getPassedTestIdsHandler = useCallback(
    () =>
      callApi(
        () => getUserPassedTestIds(userInfo!.id),
        "Không thể lấy danh sách test đã hoàn thành"
      ),
    [callApi, userInfo?.id]
  );

  const checkCanProceedToNextLessonHandler = useCallback(
    (testId?: string) =>
      callApi(
        () => canUserProceedToNextLesson(userInfo!.id, testId),
        "Không thể kiểm tra tiến trình bài học tiếp theo"
      ),
    [callApi, userInfo?.id]
  );

  const getTestCompletionSummaryHandler = useCallback(
    (testIds: string[]) =>
      callApi(
        () => getTestCompletionSummary(userInfo!.id, testIds),
        "Không thể lấy thông tin hoàn thành test"
      ),
    [callApi, userInfo?.id]
  );

  return {
    loading,
    error,
    // Lesson
    getProgressByUserAndCourse: getProgressByUserAndCourseHandler,
    getProgressByUserAndLesson: getProgressByUserAndLessonHandler,
    createProgress: createProgressHandler,
    updateProgress: updateProgressHandler,
    deleteProgress: deleteProgressHandler,
    getCourseCompletionRate: getCourseCompletionRateHandler,
    checkLessonCompleted: checkLessonCompletedHandler,
    markLessonCompleted: markLessonCompletedHandler,
    updateLessonProgressRate: updateLessonProgressRateHandler,
    // Test
    checkTestPassed: checkTestPassedHandler,
    getPassedTestIds: getPassedTestIdsHandler,
    checkCanProceedToNextLesson: checkCanProceedToNextLessonHandler,
    getTestCompletionSummary: getTestCompletionSummaryHandler,
  };
};
