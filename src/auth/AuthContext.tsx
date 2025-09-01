import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { login, logout } from "../services/authService";
import { refreshToken } from "../services/tokenService";

const STORAGE_KEYS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
  USER: "userInfo",
};

interface UserInfoResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  credit?: number;
  roleName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  jwtToken: string | null;
  userInfo: UserInfoResponse | null;
  isLoading: boolean;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ===== Helpers =====
  const storeSession = async (
    access: string,
    refresh: string,
    user: UserInfoResponse
  ) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS, access],
      [STORAGE_KEYS.REFRESH, refresh],
      [STORAGE_KEYS.USER, JSON.stringify(user)],
    ]);
  };

  const clearSession = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS,
      STORAGE_KEYS.REFRESH,
      STORAGE_KEYS.USER,
    ]);
  };

  // ===== Actions =====
  const handleRefreshToken = useCallback(
    async (accessToken: string, refresh: string) => {
      try {
        const response = await refreshToken(accessToken, refresh);

        if (response.user.roleName !== "STUDENT") {
          throw new Error("Ứng dụng chỉ dành cho sinh viên");
        }

        await storeSession(
          response.accessToken,
          response.refreshToken,
          response.user
        );

        setJwtToken(response.accessToken);
        setUserInfo(response.user);
        setIsAuthenticated(true);
      } catch (err) {
        await clearSession();
        setJwtToken(null);
        setUserInfo(null);
        setIsAuthenticated(false);

        Toast.show({
          type: "error",
          text1: "Phiên đăng nhập đã hết hạn",
          text2: "Vui lòng đăng nhập lại",
        });
      }
    },
    []
  );

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const response = await login({ email, password });

      if (response.user.roleName !== "STUDENT") {
        throw new Error("Ứng dụng chỉ dành cho sinh viên");
      }

      await storeSession(
        response.accessToken,
        response.refreshToken,
        response.user
      );

      setJwtToken(response.accessToken);
      setUserInfo(response.user);
      setIsAuthenticated(true);

      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2: error?.message || "Vui lòng kiểm tra lại thông tin",
      });
      throw error;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {}
    await clearSession();
    setJwtToken(null);
    setUserInfo(null);
    setIsAuthenticated(false);

    Toast.show({
      type: "info",
      text1: "Đăng xuất thành công!",
    });
  }, []);

  // ===== Init =====
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [[, access], [, refresh]] = await AsyncStorage.multiGet([
          STORAGE_KEYS.ACCESS,
          STORAGE_KEYS.REFRESH,
        ]);

        if (access && refresh) {
          await handleRefreshToken(access, refresh);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [handleRefreshToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        jwtToken,
        userInfo,
        isLoading,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
