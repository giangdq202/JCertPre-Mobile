// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/auth/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <RootNavigator />
        <Toast />
        <StatusBar style="auto" />
      </AuthProvider>
    </NavigationContainer>
  );
}
