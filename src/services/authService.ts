import axiosInstance from "../const/axios/axiosInstance";
import {
  LOGIN_URL,
  LOGOUT_URL,
  REGISTER_URL,
  REFRESH_TOKEN_URL,
} from "../const/apiUrl/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// ===== REGISTER =====
export const register = async (registerData: FormData) => {
  try {
    const response = await axiosInstance.post<AuthSuccessResponse>(
      REGISTER_URL,
      registerData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    await AsyncStorage.setItem("accessToken", response.data.accessToken);
    await AsyncStorage.setItem("refreshToken", response.data.refreshToken);

    return response.data;
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
};

// ===== LOGIN =====
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

// ===== LOGOUT =====
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
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
  }
};

// ===== REFRESH TOKEN =====
export const refreshToken = async (
  accessToken: string,
  oldRefreshToken: string
) => {
  try {
    const payload: RefreshTokenPayload = {
      accessToken,
      refreshToken: oldRefreshToken,
    };

    const res = await axiosInstance.post<AuthSuccessResponse>(
      REFRESH_TOKEN_URL,
      payload
    );
    return res.data; // chứa accessToken, refreshToken, user
  } catch (error) {
    console.error("Refresh token service error:", error);
    throw error;
  }
};
