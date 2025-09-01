export const BASE_URL = "https://be.zd-dev.xyz/api";

// ======================= AUTH =======================
export const AUTH_BASE_URL = `${BASE_URL}/auth`;
export const LOGIN_URL = `${AUTH_BASE_URL}/login`;
export const LOGOUT_URL = `${AUTH_BASE_URL}/logout`;
export const REGISTER_URL = `${AUTH_BASE_URL}/register`;
export const REFRESH_TOKEN_URL = `${AUTH_BASE_URL}/refresh`;

// ======================= COURSES =======================
export const COURSE_BASE_URL = `${BASE_URL}/course`;
export const GET_COURSES_URL = `${COURSE_BASE_URL}`;
export const GET_COURSE_BY_ID_URL = (courseId: string) =>
  `${COURSE_BASE_URL}/${courseId}`;

// ======================= ENROLLMENTS =======================
export const ENROLLMENT_BASE_URL = `${BASE_URL}/enrollments`;
export const ENROLL_COURSE_URL = `${ENROLLMENT_BASE_URL}/enroll-self`;
export const CHECK_ENROLLMENT_URL = (courseId: string) =>
  `${ENROLLMENT_BASE_URL}/check/${courseId}`;
export const GET_MY_ENROLLMENTS_URL = `${ENROLLMENT_BASE_URL}/my-enrollments`;
export const UNENROLL_URL = (courseId: string) =>
  `${ENROLLMENT_BASE_URL}/unenroll/${courseId}`;

// ======================= STUDENT PROFILE =======================
export const STUDENT_PROFILE_BASE_URL = `${BASE_URL}/student-profile`;
export const CREATE_STUDENT_PROFILE_URL = `${STUDENT_PROFILE_BASE_URL}/create`;
export const GET_STUDENT_PROFILE_URL = (userId: string) =>
  `${STUDENT_PROFILE_BASE_URL}/${userId}`;
export const UPDATE_STUDENT_PROFILE_URL = (userId: string) =>
  `${STUDENT_PROFILE_BASE_URL}/update/${userId}`;

// ======================= PAYMENT & CREDIT =======================
export const PAYMENT_BASE_URL = `${BASE_URL}/payment`;
export const GET_PAYMENT_HISTORY_URL = (userId: string) =>
  `${PAYMENT_BASE_URL}/history/${userId}`;
export const GET_CREDIT_HISTORY_URL = (userId: string) =>
  `${PAYMENT_BASE_URL}/credit-history/${userId}`;
export const CHECK_CREDIT_URL = (userId: string, amount: number) =>
  `${PAYMENT_BASE_URL}/check-credit/${userId}/${amount}`;
export const CREATE_CREDIT_PURCHASE_URL = `${PAYMENT_BASE_URL}/create-credit-purchase`;

// ======================= LESSONS & PROGRESS =======================
export const LESSON_BASE_URL = `${BASE_URL}/lessons`;
export const GET_LESSONS_BY_COURSE_URL = (courseId: string) =>
  `${LESSON_BASE_URL}/by-course/${courseId}`;
export const GET_LESSON_BY_ID_URL = (lessonId: string) =>
  `${LESSON_BASE_URL}/${lessonId}`;
export const GET_DOCUMENTS_BY_LESSON_URL = (lessonId: string) =>
  `${BASE_URL}/documents/by-lesson/${lessonId}`;

export const LESSON_PROGRESS_BASE_URL = `${BASE_URL}/lesson-progress`;
export const CREATE_LESSON_PROGRESS_URL = LESSON_PROGRESS_BASE_URL;
export const UPDATE_LESSON_PROGRESS_URL = (progressId: string) =>
  `${LESSON_PROGRESS_BASE_URL}/${progressId}`;
export const GET_LESSON_PROGRESS_BY_USER_COURSE_URL = `${LESSON_PROGRESS_BASE_URL}/by-user-course`;
export const GET_COMPLETION_RATE_URL = `${LESSON_PROGRESS_BASE_URL}/completion-rate`;

// ======================= TESTS =======================
export const TEST_BASE_URL = `${BASE_URL}/tests`;
export const GET_TESTS_BY_USER_URL = (userId: string) =>
  `${TEST_BASE_URL}/by-user/${userId}`;
export const GET_TEST_BY_LESSON_URL = (lessonId: string) =>
  `${TEST_BASE_URL}/by-lesson/${lessonId}`;
