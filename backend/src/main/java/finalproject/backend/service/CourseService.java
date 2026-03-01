package finalproject.backend.service;

import finalproject.backend.request.CourseRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CourseResponse;
import finalproject.backend.response.LessonResponse;
import finalproject.backend.response.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface CourseService {

    ApiResponse<CourseResponse> createCourse(CourseRequest request, MultipartFile thumbnail);
    PageResponse<CourseResponse> getAllCourses(Pageable pageable);
    ApiResponse<CourseResponse> getCourseById(Long id);
    ApiResponse<CourseResponse> getCourseBySlug(String slug);

    /** Returns full course with all chapters + lessons nested. */
    ApiResponse<CourseResponse> getCourseWithChapters(String slug);

    /** Returns a single lesson (with code snippets) scoped to a course slug. */
    ApiResponse<LessonResponse> getLessonBySlug(String courseSlug, String lessonSlug);

    PageResponse<CourseResponse> getCoursesByCategory(int categoryId, Pageable pageable);
    PageResponse<CourseResponse> getCoursesByInstructor(Long instructorId, Pageable pageable);
    ApiResponse<CourseResponse> updateCourse(Long id, CourseRequest request, MultipartFile thumbnail);
    ApiResponse<Void> deleteCourse(Long id);
}
