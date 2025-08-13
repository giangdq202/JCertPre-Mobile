import axiosInstance from "../const/axios/axiosInstance";
import {
  ENROLLMENT_BASE_URL,
  CHECK_ENROLLMENT_URL,
  ENROLL_COURSE_URL,
  GET_MY_ENROLLMENTS_URL,
  UNENROLL_URL,
} from "../const/apiUrl/baseUrl";

// --- DTOs ---

export interface SelfEnrollmentRequestDto {
  courseId: string;
}

export interface EnrollmentDetailDto {
  enrollmentId: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  courseTitle: string;
  courseDescription: string;
}

export interface CheckEnrollmentStatusResult {
  isEnrolled: boolean;
  message: string;
}

export interface UnenrollmentResult {
  success: boolean;
  message: string;
}

// --- API Functions ---

/**
 * POST /enrollments/enroll-self
 */
export const enrollSelfInCourse = async (
  request: SelfEnrollmentRequestDto
): Promise<EnrollmentDetailDto> => {
  try {
    const response = await axiosInstance.post<EnrollmentDetailDto>(
      ENROLL_COURSE_URL,
      request
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tự ghi danh vào khóa học:", error);
    throw error;
  }
};

/**
 * GET /enrollments/check/{courseId}
 */
export const checkEnrollmentStatus = async (
  courseId: string
): Promise<CheckEnrollmentStatusResult> => {
  try {
    const response = await axiosInstance.get<CheckEnrollmentStatusResult>(
      CHECK_ENROLLMENT_URL(courseId)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Lỗi khi kiểm tra trạng thái ghi danh khóa học ${courseId}:`,
      error
    );
    throw error;
  }
};

/**
 * GET /enrollments/my-enrollments
 */
export const getMyEnrollments = async (): Promise<EnrollmentDetailDto[]> => {
  try {
    const response = await axiosInstance.get<EnrollmentDetailDto[]>(
      GET_MY_ENROLLMENTS_URL
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy các ghi danh của tôi:", error);
    throw error;
  }
};

/**
 * DELETE /enrollments/unenroll/{courseId}
 */
export const unenrollFromCourse = async (
  courseId: string
): Promise<UnenrollmentResult> => {
  try {
    const response = await axiosInstance.delete<UnenrollmentResult>(
      UNENROLL_URL(courseId)
    );
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi hủy ghi danh khỏi khóa học ${courseId}:`, error);
    throw error;
  }
};
