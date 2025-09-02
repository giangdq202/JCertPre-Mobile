import { Alert } from "react-native";

// Tắt popup lỗi mặc định của React Native
const originalConsoleError = console.error;

console.error = (...args: any[]) => {
  // Kiểm tra xem có phải là lỗi axios không
  const errorMessage = args[0]?.toString() || "";
  const errorObject = args[0];

  // Nếu là lỗi axios với status code, không hiển thị popup
  if (
    errorMessage.includes("Request failed with status code") ||
    errorMessage.includes("Network Error") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("Enroll error") ||
    errorMessage.includes("AxiosError") ||
    errorMessage.includes("Failed to get test template types") ||
    errorMessage.includes("Failed to load exam options") ||
    (errorObject && errorObject._handled)
  ) {
    // Chỉ log ra console, không hiển thị popup
    originalConsoleError(...args);
    return;
  }

  // Các lỗi khác vẫn hiển thị bình thường
  originalConsoleError(...args);
};

// Error boundary để bắt lỗi React
export const handleGlobalError = (error: Error, isFatal: boolean) => {
  console.log("Global error caught:", error);

  if (isFatal) {
    Alert.alert(
      "Lỗi nghiêm trọng",
      "Ứng dụng gặp lỗi nghiêm trọng. Vui lòng khởi động lại ứng dụng.",
      [{ text: "OK" }]
    );
  }
};

// Tắt warning popup
console.warn = (...args: any[]) => {
  // Chỉ log, không hiển thị popup
  console.log("Warning:", ...args);
};
