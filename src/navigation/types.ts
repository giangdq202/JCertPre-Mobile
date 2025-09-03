import { NavigatorScreenParams } from "@react-navigation/native";

// ================== Auth Stack ==================
export type AuthStackParamList = {
  AuthIntroScreen: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// ================== Bottom Tab ==================
export type BottomTabParamList = {
  Home: undefined;
  Course: undefined;
  Test: undefined;
  Schedule: undefined;
  Profile: undefined;
};

// ================== App Stack ==================
export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;

  // Flashcard
  Flashcard: undefined;
  FlashcardDetail: { id: string };

  // Course
  CourseDetail: { course: Course };
  LearnCourse: { courseId: string };
  Checkout: { coursePrice: number; courseId: string };

  // Test
  TestDetail: {
    testOption: {
      id: string;
      title: string;
      testType: number;
      courseLevel: number;
      estimatedDuration: number;
      templates: any[];
    };
  };
  TestHistory: {
    testTemplateTypeId: string;
    testTemplateTypeName: string;
  };

  // Profile
  ProfileDetail: undefined;
  TransactionHistory: undefined;
  Credit: undefined;
  MyCourse: undefined;

  // Quiz screens
  QuizSetup: undefined;
  Quiz: undefined;
  QuizResults: undefined;
};

// ================== Course ==================
export type Course = {
  courseId: string;
  title: string;
  description: string;
  level: number;
  thumbnailUrl: string;
  price: number;
  startDate?: string;
  endDate?: string;
};

// ================== Payment & Credit ==================

// Lịch sử thanh toán
export type PaymentHistoryItem = {
  paymentId: string;
  amount: number;
  paymentType: "Money" | "Credit";
  description?: string;
  status: "Completed" | "Failed" | "Pending";
  createdAt: string;
  transactionId?: string;
};

// Lịch sử giao dịch Credit
export type CreditTransactionItem = {
  transactionId: string;
  amount: number;
  type: "topup" | "spend";
  description?: string;
  balanceAfter: number;
  createdAt: string;
};

// Kết quả kiểm tra credit trước khi mua khóa học
export type CreditCheckResponse = {
  sufficient: boolean;
  currentBalance: number;
};

// Request tạo giao dịch mua Credit
export type CreateCreditPurchaseRequest = {
  userId: string;
  creditAmount: number;
};

// Response sau khi tạo giao dịch Credit
export type CreateCreditPurchaseResponse = {
  paymentUrl: string;
  orderCode: number;
  amount: number;
  description: string;
};
