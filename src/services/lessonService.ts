import axiosInstance from "../const/axios/axiosInstance";
export type Lesson = {
  lessonId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  courseId: string;
};

/**
 * Lấy danh sách lesson của một khóa học (STUDENT role)
 * @param courseId ID của khóa học
 * @param searchTerm Tùy chọn, tìm kiếm theo tên lesson
 * @returns Mảng các lesson
 */
export const getLessonsByCourseId = async (
  courseId: string,
  searchTerm?: string
): Promise<Lesson[]> => {
  try {
    const response = await axiosInstance.get<Lesson[]>(
      `/lessons/by-course/${courseId}`,
      { params: { searchTerm } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching lessons for course ${courseId}:`, error);
    throw error;
  }
};
