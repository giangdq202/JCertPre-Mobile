import axiosInstance from "../const/axios/axiosInstance";
import { GET_COURSES_URL, GET_COURSE_BY_ID_URL } from "../const/apiUrl/baseUrl";
import { Pagination } from "../types/pagination";
import { DocumentDto } from "./documentService";

export enum CourseStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

export enum CourseType {
  Personal = 0,
  Public = 1,
}

export interface CourseQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string | null;
  status?: CourseStatus | null;
  level?: CourseLevel | null;
  courseType?: CourseType | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CourseListDto {
  courseId: string;
  title: string;
  description: string;
  level: CourseLevel;
  courseType: CourseType;
  price: number;
  thumbnailUrl: string;
  status: CourseStatus;
  createdAt: string;
  startDate: string;
  endDate: string;
  enrollmentsCount: number;
  instructorsCount: number;
}

export interface CourseDto {
  courseId: string;
  title: string;
  description: string;
  level: CourseLevel;
  courseType: CourseType;
  price: number;
  thumbnailUrl: string;
  status: CourseStatus;
  createdAt: string;
  startDate: string;
  endDate: string;
  lessonsCount: number;
  livestreamsCount: number;
  enrollmentsCount: number;
  lessons: {
    lessonId: string;
    courseId: string;
    title: string;
    lessonOrder: number;
    content: string;
    documents: DocumentDto[];
  }[];
}

// ===== GET COURSES =====
export const getCourses = async (
  queryParameters: CourseQueryParameters
): Promise<Pagination<CourseListDto>> => {
  try {
    const params = new URLSearchParams();
    if (queryParameters.pageNumber !== undefined)
      params.append("PageNumber", queryParameters.pageNumber.toString());
    if (queryParameters.pageSize !== undefined)
      params.append("PageSize", queryParameters.pageSize.toString());
    if (queryParameters.searchTerm)
      params.append("SearchTerm", queryParameters.searchTerm);
    if (queryParameters.status !== undefined && queryParameters.status !== null)
      params.append("Status", queryParameters.status.toString());
    if (queryParameters.level !== undefined && queryParameters.level !== null)
      params.append("Level", queryParameters.level.toString());
    if (
      queryParameters.courseType !== undefined &&
      queryParameters.courseType !== null
    )
      params.append("CourseType", queryParameters.courseType.toString());
    if (queryParameters.startDate)
      params.append("StartDate", queryParameters.startDate);
    if (queryParameters.endDate)
      params.append("EndDate", queryParameters.endDate);

    const response = await axiosInstance.get<Pagination<CourseListDto>>(
      `${GET_COURSES_URL}?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("GetCourses API error:", error);
    throw error;
  }
};

// ===== GET COURSE BY ID =====
export const getCourseById = async (courseId: string): Promise<CourseDto> => {
  try {
    if (!courseId || courseId.trim() === "")
      throw new Error("CourseId is empty or invalid");

    const url = GET_COURSE_BY_ID_URL(courseId);
    const response = await axiosInstance.get<CourseDto>(url);

    return response.data;
  } catch (error: any) {
    console.error(`GetCourseById API error for ID ${courseId}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};
