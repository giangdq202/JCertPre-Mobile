// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/auth/AuthContext";
import { QuizProvider } from "./src/contexts/QuizContext";
import RootNavigator from "./src/navigation/RootNavigator";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <QuizProvider>
          <RootNavigator />
          <Toast />
          <StatusBar style="auto" />
        </QuizProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
