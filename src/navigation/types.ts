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
  MainTabs: undefined | { screen?: keyof BottomTabParamList };
  Flashcard: undefined;
  FlashcardDetail: undefined;
  TestDetail: { id: string };
  CourseDetail: { course: Course };
  Checkout: { coursePrice: number; courseId: string };
  ProfileDetail: undefined;
  TransactionHistory: undefined;
  Credit: undefined;
  MyCourse: undefined;
  LearnCourse: { courseId: string };
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
  paymentId: string; // đổi từ id -> paymentId để khớp API
  amount: number;
  paymentType: "Money" | "Credit";
  description?: string;
  status: "Completed" | "Failed" | "Pending";
  createdAt: string;
  transactionId?: string;
};

// Lịch sử giao dịch Credit
export type CreditTransactionItem = {
  transactionId: string; // đổi từ id -> transactionId
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
