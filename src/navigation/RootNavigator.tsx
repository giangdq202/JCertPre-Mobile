import React from "react";
import { useAuth } from "../auth/AuthContext";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";
import { ActivityIndicator, View } from "react-native";

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
};

export default RootNavigator;
