// src/auth/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { login, logout } from "../services/authService";
import { refreshToken } from "../services/tokenService";

interface UserInfoResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl?: string | null;
  roleName: string;
  credit?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  jwtToken: string | null;
  userInfo?: UserInfoResponse;
  isLoading: boolean;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  setUserInfo: (user: UserInfoResponse) => void;
  setIsAuthenticated: (auth: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refresh = await AsyncStorage.getItem("refreshToken");
        const access = await AsyncStorage.getItem("accessToken");
        if (refresh && access) {
          await handleRefreshToken(access, refresh);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const handleRefreshToken = async (accessToken: string, refresh: string) => {
    try {
      const response = await refreshToken(accessToken, refresh);
      await AsyncStorage.setItem("accessToken", response.accessToken);
      await AsyncStorage.setItem("refreshToken", response.refreshToken);

      setJwtToken(response.accessToken);
      setUserInfo(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Refresh token error:", err);
      Toast.show({
        type: "error",
        text1: "Phiên đăng nhập đã hết hạn",
        text2: "Vui lòng đăng nhập lại",
      });
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login({ email, password });

      await AsyncStorage.setItem("accessToken", response.accessToken);
      await AsyncStorage.setItem("refreshToken", response.refreshToken);

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
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      setJwtToken(null);
      setUserInfo(undefined);
      setIsAuthenticated(false);

      Toast.show({
        type: "info",
        text1: "Đăng xuất thành công!",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        jwtToken,
        userInfo,
        isLoading,
        handleLogin,
        handleLogout,
        setUserInfo,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
