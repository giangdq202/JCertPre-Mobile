import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, REFRESH_TOKEN_URL } from "../apiUrl/baseUrl";
import { refreshToken } from "../../services/tokenService";

// ================== Logout Callback ==================
let onLogoutCallback: (() => void) | null = null;
export const setOnLogoutCallback = (callback: () => void) => {
  onLogoutCallback = callback;
};

const handleLogout = () => {
  if (onLogoutCallback) onLogoutCallback();
};

// ================== Axios Instance ==================
const axiosInstance = axios.create({ baseURL: BASE_URL });

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
    const isAuthRefresh = originalConfig.url?.includes(REFRESH_TOKEN_URL);

    // Nếu token hết hạn và chưa retry
    if (
      error.response?.status === 401 &&
      !originalConfig._retry &&
      !isAuthRefresh
    ) {
      originalConfig._retry = true;

      try {
        const [oldAccessToken, oldRefreshToken] = await Promise.all([
          AsyncStorage.getItem("accessToken"),
          AsyncStorage.getItem("refreshToken"),
        ]);

        if (oldAccessToken && oldRefreshToken) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await refreshToken(oldAccessToken, oldRefreshToken);

          if (newAccessToken && newRefreshToken) {
            await Promise.all([
              AsyncStorage.setItem("accessToken", newAccessToken),
              AsyncStorage.setItem("refreshToken", newRefreshToken),
            ]);

            if (!originalConfig.headers)
              originalConfig.headers = new AxiosHeaders();
            (originalConfig.headers as AxiosHeaders).set(
              "Authorization",
              `Bearer ${newAccessToken}`
            );

            return axiosInstance(originalConfig);
          }
        }

        handleLogout();
        return Promise.reject(error);
      } catch (refreshError) {
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // Nếu lỗi 401 ngay khi refresh token
    if (error.response?.status === 401 && isAuthRefresh) {
      handleLogout();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
