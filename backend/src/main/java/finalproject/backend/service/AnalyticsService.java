package finalproject.backend.service;

import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.DashboardAnalyticsResponse;

public interface AnalyticsService {
    ApiResponse<DashboardAnalyticsResponse> getDashboardAnalytics(String range);
}
