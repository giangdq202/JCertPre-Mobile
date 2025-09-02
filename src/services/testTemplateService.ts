import axiosInstance from "../const/axios/axiosInstance";
import { GET_TEST_TEMPLATES_BY_TYPE_URL } from "../const/apiUrl/baseUrl";

export interface CreateTestTemplateDto {
  testTemplateTypeId: string;
  templateName: string;
  durationMinutes: number;
  totalScore: number;
  toPassPercentage: number;
  sequence: number;
}

export interface TestTemplateDto {
  templateId: string;
  testTemplateTypeId: string;
  templateName: string;
  durationMinutes: number;
  totalScore: number;
  toPassPercentage: number;
  sequence: number;
}

export interface UpdateTestTemplateDto {
  templateName?: string;
  durationMinutes?: number;
  totalScore?: number;
  toPassPercentage?: number;
  sequence?: number;
}

/**
 * Get all test templates by testTemplateTypeId (student)
 */
export const getAllByTypeId = async (
  testTemplateTypeId: string
): Promise<TestTemplateDto[]> => {
  try {
    const response = await axiosInstance.get(
      GET_TEST_TEMPLATES_BY_TYPE_URL(testTemplateTypeId)
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get test templates by type ID:", error);
    throw error;
  }
};
