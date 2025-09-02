import axiosInstance from "../const/axios/axiosInstance";
import {
  START_TEST_ATTEMPT_URL,
  SUBMIT_TEST_ATTEMPT_URL,
  GET_TEST_ATTEMPTS_BY_USER_URL,
  GET_TEST_ATTEMPT_WITH_SCORE_URL,
  ADD_OR_UPDATE_ATTEMPT_ANSWERS_URL,
  GET_ATTEMPT_ANSWERS_URL,
} from "../const/apiUrl/baseUrl";

/** ------------------ TYPES ------------------ */
export enum TestAttemptStatus {
  InProgress = 0,
  Completed = 1,
  Suspended = 2,
}

export interface StartTestAttemptDto {
  testId: string;
  userId: string;
}

export interface SubmitTestAttemptDto {
  attemptId: string;
}

export interface TestAttemptDto {
  attemptId: string;
  userId: string;
  testId: string;
  attemptNumber: number;
  status: TestAttemptStatus;
  startTime: string;
  endTime: string;
  isPass?: boolean;
}

export interface TestScoreSummary {
  testScoreSummaryId: string;
  testId: string;
  testAttemptId?: string;
  kanji_score: number;
  vocab_score: number;
  grammar_score: number;
  reading_score: number;
  listening_score: number;
  kanji_max_score: number;
  vocab_max_score: number;
  grammar_max_score: number;
  reading_max_score: number;
  listening_max_score: number;
  total_score: number;
  total_max_score: number;
  percentage_score: number;
  passing_percentage: number;
}

export interface TestAttemptWithScoreSummary {
  attempt: TestAttemptDto;
  scoreSummary: TestScoreSummary;
}

/** ------------------ Attempt Answer TYPES ------------------ */
export interface AttemptAnswerDto {
  attemptId: string;
  questionId: string;
  choiceId?: string;
  textAnswer?: string;
}

export interface AddOrUpdateAttemptAnswerDto {
  attemptId: string;
  questionId: string;
  choiceId?: string;
  textAnswer?: string;
}

/** ------------------ TEST ATTEMPT API ------------------ */

/**
 * Bắt đầu làm bài kiểm tra
 */
export const startTestAttempt = async (
  dto: StartTestAttemptDto
): Promise<TestAttemptDto> => {
  if (!dto.testId || !dto.userId)
    throw new Error("Validation failed: testId and userId are required");

  try {
    const response = await axiosInstance.post<TestAttemptDto>(
      START_TEST_ATTEMPT_URL,
      dto
    );
    return response.data;
  } catch (error) {
    console.error("Failed to start test attempt:", error);
    throw error;
  }
};

/**
 * Nộp bài kiểm tra
 */
export const submitTestAttempt = async (
  dto: SubmitTestAttemptDto
): Promise<TestAttemptDto> => {
  if (!dto.attemptId)
    throw new Error("Validation failed: attemptId is required");

  try {
    const response = await axiosInstance.post<TestAttemptDto>(
      SUBMIT_TEST_ATTEMPT_URL,
      dto
    );
    return response.data;
  } catch (error) {
    console.error("Failed to submit test attempt:", error);
    throw error;
  }
};

/**
 * Lấy tất cả attempt của user
 */
export const getAllTestAttemptsByUserId = async (
  userId: string
): Promise<TestAttemptDto[]> => {
  try {
    const response = await axiosInstance.get<TestAttemptDto[]>(
      GET_TEST_ATTEMPTS_BY_USER_URL(userId)
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get test attempts by user ID:", error);
    throw error;
  }
};

/**
 * Lấy attempt kèm điểm
 */
export const getTestAttemptWithScoreSummary = async (
  attemptId: string
): Promise<TestAttemptWithScoreSummary> => {
  try {
    const response = await axiosInstance.get<TestAttemptWithScoreSummary>(
      GET_TEST_ATTEMPT_WITH_SCORE_URL(attemptId)
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get test attempt with score summary:", error);
    throw error;
  }
};

/** ------------------ ATTEMPT ANSWER API ------------------ */

/**
 * Thêm hoặc cập nhật 1 answer
 */
export const addOrUpdateAttemptAnswer = async (
  dto: AddOrUpdateAttemptAnswerDto
): Promise<AttemptAnswerDto> => {
  try {
    const { data } = await axiosInstance.post<AttemptAnswerDto[]>(
      ADD_OR_UPDATE_ATTEMPT_ANSWERS_URL,
      [dto] // backend nhận mảng
    );
    return data[0];
  } catch (error) {
    console.error("Failed to add or update attempt answer:", error);
    throw error;
  }
};

/**
 * Thêm hoặc cập nhật nhiều answers cùng lúc
 */
export const addOrUpdateMultipleAttemptAnswers = async (
  dto: AddOrUpdateAttemptAnswerDto[]
): Promise<AttemptAnswerDto[]> => {
  try {
    const { data } = await axiosInstance.post<AttemptAnswerDto[]>(
      ADD_OR_UPDATE_ATTEMPT_ANSWERS_URL,
      dto
    );
    return data;
  } catch (error) {
    console.error("Failed to add or update multiple attempt answers:", error);
    throw error;
  }
};

/**
 * Lấy tất cả answers theo attemptId
 */
export const getAttemptAnswersByAttemptId = async (
  attemptId: string
): Promise<AttemptAnswerDto[]> => {
  try {
    const { data } = await axiosInstance.get<AttemptAnswerDto[]>(
      GET_ATTEMPT_ANSWERS_URL(attemptId)
    );
    return data;
  } catch (error) {
    console.error("Failed to get attempt answers by attempt ID:", error);
    throw error;
  }
};
