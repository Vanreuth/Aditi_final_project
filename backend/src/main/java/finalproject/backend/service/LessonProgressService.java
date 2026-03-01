package finalproject.backend.service;

import finalproject.backend.request.LessonProgressRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.LessonProgressResponse;

import java.util.List;

public interface LessonProgressService {

    ApiResponse<LessonProgressResponse> upsertProgress(LessonProgressRequest request);
    ApiResponse<LessonProgressResponse> markCompleted(Long userId, Long lessonId);
    ApiResponse<LessonProgressResponse> getProgress(Long userId, Long lessonId);
    ApiResponse<List<LessonProgressResponse>> getProgressByUser(Long userId);
    ApiResponse<Long> countCompletedByUser(Long userId);
    ApiResponse<Long> countCompletedByCourseAndUser(Long courseId, Long userId);
}

