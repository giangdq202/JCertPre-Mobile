// const BASE_URL = "http://localhost:5018/api";

export const BASE_URL = "https://be.zd-dev.xyz/api";

// Auth APIs
export const LOGIN_URL = `${BASE_URL}/auth/login`;
export const LOGOUT_URL = `${BASE_URL}/auth/logout`;
export const REGISTER_URL = `${BASE_URL}/auth/register`;
export const REFRESH_TOKEN = `${BASE_URL}/auth/refresh`;

// Course APIs
export const GET_COURSE_URL = `${BASE_URL}/course`;
export const GET_COURSE_BY_ID_URL = (courseId: string) =>
  `${BASE_URL}/course/${courseId}`;
export const CREATE_COURSE_URL = `${BASE_URL}/course`;
export const UPDATE_COURSE_URL = (courseId: string) =>
  `${BASE_URL}/course/${courseId}`;
export const UPDATE_COURSE_STATUS_URL = (courseId: string) =>
  `${BASE_URL}/course/${courseId}/status`;

export const ADD_INSTRUCTOR_TO_COURSE_URL = (
  courseId: string,
  instructorId: string
) => `${BASE_URL}/course/${courseId}/instructors/${instructorId}`;

export const REMOVE_INSTRUCTOR_FROM_COURSE_URL = (
  courseId: string,
  instructorId: string
) => `${BASE_URL}/course/${courseId}/instructors/${instructorId}`;

// Cloudinary APIs
const CLOUDINARY_BASE_URL = "https://be.zd-dev.xyz/api/cloudinary-test";

export const CLOUDINARY_UPLOAD_IMAGE_URL = `${CLOUDINARY_BASE_URL}/upload-image`;
export const CLOUDINARY_UPLOAD_VIDEO_URL = `${CLOUDINARY_BASE_URL}/upload-video`;
export const CLOUDINARY_UPLOAD_DOCUMENT_URL = `${CLOUDINARY_BASE_URL}/upload-document`;
export const CLOUDINARY_DELETE_IMAGE_URL = `${CLOUDINARY_BASE_URL}/delete-image`;
export const CLOUDINARY_DELETE_VIDEO_URL = `${CLOUDINARY_BASE_URL}/delete-video`;
export const CLOUDINARY_DELETE_DOCUMENT_URL = `${CLOUDINARY_BASE_URL}/delete-document`;

// Student Profile
export const CREATE_STUDENT_PROFILE_URL = `${BASE_URL}/student-profile/create`;
export const BASE_STUDENT_PROFILE_URL = `${BASE_URL}/student-profile`;

// Payment
export const PAYMENT_BASE_URL = `${BASE_URL}/payment`;
export const GET_PAYMENT_HISTORY_URL = (userId: string) =>
  `${PAYMENT_BASE_URL}/history/${userId}`;
export const GET_CREDIT_HISTORY_URL = (userId: string) =>
  `${PAYMENT_BASE_URL}/credit-history/${userId}`;
export const CHECK_CREDIT_URL = (userId: string, amount: number) =>
  `${PAYMENT_BASE_URL}/check-credit/${userId}/${amount}`;
export const CREATE_CREDIT_PURCHASE_URL = `${PAYMENT_BASE_URL}/create-credit-purchase`;
