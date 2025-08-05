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
  TestDetail: { id: string };
};
