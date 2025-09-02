import axiosInstance from "../const/axios/axiosInstance";
import { BASE_URL } from "../const/apiUrl/baseUrl";
import { isAxiosError } from "axios";

const USERS_BASE_URL = `${BASE_URL}/users`;

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  credit: number;
  createdAt: string;
  lastLogin: string;
  status: UserStatus;
  roleId: string;
  roleName?: string;
}

export enum UserStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2,
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
}

export const updateUser = async (
  userId: string,
  updateData: UpdateUserDto
): Promise<UserDto> => {
  const formData = new FormData();
  if (updateData.fullName) formData.append("fullName", updateData.fullName);
  if (updateData.phone) formData.append("phone", updateData.phone);

  const res = await axiosInstance.put<UserDto>(
    `${USERS_BASE_URL}/${userId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const updateUserAvatar = async (
  userId: string,
  formData: FormData
): Promise<UserDto> => {
  const res = await axiosInstance.put<UserDto>(
    `${USERS_BASE_URL}/${userId}/avatar`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const getUserById = async (userId: string): Promise<UserDto> => {
  const res = await axiosInstance.get<UserDto>(`${USERS_BASE_URL}/${userId}`);
  return res.data;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  await axiosInstance.delete(`${USERS_BASE_URL}/${userId}`);
  return true;
};

export const userExists = async (userId: string): Promise<boolean> => {
  try {
    await axiosInstance.head(`${USERS_BASE_URL}/${userId}`);
    return true;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return false;
    throw error;
  }
};
