package finalproject.backend.service;

import finalproject.backend.request.LessonRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.LessonResponse;

import java.util.List;

public interface LessonService {

    ApiResponse<LessonResponse> createLesson(LessonRequest request);
    ApiResponse<List<LessonResponse>> getLessonsByChapter(Long chapterId);
    ApiResponse<List<LessonResponse>> getLessonsByCourse(Long courseId);
    ApiResponse<LessonResponse> getLessonById(Long id);
    ApiResponse<LessonResponse> updateLesson(Long id, LessonRequest request);
    ApiResponse<Void> deleteLesson(Long id);
}

