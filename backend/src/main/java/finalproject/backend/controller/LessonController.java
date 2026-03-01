package finalproject.backend.controller;

import finalproject.backend.request.LessonRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.LessonResponse;
import finalproject.backend.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessonsByChapter(
            @PathVariable Long chapterId) {
        return ResponseEntity.ok(lessonService.getLessonsByChapter(chapterId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessonsByCourse(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getLessonsByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LessonResponse>> getLessonById(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getLessonById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(
            @Valid @RequestBody LessonRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(lessonService.createLesson(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(
            @PathVariable Long id,
            @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.deleteLesson(id));
    }
}