export const GET_TEST_BY_ID_URL = (testId: string) =>
  `${TEST_BASE_URL}/${testId}`;

// ======================= TEST QUESTIONS =======================
export const TEST_QUESTION_BASE_URL = `${BASE_URL}/test-questions`;
export const GET_QUESTIONS_FROM_TEST_URL = (testId: string) =>
  `${TEST_QUESTION_BASE_URL}/${testId}/questions`;

// ======================= QUESTIONS & CHOICES =======================
export const QUESTION_BASE_URL = `${BASE_URL}/questions`;
export const CHOICE_BASE_URL = `${BASE_URL}/choices`;

// ======================= TEST ATTEMPTS =======================
export const TEST_ATTEMPT_BASE_URL = `${BASE_URL}/test-attempts`;
export const START_TEST_ATTEMPT_URL = `${TEST_ATTEMPT_BASE_URL}/start`;
export const SUBMIT_TEST_ATTEMPT_URL = `${TEST_ATTEMPT_BASE_URL}/submit`;
export const GET_TEST_ATTEMPTS_BY_USER_URL = (userId: string) =>
  `${TEST_ATTEMPT_BASE_URL}/by-user/${userId}`;
export const GET_TEST_ATTEMPT_WITH_SCORE_URL = (attemptId: string) =>
  `${TEST_ATTEMPT_BASE_URL}/${attemptId}/with-score-summary`;

// ======================= TEST TEMPLATES =======================
export const TEST_TEMPLATE_BASE_URL = `${BASE_URL}/test-templates`;
export const GET_TEST_TEMPLATES_BY_TYPE_URL = (typeId: string) =>
  `${TEST_TEMPLATE_BASE_URL}/by-type/${typeId}`;
export const GET_TEST_TEMPLATE_BY_ID_URL = (templateId: string) =>
  `${TEST_TEMPLATE_BASE_URL}/${templateId}`;

// ======================= TEST TEMPLATE CONFIGS =======================
export const TEST_TEMPLATE_CONFIG_BASE_URL = `${BASE_URL}/test-template-configs`;
export const GET_TEST_TEMPLATE_CONFIG_URL = (configId: string) =>
  `${TEST_TEMPLATE_CONFIG_BASE_URL}/${configId}`;
export const GET_TEST_TEMPLATE_CONFIGS_BY_TEMPLATE_URL = (templateId: string) =>
  `${TEST_TEMPLATE_CONFIG_BASE_URL}/by-template/${templateId}`;

// ======================= LIVESTREAM =======================
export const LIVESTREAM_BASE_URL = `${BASE_URL}/livestreams`;
export const GET_LIVESTREAMS_URL = LIVESTREAM_BASE_URL;
export const GET_LIVESTREAM_BY_ID_URL = (id: string) =>
  `${LIVESTREAM_BASE_URL}/${id}`;
export const CHECK_CAN_JOIN_LIVESTREAM_URL = (id: string) =>
  `${LIVESTREAM_BASE_URL}/${id}/can-join`;
export const GET_LIVESTREAM_JOIN_TOKEN_URL = (id: string) =>
  `${LIVESTREAM_BASE_URL}/${id}/join-token`;

// ======================= STUDY PLAN =======================
export const STUDY_PLAN_BASE_URL = `${BASE_URL}/study-plans`;
export const GET_STUDY_PLANS_BY_STUDENT_URL = (studentId: string) =>
  `${STUDY_PLAN_BASE_URL}/get-by-studentid/${studentId}`;
export const GET_STUDY_PLAN_ITEM_BY_ID_URL = (itemId: string) =>
  `${BASE_URL}/study-plan-items/get-by-id/${itemId}`;
export const GET_STUDY_PLAN_ITEMS_BY_PLAN_URL = (planId: string) =>
  `${BASE_URL}/study-plan-items/get-by-plan/${planId}`;

// ======================= ATTEMPT ANSWERS =======================
export const ATTEMPT_ANSWER_BASE_URL = `${BASE_URL}/attempt-answers`;
export const ADD_OR_UPDATE_ATTEMPT_ANSWERS_URL = `${ATTEMPT_ANSWER_BASE_URL}/add-or-update`;
export const GET_ATTEMPT_ANSWERS_URL = (attemptId: string) =>
  `${ATTEMPT_ANSWER_BASE_URL}/by-attempt/${attemptId}`;
