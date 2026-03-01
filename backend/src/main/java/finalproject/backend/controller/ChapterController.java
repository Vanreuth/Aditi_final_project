package finalproject.backend.controller;

import finalproject.backend.request.ChapterRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.ChapterResponse;
import finalproject.backend.service.ChapterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getChaptersByCourse(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(chapterService.getChaptersByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChapterResponse>> getChapterById(@PathVariable Long id) {
        return ResponseEntity.ok(chapterService.getChapterById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChapterResponse>> createChapter(
            @Valid @RequestBody ChapterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(chapterService.createChapter(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ChapterResponse>> updateChapter(
            @PathVariable Long id,
            @Valid @RequestBody ChapterRequest request) {
        return ResponseEntity.ok(chapterService.updateChapter(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(@PathVariable Long id) {
        return ResponseEntity.ok(chapterService.deleteChapter(id));
    }
}
