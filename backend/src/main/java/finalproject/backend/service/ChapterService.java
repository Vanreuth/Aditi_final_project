package finalproject.backend.service;

import finalproject.backend.request.ChapterRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.ChapterResponse;

import java.util.List;

public interface ChapterService {

    ApiResponse<ChapterResponse> createChapter(ChapterRequest request);
    ApiResponse<List<ChapterResponse>> getChaptersByCourse(Long courseId);
    ApiResponse<ChapterResponse> getChapterById(Long id);
    ApiResponse<ChapterResponse> updateChapter(Long id, ChapterRequest request);
    ApiResponse<Void> deleteChapter(Long id);
}
