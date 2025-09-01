import axiosInstance from "../const/axios/axiosInstance";
import {
  GET_TEST_TEMPLATE_CONFIGS_BY_TEMPLATE_URL,
  GET_TEST_TEMPLATE_CONFIG_URL,
} from "../const/apiUrl/baseUrl";

export interface SubContentDto {
  subContentId: string;
  subContentName: string;
  subContentNameDescription: string;
  level: string;
  levelDescription: string;
  contentName: string;
  contentNameDescription: string;
}

export interface TestTemplateConfigDto {
  configId: string;
  templateId: string;
  questionCount: number;
  pointPerQuestion: number;
  totalPoints: number;
  sequence: number;
  subContent?: SubContentDto;
}

/**
 * Get all test template configs by templateId (for student)
 */
export const getAllByTemplateId = async (
  templateId: string
): Promise<TestTemplateConfigDto[]> => {
  try {
    const response = await axiosInstance.get(
      GET_TEST_TEMPLATE_CONFIGS_BY_TEMPLATE_URL(templateId)
    );
    return response.data;
  } catch (error) {
    console.error(
      "Failed to get test template configs for student by template ID:",
      error
    );
    throw error;
  }
};

/**
 * Get a single test template config by configId (for student)
 */
export const getByConfigId = async (
  configId: string
): Promise<TestTemplateConfigDto | null> => {
  try {
    const response = await axiosInstance.get(
      GET_TEST_TEMPLATE_CONFIG_URL(configId)
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(
      "Failed to get test template config for student by config ID:",
      error
    );
    throw error;
  }
};
