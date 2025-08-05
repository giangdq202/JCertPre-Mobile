// src/utils/jwt.ts
import { jwtDecode } from "jwt-decode";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

type DecodedToken = {
  exp: number;
  [key: string]: any;
};

export const isTokenExpired = (token: string | null | undefined): boolean => {
  if (!token) return true;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (err) {
    console.error("Lỗi khi decode token:", err);
    return true;
  }
};

export const getUserFromToken = (token: string | null | undefined): any => {
  try {
    return jwtDecode(token || "");
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);

    Toast.show({
      type: "error",
      text1: "Đăng nhập thất bại!",
    });

    return null;
  }
};
