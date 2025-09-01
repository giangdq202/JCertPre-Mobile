import axiosInstance from "../const/axios/axiosInstance";

// --- Types ---
export type Livestream = {
  livestreamId: string;
  courseId: string;
  description?: string;
  scheduledDateTime: string;
  durationMinutes: number;
  status: "scheduled" | "ongoing" | "completed";
};

export type LivestreamTimetable = Livestream & {
  courseName: string;
  endDateTime: string;
  isLive: boolean;
  canJoin: boolean;
  canStart: boolean;
  startsWithin15Minutes: boolean;
  timeStatus: string;
};

export type LivestreamJoin = {
  token: string;
  roomName: string;
  title: string;
  scheduledDateTime: string;
  description?: string;
  durationMinutes: number;
};

type CanJoinResponse = {
  canJoin: boolean;
};

// --- API Functions ---
const getLivestreamsByCourse = async (
  courseId: string
): Promise<Livestream[]> => {
  try {
    const { data } = await axiosInstance.get<Livestream[]>(
      `/livestreams?courseId=${courseId}`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching livestreams for course ${courseId}:`, error);
    throw error;
  }
};

const getLivestreamById = async (livestreamId: string): Promise<Livestream> => {
  try {
    const { data } = await axiosInstance.get<Livestream>(
      `/livestreams/${livestreamId}`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching livestream ${livestreamId}:`, error);
    throw error;
  }
};

const getLivestreamsForEnrolledCourses = async (
  userId: string
): Promise<LivestreamTimetable[]> => {
  try {
    const { data } = await axiosInstance.get<LivestreamTimetable[]>(
      `/livestreams?userId=${userId}&timetableFormat=true`
    );
    return data;
  } catch (error) {
    console.error(
      `Error fetching livestream timetable for user ${userId}:`,
      error
    );
    throw error;
  }
};

const generateJoinToken = async (
  livestreamId: string,
  userId: string
): Promise<LivestreamJoin> => {
  try {
    const { data } = await axiosInstance.get<LivestreamJoin>(
      `/livestreams/${livestreamId}/join-token?userId=${userId}`
    );
    return data;
  } catch (error) {
    console.error(
      `Error generating join token for livestream ${livestreamId}:`,
      error
    );
    throw error;
  }
};

const canJoinLivestream = async (
  livestreamId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data } = await axiosInstance.get<CanJoinResponse>(
      `/livestreams/${livestreamId}/can-join?userId=${userId}`
    );
    return data.canJoin;
  } catch (error) {
    console.error(
      `Error checking join permission for livestream ${livestreamId}:`,
      error
    );
    throw error;
  }
};

// --- Export all functions under livestreamApi ---
export const livestreamApi = {
  getLivestreamsByCourse,
  getLivestreamById,
  getLivestreamsForEnrolledCourses,
  generateJoinToken,
  canJoinLivestream,
};
