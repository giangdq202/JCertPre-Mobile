import axiosInstance from "../const/axios/axiosInstance";
import {
  GET_TEST_BY_LESSON_URL,
  GET_TEST_BY_ID_URL,
} from "../const/apiUrl/baseUrl";

export enum TestType {
  JLPTAuto = 0,
  EntryAuto = 1,
  CustomManual = 2,
  CustomAuto = 3,
}

export enum TestStatus {
  Open = 0,
  Close = 1,
}

export interface TestDto {
  testId: string;
  title: string;
  description?: string;
  testType: TestType;
  durationMinutes: number;
  lessonId?: string;
  status: TestStatus;
}

/**
 * Lấy test của lesson (student chỉ xem được)
 * @param lessonId - ID bài học
 * @returns Promise<TestDto | null>
 */
export const getByLessonId = async (
  lessonId: string
): Promise<TestDto | null> => {
  try {
    const response = await axiosInstance.get(GET_TEST_BY_LESSON_URL(lessonId));
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Không có test cho lesson này
    }
    console.error("Failed to get test by lesson ID:", error);
    throw error;
  }
};

/**
 * Lấy test theo testId (student chỉ xem được)
 * @param testId - ID bài test
 * @returns Promise<TestDto | null>
 */
export const getByTestId = async (testId: string): Promise<TestDto | null> => {
  try {
    const response = await axiosInstance.get(GET_TEST_BY_ID_URL(testId));
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Failed to get test by test ID:", error);
    throw error;
  }
};
