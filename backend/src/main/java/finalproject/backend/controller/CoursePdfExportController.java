package finalproject.backend.controller;

import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CoursePdfExportResponse;
import finalproject.backend.service.CoursePdfExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course-pdf-exports")
@RequiredArgsConstructor
public class CoursePdfExportController {

    private final CoursePdfExportService coursePdfExportService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<CoursePdfExportResponse>> getPdfExportByCourse(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(coursePdfExportService.getPdfExportByCourse(courseId));
    }

    @PostMapping("/course/{courseId}/download")
    public ResponseEntity<ApiResponse<CoursePdfExportResponse>> incrementDownloadCount(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(coursePdfExportService.incrementDownloadCount(courseId));
    }

    @PostMapping("/course/{courseId}/generate")
    public ResponseEntity<ApiResponse<CoursePdfExportResponse>> generate(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(coursePdfExportService.generatePdf(courseId));
    }

    @DeleteMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deletePdfExport(@PathVariable Long courseId) {
        return ResponseEntity.ok(coursePdfExportService.deletePdfExport(courseId));
    }
}

