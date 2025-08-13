import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS);
    return token;
  } catch (err) {
    console.error("Lỗi lấy access token:", err);
    return null;
  }
};
