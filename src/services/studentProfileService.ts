import axiosInstance from "../const/axios/axiosInstance";
import {
  GET_STUDENT_PROFILE_URL,
  CREATE_STUDENT_PROFILE_URL,
  UPDATE_STUDENT_PROFILE_URL,
} from "../const/apiUrl/baseUrl";
import axios from "axios";

export interface StudentProfileDto {
  userId: string;
  currentLevel: string;
  learningGoals: string;
}

// Tham số tạo profile
export interface CreateStudentProfileParams {
  userId: string;
  currentLevel: string;
  learningGoals: string;
}

// Tham số update profile
export interface UpdateStudentProfileParams {
  userId: string;
  currentLevel?: string;
  learningGoals?: string;
}

/**
 * Lấy hồ sơ sinh viên dựa trên userId
 */
export const getStudentProfile = async (
  userId: string
): Promise<StudentProfileDto | null> => {
  try {
    const response = await axiosInstance.get<StudentProfileDto>(
      GET_STUDENT_PROFILE_URL(userId)
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error(`GetStudentProfile API error for userId ${userId}:`, error);
    throw error;
  }
};

/**
 * Tạo hồ sơ sinh viên mới
 */
export const createStudentProfile = async (
  createParams: CreateStudentProfileParams
): Promise<StudentProfileDto> => {
  try {
    const response = await axiosInstance.post<StudentProfileDto>(
      CREATE_STUDENT_PROFILE_URL,
      null,
      {
        params: {
          userId: createParams.userId,
          currentLevel: createParams.currentLevel,
          learningGoals: createParams.learningGoals,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("CreateStudentProfile API error:", error);
    throw error;
  }
};

/**
 * Cập nhật hồ sơ sinh viên
 */
export const updateStudentProfile = async (
  updateParams: UpdateStudentProfileParams
): Promise<StudentProfileDto> => {
  try {
    const response = await axiosInstance.put<StudentProfileDto>(
      UPDATE_STUDENT_PROFILE_URL(updateParams.userId),
      null,
      {
        params: {
          ...(updateParams.currentLevel && {
            currentLevel: updateParams.currentLevel,
          }),
          ...(updateParams.learningGoals && {
            learningGoals: updateParams.learningGoals,
          }),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("UpdateStudentProfile API error:", error);
    throw error;
  }
};

/**
 * Cập nhật chỉ current level khi sinh viên pass test cao hơn
 */
export const updateStudentLevel = async (
  userId: string,
  newLevel: string
): Promise<StudentProfileDto> => {
  try {
    const currentProfile = await getStudentProfile(userId);
    if (!currentProfile) {
      throw new Error("Student profile not found");
    }

    return await updateStudentProfile({
      userId,
      currentLevel: newLevel,
      learningGoals: currentProfile.learningGoals,
    });
  } catch (error) {
    console.error("UpdateStudentLevel API error:", error);
    throw error;
  }
};
