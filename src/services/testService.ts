import axiosInstance from "../const/axios/axiosInstance";
import {
  GET_TESTS_BY_USER_URL,
  GET_TEST_BY_LESSON_URL,
  GET_TEST_BY_ID_URL,
} from "../const/apiUrl/baseUrl";
import { TestDto } from "../types/testDto";

// Enums
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

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

// Pagination generic type
export interface Pagination<T> {
  pageIndex: number;
  pageSize: number;
  totalItemsCount: number;
  totalPagesCount: number;
  next: boolean;
  previous: boolean;
  items: T[];
}

export interface GetTestsByUserIdParams {
  userId: string;
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
  testType?: TestType;
  courseLevel?: CourseLevel;
}

/**
 * Get all tests for a user with pagination
 */
export const getAllByUserId = async (
  params: GetTestsByUserIdParams
): Promise<Pagination<TestDto>> => {
  try {
    const {
      userId,
      searchTerm,
      pageIndex = 1,
      pageSize = 10,
      testType,
      courseLevel,
    } = params;

    const queryParams = new URLSearchParams();
    if (searchTerm?.trim()) queryParams.append("searchTerm", searchTerm.trim());
    queryParams.append("pageIndex", pageIndex.toString());
    queryParams.append("pageSize", pageSize.toString());
    if (testType !== undefined)
      queryParams.append("testType", testType.toString());
    if (courseLevel !== undefined)
      queryParams.append("courseLevel", courseLevel.toString());

    const url = `${GET_TESTS_BY_USER_URL(userId)}?${queryParams.toString()}`;
    const response = await axiosInstance.get(url);
    return response.data as Pagination<TestDto>;
  } catch (error) {
    console.error("Failed to get tests by user ID:", error);
    throw error;
  }
};

/**
 * Get a test by lesson ID
 */
export const getByLessonId = async (
  lessonId: string
): Promise<TestDto | null> => {
  try {
    const response = await axiosInstance.get(GET_TEST_BY_LESSON_URL(lessonId));
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Failed to get test by lesson ID:", error);
    throw error;
  }
};

/**
 * Get a test by test ID
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

export default {
  getAllByUserId,
  getByLessonId,
  getByTestId,
};
