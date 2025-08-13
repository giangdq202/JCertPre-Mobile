import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, REFRESH_TOKEN_URL } from "../apiUrl/baseUrl";
import { refreshToken } from "../../services/authService";

// ================== Logout Callback ==================
let onLogoutCallback: (() => void) | null = null;
export const setOnLogoutCallback = (callback: () => void) => {
  onLogoutCallback = callback;
};

const handleLogout = () => {
  if (onLogoutCallback) onLogoutCallback();
};

// ================== Axios Instance ==================
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================== Request Interceptor ==================
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (accessToken) {
      if (!config.headers) config.headers = new AxiosHeaders();
      (config.headers as AxiosHeaders).set(
        "Authorization",
        `Bearer ${accessToken}`
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================== Response Interceptor ==================
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    const isAuthRefreshEndpoint =
      originalConfig.url?.includes(REFRESH_TOKEN_URL);

    if (
      error.response?.status === 401 &&
      !originalConfig._retry &&
      !isAuthRefreshEndpoint
    ) {
      originalConfig._retry = true;

      const oldAccessToken = await AsyncStorage.getItem("accessToken");
      const oldRefreshToken = await AsyncStorage.getItem("refreshToken");

      if (oldAccessToken && oldRefreshToken) {
        try {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await refreshToken(oldAccessToken, oldRefreshToken);

          if (newAccessToken && newRefreshToken) {
            await AsyncStorage.setItem("accessToken", newAccessToken);
            await AsyncStorage.setItem("refreshToken", newRefreshToken);

            if (!originalConfig.headers)
              originalConfig.headers = new AxiosHeaders();
            (originalConfig.headers as AxiosHeaders).set(
              "Authorization",
              `Bearer ${newAccessToken}`
            );

            return axiosInstance(originalConfig);
          } else {
            handleLogout();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          handleLogout();
          return Promise.reject(refreshError);
        }
      } else {
        handleLogout();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && isAuthRefreshEndpoint) {
      handleLogout();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
