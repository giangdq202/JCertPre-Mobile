import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppStackParamList } from "./types";

// ================== Navigators ==================
import BottomTabNavigator from "./BottomTabNavigator";

// ================== Screens ==================
// Flashcard
import FlashcardScreen from "../screens/flashcard/FlashcardScreen";
import FlashcardDetailScreen from "../screens/flashcard/FlashcardDetailScreen";

// Course
import CourseDetailScreen from "../screens/course/CourseDetailScreen";

// Profile
import ProfileDetailScreen from "../screens/profile/ProfileDetailScreen";
import PaymentHistoryScreen from "../screens/profile/PaymentHistoryScreen";
import CreditScreen from "../screens/profile/CreditScreen";

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main Tabs */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* Flashcard */}
      <Stack.Screen name="Flashcard" component={FlashcardScreen} />
      <Stack.Screen name="FlashcardDetail" component={FlashcardDetailScreen} />

      {/* Course */}
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />

      {/* Profile */}
      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ headerShown: true, title: "Thông tin cá nhân" }}
      />
      <Stack.Screen
        name="TransactionHistory"
        component={PaymentHistoryScreen}
        options={{ headerShown: true, title: "Lịch sử thanh toán" }}
      />
      <Stack.Screen
        name="Credit"
        component={CreditScreen}
        options={{ headerShown: true, title: "Số dư & Lịch sử Credit" }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
