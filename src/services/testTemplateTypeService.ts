import axiosInstance from "../const/axios/axiosInstance";
import { GET_TEST_TEMPLATES_BY_TYPE_URL } from "../const/apiUrl/baseUrl";

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

export enum TestType {
  JLPTAuto = 0,
  EntryAuto = 1,
  CustomManual = 2,
}

/**
 * Test Template Type DTO (for student)
 */
export interface TestTemplateTypeDto {
  testTemplateTypeId: string;
  typeName: string;
  courseLevel: CourseLevel;
  testType: TestType;
  description: string;
  isActive: boolean;
  totalTestScore: number;
  totalPassPercentage: number;
  createdAt: string;
  createdByUserName?: string;
  verifiedByUserName?: string;
}

/**
 * Pagination interface
 */
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
 * Parameters for fetching test template types
 */
export interface GetAllTestTemplateTypesParams {
  search?: string;
  level?: CourseLevel;
  type?: TestType;
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

/**
 * Get all test template types for students
 * @param params - query parameters
 * @returns Promise<Pagination<TestTemplateTypeDto>>
 */
export const getAllTestTemplateTypes = async (
  params: GetAllTestTemplateTypesParams = {}
): Promise<Pagination<TestTemplateTypeDto>> => {
  try {
    const {
      search,
      level,
      type,
      isActive = true,
      pageIndex = 1,
      pageSize = 10,
    } = params;

    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (level !== undefined) queryParams.append("level", level.toString());
    if (type !== undefined) queryParams.append("type", type.toString());
    queryParams.append("isActive", isActive.toString());
    queryParams.append("pageIndex", pageIndex.toString());
    queryParams.append("pageSize", pageSize.toString());

    const url = `${GET_TEST_TEMPLATES_BY_TYPE_URL}?${queryParams.toString()}`;
    const response = await axiosInstance.get(url);

    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to get test template types for student (mobile):",
      error
    );
    throw error;
  }
};
