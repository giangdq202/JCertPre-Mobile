// src/services/livestreamService.ts
import axios from "axios";
import { BASE_URL } from "../const/apiUrl/baseUrl";
import { getAuthToken } from "../auth/AuthUtils";

export enum LivestreamStatus {
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
}

export interface LivestreamDto {
  livestreamId: string;
  courseId: string;
  description?: string;
  scheduledDateTime: string;
  durationMinutes: number;
  status: LivestreamStatus;
  courseName?: string;
  endDateTime: string;
  isLive: boolean;
  isScheduled: boolean;
  canStart: boolean;
}

export interface LivestreamJoinDto {
  token: string;
  roomName: string;
  title: string;
  scheduledDateTime: string;
  description?: string;
  durationMinutes: number;
}

export interface LivestreamTimetableDto {
  livestreamId: string;
  courseId: string;
  courseName: string;
  description?: string;
  scheduledDateTime: string;
  durationMinutes: number;
  status: LivestreamStatus;
  endDateTime: string;
  isLive: boolean;
  canJoin: boolean;
  canStart: boolean;
  userRole: "STUDENT";
  startsWithin15Minutes: boolean;
  timeStatus: string;
}

class LivestreamApiService {
  private api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  private async authHeader() {
    const token = await getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get livestreams by course (student view)
  async getLivestreamsByCourse(courseId: string): Promise<LivestreamDto[]> {
    try {
      const headers = await this.authHeader();
      const res = await this.api.get(`/livestreams?courseId=${courseId}`, {
        headers,
      });
      return res.data;
    } catch (error: any) {
      console.error("Failed to fetch livestreams by course:", error);
      throw error;
    }
  }

  // Get livestream timetable for student
  async getLivestreamTimetable(
    userId: string
  ): Promise<LivestreamTimetableDto[]> {
    try {
      const headers = await this.authHeader();
      const res = await this.api.get(
        `/livestreams?userId=${userId}&timetableFormat=true`,
        { headers }
      );
      return res.data;
    } catch (error: any) {
      console.error("Failed to fetch livestream timetable:", error);
      throw error;
    }
  }

  // Generate join token for student
  async generateJoinToken(
    livestreamId: string,
    userId: string
  ): Promise<LivestreamJoinDto> {
    try {
      const headers = await this.authHeader();
      const res = await this.api.get(
        `/livestreams/${livestreamId}/join-token?userId=${userId}`,
        { headers }
      );
      return res.data;
    } catch (error: any) {
      console.error("Failed to generate join token:", error);
      throw error;
    }
  }

  // Check if student can join livestream
  async canJoinLivestream(
    livestreamId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const headers = await this.authHeader();
      const res = await this.api.get(
        `/livestreams/${livestreamId}/can-join?userId=${userId}`,
        { headers }
      );
      return res.data.canJoin;
    } catch (error: any) {
      console.error("Failed to check join permission:", error);
      throw error;
    }
  }
}

export const livestreamApi = new LivestreamApiService();
