import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, REFRESH_TOKEN } from "../apiUrl/baseUrl";
import { refreshToken } from "../../services/tokenService";

let onLogoutCallback: (() => void) | null = null;

export const setOnLogoutCallback = (callback: () => void) => {
  onLogoutCallback = callback;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem("accessToken");

    if (accessToken) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      if (typeof (config.headers as any).set === "function") {
        (config.headers as AxiosHeaders).set(
          "Authorization",
          `Bearer ${accessToken}`
        );
      } else {
        config.headers = new AxiosHeaders({
          Authorization: `Bearer ${accessToken}`,
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    const isAuthRefreshEndpoint = originalConfig.url?.includes(REFRESH_TOKEN);

    if (
      error.response &&
      error.response.status === 401 &&
      !originalConfig._retry &&
      !isAuthRefreshEndpoint
    ) {
      originalConfig._retry = true;

      try {
        const oldAccessToken = await AsyncStorage.getItem("accessToken");
        const oldRefreshToken = await AsyncStorage.getItem("refreshToken");

        if (oldAccessToken && oldRefreshToken) {
          const refreshResponse = await refreshToken(
            oldAccessToken,
            oldRefreshToken
          );

          const newAccessToken = refreshResponse.accessToken;
          const newRefreshToken = refreshResponse.refreshToken;

          if (newAccessToken && newRefreshToken) {
            await AsyncStorage.setItem("accessToken", newAccessToken);
            await AsyncStorage.setItem("refreshToken", newRefreshToken);

            if (!originalConfig.headers) {
              originalConfig.headers = new AxiosHeaders();
            }

            (originalConfig.headers as AxiosHeaders).set(
              "Authorization",
              `Bearer ${newAccessToken}`
            );

            return axiosInstance(originalConfig);
          }
        }

        if (onLogoutCallback) onLogoutCallback();
        return Promise.reject(error);
      } catch (refreshError) {
        if (onLogoutCallback) onLogoutCallback();
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response &&
      error.response.status === 401 &&
      isAuthRefreshEndpoint
    ) {
      if (onLogoutCallback) onLogoutCallback();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
