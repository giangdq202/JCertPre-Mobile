import axiosInstance from "../const/axios/axiosInstance";
import {
  LessonProgressDto,
  CreateLessonProgressDto,
  UpdateLessonProgressDto,
  CreateLessonProgressWithCourseDto,
  validateLessonProgressCreateDto,
  validateLessonProgressUpdateDto,
} from "../types/lessonProgressDto";

// --- Export type ---
export type { LessonProgressDto };

// --- API URLs ---
const GET_PROGRESS_BY_USER_COURSE = "/lesson-progress/by-user-course";
const GET_PROGRESS_BY_USER_LESSON = "/lesson-progress/by-user-lesson";
const CREATE_PROGRESS = "/lesson-progress";
const UPDATE_PROGRESS = (progressId: string) =>
  `/lesson-progress/${progressId}`;
const DELETE_PROGRESS = (progressId: string) =>
  `/lesson-progress/${progressId}`;
const GET_COMPLETION_RATE = "/lesson-progress/completion-rate";

// --- Helper ---
const clampRate = (rate: number) => Math.max(0, Math.min(100, rate));

// --- API Functions ---

/** Lấy tất cả progress của user theo course */
export const getLessonProgressByUserAndCourse = async (
  userId: string,
  courseId: string
): Promise<LessonProgressDto[]> => {
  const { data } = await axiosInstance.get<LessonProgressDto[]>(
    GET_PROGRESS_BY_USER_COURSE,
    { params: { userId, courseId } }
  );
  return data;
};

/** Lấy progress của user theo lesson, trả về null nếu chưa có */
export const getLessonProgressByUserAndLesson = async (
  userId: string,
  lessonId: string
): Promise<LessonProgressDto | null> => {
  try {
    const { data } = await axiosInstance.get<LessonProgressDto>(
      GET_PROGRESS_BY_USER_LESSON,
      { params: { userId, lessonId } }
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

/** Tạo mới progress */
export const createLessonProgress = async (
  dto: CreateLessonProgressDto | CreateLessonProgressWithCourseDto,
  completionRate: number = 0
): Promise<LessonProgressDto> => {
  const validation = validateLessonProgressCreateDto(dto);
  if (!validation.isValid) throw new Error(validation.message);

  const { data } = await axiosInstance.post<LessonProgressDto>(
    CREATE_PROGRESS,
    {
      ...dto,
      completionRate: clampRate(completionRate),
    }
  );
  return data;
};

/** Cập nhật progress hiện có */
export const updateLessonProgress = async (
  progressId: string,
  dto: UpdateLessonProgressDto
): Promise<LessonProgressDto> => {
  const validation = validateLessonProgressUpdateDto(dto);
  if (!validation.isValid) throw new Error(validation.message);

  const { data } = await axiosInstance.put<LessonProgressDto>(
    UPDATE_PROGRESS(progressId),
    dto
  );
  return data;
};

/** Xóa progress */
export const deleteLessonProgress = async (
  progressId: string
): Promise<void> => {
  try {
    await axiosInstance.delete(DELETE_PROGRESS(progressId));
  } catch (error) {
    console.error(
      `DeleteLessonProgress API error for ID ${progressId}:`,
      error
    );
    throw error;
  }
};

/** Lấy completion rate của user cho course */
export const getUserCourseCompletionRate = async (
  userId: string,
  courseId: string
): Promise<number> => {
  const { data } = await axiosInstance.get<number>(GET_COMPLETION_RATE, {
    params: { userId, courseId },
  });
  return data;
};

// --- Helper Functions ---

/** Kiểm tra lesson đã hoàn thành chưa */
export const isLessonCompleted = async (
  userId: string,
  lessonId: string
): Promise<boolean> => {
  const progress = await getLessonProgressByUserAndLesson(userId, lessonId);
  return progress !== null && progress.completionRate >= 100;
};

/** Đánh dấu lesson hoàn thành 100% */
export const markLessonAsCompleted = async (
  userId: string,
  lessonId: string,
  courseId?: string
): Promise<LessonProgressDto> => {
  const existing = await getLessonProgressByUserAndLesson(userId, lessonId);
  if (existing)
    return await updateLessonProgress(existing.progressId, {
      completionRate: 100,
    });

  const dto: CreateLessonProgressWithCourseDto = {
    userId,
    lessonId,
    courseId: courseId!,
  };
  return await createLessonProgress(dto, 100);
};

/** Cập nhật tiến độ lesson theo % */
export const updateLessonProgressRate = async (
  userId: string,
  lessonId: string,
  completionRate: number,
  courseId?: string
): Promise<LessonProgressDto> => {
  const rate = clampRate(completionRate);
  const existing = await getLessonProgressByUserAndLesson(userId, lessonId);

  if (existing)
    return await updateLessonProgress(existing.progressId, {
      completionRate: rate,
    });

  const dto: CreateLessonProgressWithCourseDto = {
    userId,
    lessonId,
    courseId: courseId!,
  };
  return await createLessonProgress(dto, rate);
};
