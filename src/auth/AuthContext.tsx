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
};

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
  // ================== State ==================
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse>();
  const [isLoading, setIsLoading] = useState(true);

  // ================== Helpers ==================
  const storeTokens = async (access: string, refresh: string) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS, access],
        [STORAGE_KEYS.REFRESH, refresh],
      ]);
    } catch (err) {
      console.error("Lỗi lưu token:", err);
    }
  };

  const clearTokens = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS,
        STORAGE_KEYS.REFRESH,
      ]);
    } catch (err) {
      console.error("Lỗi xóa token:", err);
    }
  };

  // ================== Actions ==================
  const handleRefreshToken = useCallback(
    async (accessToken: string, refresh: string) => {
      try {
        const response = await refreshToken(accessToken, refresh);
        await storeTokens(response.accessToken, response.refreshToken);

        setJwtToken(response.accessToken);
        setUserInfo(response.user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Refresh token error:", err);
        await clearTokens();
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
      await storeTokens(response.accessToken, response.refreshToken);

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
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      await clearTokens();
      setJwtToken(null);
      setUserInfo(undefined);
      setIsAuthenticated(false);

      Toast.show({
        type: "info",
        text1: "Đăng xuất thành công!",
      });
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [access, refresh] = await AsyncStorage.multiGet([
          STORAGE_KEYS.ACCESS,
          STORAGE_KEYS.REFRESH,
        ]).then((res) => res.map((item) => item[1]));

        if (access && refresh) {
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
