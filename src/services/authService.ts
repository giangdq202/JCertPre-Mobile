import axiosInstance from "../const/axios/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LOGIN_URL,
  LOGOUT_URL,
  REGISTER_URL,
  REFRESH_TOKEN,
} from "../const/apiUrl/baseUrl";

interface UserInfoResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  roleName: string;
}

interface AuthSuccessResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfoResponse;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LogoutPayload {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenPayload {
  accessToken: string;
  refreshToken: string;
}

export const register = async (registerData: RegisterPayload) => {
  try {
    const response = await axiosInstance.post<AuthSuccessResponse>(
      REGISTER_URL,
      registerData
    );

    // Lưu token vào AsyncStorage sau khi đăng ký thành công
    await AsyncStorage.setItem("accessToken", response.data.accessToken);
    await AsyncStorage.setItem("refreshToken", response.data.refreshToken);

    return response.data;
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
};

export const login = async (loginData: LoginPayload) => {
  try {
    const response = await axiosInstance.post<AuthSuccessResponse>(
      LOGIN_URL,
      loginData
    );

    await AsyncStorage.setItem("accessToken", response.data.accessToken);
    await AsyncStorage.setItem("refreshToken", response.data.refreshToken);

    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      const logoutData: LogoutPayload = {
        accessToken,
        refreshToken,
      };

      await axiosInstance.post(LOGOUT_URL, logoutData);
      console.log("Logged out successfully on backend.");
    } else {
      console.warn("No access/refresh token found to send to logout API.");
    }
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Luôn xoá token khỏi AsyncStorage
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
  }
};


