// src/navigation/types.ts
export type AuthStackParamList = {
  AuthIntroScreen: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Course: undefined;
  Test: undefined;
  Schedule: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined | { screen?: keyof BottomTabParamList };
  Flashcard: undefined;
  FlashcardDetail: undefined;
  TestDetail: { id: string };
  CourseDetail: { course: Course };
  ProfileDetail: undefined;
  TransactionHistory: undefined;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  level: number;
  thumbnailUrl: any;
  price: number;
};
