package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.LessonMapper;
import finalproject.backend.modal.Chapter;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import finalproject.backend.repository.ChapterRepository;
import finalproject.backend.repository.CourseRepository;
import finalproject.backend.repository.LessonRepository;
import finalproject.backend.request.LessonRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.LessonResponse;
import finalproject.backend.service.LessonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final CourseRepository courseRepository;
    private final LessonMapper lessonMapper;

    @Override
    @Transactional
    public ApiResponse<LessonResponse> createLesson(LessonRequest request) {
        Chapter chapter = findChapterOrThrow(request.getChapterId());
        Course course = findCourseOrThrow(request.getCourseId());

        if (lessonRepository.existsByTitleAndChapterId(request.getTitle(), request.getChapterId()))
            throw new CustomMessageException("Lesson title already exists in this chapter",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        Lesson saved = lessonRepository.save(lessonMapper.toEntity(request, chapter, course));
        syncCourseTotalLessons(course);
        log.info("Created lesson id={} for chapter id={}", saved.getId(), chapter.getId());
        return ApiResponse.success(lessonMapper.toSimpleResponse(saved), "Lesson created successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<LessonResponse>> getLessonsByChapter(Long chapterId) {
        if (!chapterRepository.existsById(chapterId))
            throw new CustomMessageException("Chapter not found with id: " + chapterId,
                    String.valueOf(HttpStatus.NOT_FOUND.value()));

        List<LessonResponse> lessons = lessonRepository
                .findByChapterIdOrderByOrderIndexAsc(chapterId)
                .stream()
                .map(lessonMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(lessons, "Lessons retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<LessonResponse>> getLessonsByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId))
            throw new CustomMessageException("Course not found with id: " + courseId,
                    String.valueOf(HttpStatus.NOT_FOUND.value()));

        List<LessonResponse> lessons = lessonRepository
                .findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(lessonMapper::toSimpleResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(lessons, "Lessons retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<LessonResponse> getLessonById(Long id) {
        return ApiResponse.success(
                lessonMapper.toResponse(findLessonOrThrow(id)),
                "Lesson retrieved successfully");
    }

    @Override
    @Transactional
    public ApiResponse<LessonResponse> updateLesson(Long id, LessonRequest request) {
        Lesson lesson = findLessonOrThrow(id);

        Chapter chapter = null;
        if (request.getChapterId() != null && !request.getChapterId().equals(lesson.getChapter().getId()))
            chapter = findChapterOrThrow(request.getChapterId());

        Course course = null;
        if (request.getCourseId() != null && !request.getCourseId().equals(lesson.getCourse().getId()))
            course = findCourseOrThrow(request.getCourseId());

        Long targetChapterId = chapter != null ? chapter.getId() : lesson.getChapter().getId();
        if (request.getTitle() != null && !request.getTitle().equals(lesson.getTitle())
                && lessonRepository.existsByTitleAndChapterId(request.getTitle(), targetChapterId))
            throw new CustomMessageException("Lesson title already exists in this chapter",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        lessonMapper.updateEntity(request, lesson, chapter, course);
        Lesson saved = lessonRepository.save(lesson);
        log.info("Updated lesson id={}", id);
        return ApiResponse.success(lessonMapper.toSimpleResponse(saved), "Lesson updated successfully");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteLesson(Long id) {
        Lesson lesson = findLessonOrThrow(id);
        Course course = lesson.getCourse();
        lessonRepository.delete(lesson);
        syncCourseTotalLessons(course);
        log.info("Deleted lesson id={}", id);
        return ApiResponse.success("Lesson deleted successfully");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Lesson findLessonOrThrow(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Lesson not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private Chapter findChapterOrThrow(Long id) {
        return chapterRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Chapter not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private Course findCourseOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Course not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private void syncCourseTotalLessons(Course course) {
        course.setTotalLessons(lessonRepository.countByCourseId(course.getId()));
        courseRepository.save(course);
    }
}

