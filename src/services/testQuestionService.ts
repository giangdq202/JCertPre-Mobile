import axiosInstance from "../const/axios/axiosInstance";
import { GET_QUESTIONS_FROM_TEST_URL } from "../const/apiUrl/baseUrl";

export interface AddTestQuestionManualDto {
  TestId: string;
  QuestionId: string;
}

export interface TestQuestionDto {
  testQuestionId: string;
  testId: string;
  questionId: string;
  questionNumber: number;
  partNumber?: number;
  partDurationMinutes?: number;
}

/**
 * Get all questions from a test (student use only, no paging)
 * @param testId - The test ID
 * @returns Promise<TestQuestionDto[]>
 */
export const getQuestionsByTestId = async (
  testId: string
): Promise<TestQuestionDto[]> => {
  try {
    const response = await axiosInstance.get(
      GET_QUESTIONS_FROM_TEST_URL(testId)
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get questions by test ID:", error);
    throw error;
  }
};

export default {
  getQuestionsByTestId,
};
