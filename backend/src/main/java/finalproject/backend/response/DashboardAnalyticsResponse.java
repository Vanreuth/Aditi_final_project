package finalproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsResponse {
    private long totalCourses;
    private long totalUsers;
    private long totalCategories;
    private long totalEnrollments;
    private long publishedCourses;
    private long draftCourses;
    private long featuredCourses;
    private long activeUsers;
    private long activeCategories;
    private List<AnalyticsBreakdownResponse> coursesByLevel;
    private List<AnalyticsCategoryResponse> coursesByCategory;
    private List<AnalyticsBreakdownResponse> usersByRole;
    private List<CourseResponse> recentCourses;
    private List<UserResponse> recentUsers;
    private List<AnalyticsTimelinePointResponse> activitySeries;
}
