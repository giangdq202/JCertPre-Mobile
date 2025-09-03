import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppStackParamList } from "./types";

// ================== Navigators ==================
import BottomTabNavigator from "./BottomTabNavigator";

// ================== Screens ==================
// Flashcard
import FlashcardScreen from "../screens/flashcard/FlashcardScreen";
import FlashcardDetailScreen from "../screens/flashcard/FlashcardDetailScreen";

// Grammar
import GrammarScreen from "../screens/grammar/GrammarScreen";
import GrammarDetailScreen from "../screens/grammar/GrammarDetailScreen";

import AlphabetScreen from "../screens/alphabet/AlphabetScreen";

// Course
import CourseDetailScreen from "../screens/course/CourseDetailScreen";
import LearnCourseScreen from "../screens/course/LearnCourseScreen";

// Test
import TestDetailScreen from "../screens/test/TestDetailScreen";
import TestHistoryScreen from "../screens/test/TestHistoryScreen";

// Profile
import ProfileDetailScreen from "../screens/profile/ProfileDetailScreen";
import PaymentHistoryScreen from "../screens/profile/PaymentHistoryScreen";
import CreditScreen from "../screens/profile/CreditScreen";
import MyCourseScreen from "../screens/profile/MyCourseScreen";

// Quiz
import QuizSetupScreen from "../screens/quiz/QuizSetupScreen";
import QuizScreen from "../screens/quiz/QuizScreen";
import QuizResultsScreen from "../screens/quiz/QuizResultsScreen";

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

      {/* Grammar */}
      <Stack.Screen name="Grammar" component={GrammarScreen} />
      <Stack.Screen name="GrammarDetail" component={GrammarDetailScreen} />

      <Stack.Screen
        name="Alphabet"
        component={AlphabetScreen}
        options={{ headerShown: false, title: "Bảng chữ cái" }}
      />

      {/* Course */}
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="LearnCourse" component={LearnCourseScreen} />

      {/* Test */}
      <Stack.Screen name="TestDetail" component={TestDetailScreen} />
      <Stack.Screen name="TestHistory" component={TestHistoryScreen} />

      {/* Profile */}
      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ headerShown: false, title: "Thông tin cá nhân" }}
      />
      <Stack.Screen
        name="TransactionHistory"
        component={PaymentHistoryScreen}
        options={{ headerShown: false, title: "Lịch sử thanh toán" }}
      />
      <Stack.Screen
        name="Credit"
        component={CreditScreen}
        options={{ headerShown: false, title: "Số dư & Lịch sử Credit" }}
      />
      <Stack.Screen
        name="MyCourse"
        component={MyCourseScreen}
        options={{ headerShown: false, title: "Khóa học của tôi" }}
      />

      {/* Quiz */}
      <Stack.Screen
        name="QuizSetup"
        component={QuizSetupScreen}
        options={{ headerShown: false, title: "Quiz Setup" }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ headerShown: false, title: "Quiz" }}
      />
      <Stack.Screen
        name="QuizResults"
        component={QuizResultsScreen}
        options={{ headerShown: false, title: "Quiz Results" }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
