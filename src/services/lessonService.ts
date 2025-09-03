import { Pagination } from "../types/pagination";
import { LessonDto } from "../types/lessonDto";
import axiosInstance from "../const/axios/axiosInstance";
import { GET_LESSONS_BY_COURSE_URL } from "../const/apiUrl/baseUrl";

/**
 * Lấy danh sách bài học theo ID khóa học (có phân trang)
 */
export async function getLessonsByCourseId(
  courseId: string,
  searchTerm?: string,
  pageIndex: number = 1,
  pageSize: number = 10
): Promise<Pagination<LessonDto>> {
  try {
    const url = GET_LESSONS_BY_COURSE_URL(courseId);
    console.log("🔍 Fetching lessons from:", url);
    const response = await axiosInstance.get<Pagination<LessonDto>>(
      url,
      {
        params: {
          searchTerm,
          pageIndex,
          pageSize,
        },
      }
    );

    console.log("📚 API /lessons/by-course response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getLessonsByCourseId error:", error);
    throw error;
  }
}

/**
 * Lấy chi tiết bài học theo ID
 */
export async function getLessonById(lessonId: string): Promise<LessonDto> {
  try {
    const response = await axiosInstance.get<LessonDto>(`/lessons/${lessonId}`);
    console.log("API /lessons/:id response:", response.data);

    if (!response.data) throw new Error(`Không tìm thấy bài học ${lessonId}`);
    return response.data;
  } catch (error) {
    console.error("getLessonById error:", error);
    throw error;
  }
}
