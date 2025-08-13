export const BASE_URL = "https://be.zd-dev.xyz/api";

// ===== AUTH =====
export const AUTH_BASE_URL = `${BASE_URL}/auth`;
export const LOGIN_URL = `${AUTH_BASE_URL}/login`;
export const LOGOUT_URL = `${AUTH_BASE_URL}/logout`;
export const REGISTER_URL = `${AUTH_BASE_URL}/register`;
export const REFRESH_TOKEN_URL = `${AUTH_BASE_URL}/refresh`;

// ===== COURSE =====
export const COURSE_BASE_URL = `${BASE_URL}/course`;
export const GET_COURSES_URL = `${COURSE_BASE_URL}`;
export const GET_COURSE_BY_ID_URL = (courseId: string) =>
  `${COURSE_BASE_URL}/${courseId}`;

// ===== ENROLLMENT =====
export const ENROLLMENT_BASE_URL = `${BASE_URL}/enrollments`;
export const ENROLL_COURSE_URL = `${ENROLLMENT_BASE_URL}/enroll-self`;
export const CHECK_ENROLLMENT_URL = (courseId: string) =>
  `${ENROLLMENT_BASE_URL}/check/${courseId}`;
export const GET_MY_ENROLLMENTS_URL = `${ENROLLMENT_BASE_URL}/my-enrollments`;
export const UNENROLL_URL = (courseId: string) =>
  `${ENROLLMENT_BASE_URL}/unenroll/${courseId}`;

// ===== STUDENT PROFILE =====
export const STUDENT_PROFILE_BASE_URL = `${BASE_URL}/student-profile`;
export const CREATE_STUDENT_PROFILE_URL = `${STUDENT_PROFILE_BASE_URL}/create`;
export const GET_STUDENT_PROFILE_URL = (userId: string) =>
  `${STUDENT_PROFILE_BASE_URL}/${userId}`;
export const UPDATE_STUDENT_PROFILE_URL = (userId: string) =>
  `${STUDENT_PROFILE_BASE_URL}/update/${userId}`;

// ===== PAYMENT & CREDIT =====
export const PAYMENT_BASE_URL = `${BASE_URL}/payment`;
export const GET_PAYMENT_HISTORY_URL = (userId: string) =>
  `${PAYMENT_BASE_URL}/history/${userId}`;
export const GET_CREDIT_HISTORY_URL = (userId: string) =>
  `${PAYMENT_BASE_URL}/credit-history/${userId}`;
export const CHECK_CREDIT_URL = (userId: string, amount: number) =>
  `${PAYMENT_BASE_URL}/check-credit/${userId}/${amount}`;
export const CREATE_CREDIT_PURCHASE_URL = `${PAYMENT_BASE_URL}/create-credit-purchase`;

// ===== LESSON & PROGRESS =====
export const LESSON_PROGRESS_BASE_URL = `${BASE_URL}/lesson-progress`;
export const CREATE_LESSON_PROGRESS_URL = `${LESSON_PROGRESS_BASE_URL}`;
export const UPDATE_LESSON_PROGRESS_URL = (progressId: string) =>
  `${LESSON_PROGRESS_BASE_URL}/${progressId}`;
export const GET_LESSON_PROGRESS_BY_USER_COURSE_URL = `${LESSON_PROGRESS_BASE_URL}/by-user-course`;
export const GET_COMPLETION_RATE_URL = `${LESSON_PROGRESS_BASE_URL}/completion-rate`;

// ===== LESSONS =====
export const LESSON_BASE_URL = `${BASE_URL}/lessons`;
export const GET_LESSONS_BY_COURSE_URL = (courseId: string) =>
  `${LESSON_BASE_URL}/by-course/${courseId}`;
export const GET_LESSON_BY_ID_URL = (lessonId: string) =>
  `${LESSON_BASE_URL}/${lessonId}`;
export const GET_DOCUMENTS_BY_LESSON_URL = (lessonId: string) =>
  `${BASE_URL}/documents/by-lesson/${lessonId}`;

// ===== TEST =====
export const TEST_BASE_URL = `${BASE_URL}/tests`;
export const GET_TEST_BY_LESSON_URL = (lessonId: string) =>
  `${TEST_BASE_URL}/by-lesson/${lessonId}`;
export const GET_TEST_BY_ID_URL = (testId: string) =>
  `${TEST_BASE_URL}/${testId}`;
