import { get } from "@/lib/api/client";
import type { AnalyticsRange, DashboardAnalyticsResponse } from "@/types/analyticsType";

const ANALYTICS_PATH = "/api/v1/admin/analytics";

export const analyticsService = {
  getDashboard: (range: AnalyticsRange = "30d"): Promise<DashboardAnalyticsResponse> =>
    get<DashboardAnalyticsResponse>(ANALYTICS_PATH, { params: { range } }),
};
