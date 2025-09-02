import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { useAuth } from "../auth/AuthContext";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Hiển thị loader khi đang xác thực
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  // Chọn navigator dựa trên trạng thái đăng nhập
  return isAuthenticated ? <AppStack /> : <AuthStack />;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default RootNavigator;
