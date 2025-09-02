import axiosInstance from "../const/axios/axiosInstance";
import {
  GET_TESTS_BY_USER_URL,
  GET_TEST_BY_LESSON_URL,
  GET_TEST_BY_ID_URL,
  AUTO_CREATE_TEST_URL,
  TEST_BASE_URL,
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

// Interfaces
export interface CreateAutoTestInput {
  testType: TestType;
  courseLevel: CourseLevel;
}

export interface CreateAutoTestResult {
  testId: string;
  title?: string;
  description?: string;
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
 * Create test from template (alternative approach)
 */
export const createTestFromTemplate = async (
  templateId: string,
  userId: string,
  testType: TestType,
  courseLevel: CourseLevel
): Promise<CreateAutoTestResult> => {
  try {
    const url = `${TEST_BASE_URL}/create-from-template`;
    const payload = {
      templateId,
      userId,
      testType,
      courseLevel,
    };

    if (__DEV__) {
      console.log("Creating test from template with URL:", url);
      console.log("Payload:", payload);
    }

    const response = await axiosInstance.post(url, payload);

    if (__DEV__) {
      console.log("Test from template creation response:", response.data);
    }

    return response.data;
  } catch (error: any) {
    if (__DEV__) {
      console.log("Failed to create test from template:", error);
      if (error.response) {
        console.log("Response status:", error.response.status);
        console.log("Response data:", error.response.data);
      }
    }
    throw error;
  }
};

/**
 * Create auto test
 */
export const createAutoTest = async (
  input: CreateAutoTestInput,
  userId: string
): Promise<CreateAutoTestResult> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("userId", userId);
    queryParams.append("testType", input.testType.toString());
    queryParams.append("courseLevel", input.courseLevel.toString());

    const url = `${TEST_BASE_URL}/auto-create?${queryParams.toString()}`;

    if (__DEV__) {
      console.log("Creating auto test with URL:", url);
      console.log("Input:", input);
    }

    // Try POST first
    let response;
    try {
      response = await axiosInstance.post(url, {});
    } catch (postError: any) {
      if (__DEV__) {
        console.log("POST failed, trying GET:", postError.response?.status);
      }
      // If POST fails with 405, try GET
      if (postError.response?.status === 405) {
        response = await axiosInstance.get(url);
      } else {
        throw postError;
      }
    }

    if (__DEV__) {
      console.log("Auto test creation response:", response.data);
    }

    return response.data;
  } catch (error: any) {
    if (__DEV__) {
      console.log("Failed to create auto test:", error);
      if (error.response) {
        console.log("Response status:", error.response.status);
        console.log("Response data:", error.response.data);
        console.log("Response headers:", error.response.headers);
      }
    }
    throw error;
  }
};

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
    // console.error("Failed to get tests by user ID:", error);
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
    // console.error("Failed to get test by lesson ID:", error);
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
    // console.error("Failed to get test by test ID:", error);
    throw error;
  }
};

export default {
  createAutoTest,
  createTestFromTemplate,
  getAllByUserId,
  getByLessonId,
  getByTestId,
};
