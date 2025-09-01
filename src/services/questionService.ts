import axiosInstance from "../const/axios/axiosInstance";
import { QuestionDto } from "../types/questionDto";

export interface Pagination<T> {
  pageIndex: number;
  pageSize: number;
  totalItemsCount: number;
  totalPagesCount: number;
  next: boolean;
  previous: boolean;
  items: T[];
}

/**
 * Lấy danh sách câu hỏi active (student)
 * Có thể dùng paging
 */
export const getActiveQuestions = async (
  pageIndex: number = 1,
  pageSize: number = 20
): Promise<Pagination<QuestionDto>> => {
  try {
    const { data } = await axiosInstance.get<Pagination<QuestionDto>>(
      `/questions/paging-details?pageIndex=${pageIndex}&pageSize=${pageSize}&isActive=true`
    );
    return data;
  } catch (error) {
    console.error("Error fetching active questions:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết 1 câu hỏi theo id
 */
export const getQuestionById = async (
  questionId: string
): Promise<QuestionDto> => {
  try {
    const { data } = await axiosInstance.get<QuestionDto>(
      `/questions/${questionId}`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Tìm kiếm câu hỏi theo keyword (student)
 */
export const searchQuestions = async (
  searchTerm: string,
  pageIndex: number = 1,
  pageSize: number = 20
): Promise<Pagination<QuestionDto>> => {
  try {
    const queryParams = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      search: searchTerm,
      isActive: "true",
    });

    const { data } = await axiosInstance.get<Pagination<QuestionDto>>(
      `/questions/paging-details?${queryParams.toString()}`
    );
    return data;
  } catch (error) {
    console.error(
      `Error searching questions with term "${searchTerm}":`,
      error
    );
    throw error;
  }
};
