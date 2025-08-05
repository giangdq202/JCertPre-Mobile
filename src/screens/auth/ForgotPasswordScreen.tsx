// src/screens/auth/ForgotPasswordScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ForgotPasswordScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Quên mật khẩu</Text>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
