import type { CourseResponse } from "@/types/courseType";
import type { UserResponse } from "@/types/userType";

export type AnalyticsRange = "7d" | "30d" | "90d";

export interface AnalyticsBreakdown {
  name: string;
  value: number;
  fill: string;
}

export interface AnalyticsCategory {
  name: string;
  courses: number;
}

export interface AnalyticsTimelinePoint {
  label: string;
  enrollments: number;
  users: number;
  completions: number;
}

export interface DashboardAnalyticsResponse {
  totalCourses: number;
  totalUsers: number;
  totalCategories: number;
  totalEnrollments: number;
  publishedCourses: number;
  draftCourses: number;
  featuredCourses: number;
  activeUsers: number;
  activeCategories: number;
  coursesByLevel: AnalyticsBreakdown[];
  coursesByCategory: AnalyticsCategory[];
  usersByRole: AnalyticsBreakdown[];
  recentCourses: CourseResponse[];
  recentUsers: UserResponse[];
  activitySeries: AnalyticsTimelinePoint[];
}
