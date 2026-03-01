package finalproject.backend.controller;

import finalproject.backend.request.LessonProgressRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.LessonProgressResponse;
import finalproject.backend.service.LessonProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lesson-progress")
@RequiredArgsConstructor
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

    @PostMapping
    public ResponseEntity<ApiResponse<LessonProgressResponse>> upsertProgress(
            @Valid @RequestBody LessonProgressRequest request) {
        return ResponseEntity.ok(lessonProgressService.upsertProgress(request));
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<LessonProgressResponse>> markCompleted(
            @RequestParam Long userId,
            @RequestParam Long lessonId) {
        return ResponseEntity.ok(lessonProgressService.markCompleted(userId, lessonId));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<LessonProgressResponse>> getProgress(
            @RequestParam Long userId,
            @RequestParam Long lessonId) {
        return ResponseEntity.ok(lessonProgressService.getProgress(userId, lessonId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<LessonProgressResponse>>> getProgressByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(lessonProgressService.getProgressByUser(userId));
    }

    @GetMapping("/user/{userId}/completed-count")
    public ResponseEntity<ApiResponse<Long>> countCompletedByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(lessonProgressService.countCompletedByUser(userId));
    }

    @GetMapping("/course/{courseId}/user/{userId}/completed-count")
    public ResponseEntity<ApiResponse<Long>> countCompletedByCourseAndUser(
            @PathVariable Long courseId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(lessonProgressService.countCompletedByCourseAndUser(courseId, userId));
    }
}

