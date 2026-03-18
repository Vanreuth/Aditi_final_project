package finalproject.backend.controller;

import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.DashboardAnalyticsResponse;
import finalproject.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardAnalyticsResponse>> getDashboardAnalytics(
            @RequestParam(defaultValue = "30d") String range
    ) {
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics(range));
    }
}
