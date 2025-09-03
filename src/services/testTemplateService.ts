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
 * Get all test templates by testTemplateTypeId
 */
export const getAllByTypeId = async (
  testTemplateTypeId: string
): Promise<TestTemplateDto[]> => {
  try {
    const url = GET_TEST_TEMPLATES_BY_TYPE_URL(testTemplateTypeId);

    if (__DEV__) {
      console.log("Fetching test templates from:", url);
    }

    const response = await axiosInstance.get(url);

    if (__DEV__) {
      console.log("Test templates response:", response.data);
    }

    return response.data;
  } catch (error: any) {
    // console.error("Failed to get test templates by type ID:", error);
    if (__DEV__) {
      console.log("Failed to get test templates by type ID:", error);
      if (error.response) {
        console.log("Response status:", error.response.status);
        console.log("Response data:", error.response.data);
      }
    }
    throw error;
  }
};
