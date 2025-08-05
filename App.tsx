// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/auth/AuthContext";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <Toast />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
