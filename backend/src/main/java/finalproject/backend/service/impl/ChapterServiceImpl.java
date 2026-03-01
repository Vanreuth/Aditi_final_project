package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.ChapterMapper;
import finalproject.backend.modal.Chapter;
import finalproject.backend.modal.Course;
import finalproject.backend.repository.ChapterRepository;
import finalproject.backend.repository.CourseRepository;
import finalproject.backend.request.ChapterRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.ChapterResponse;
import finalproject.backend.service.ChapterService;
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
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;
    private final CourseRepository courseRepository;
    private final ChapterMapper chapterMapper;

    @Override
    @Transactional
    public ApiResponse<ChapterResponse> createChapter(ChapterRequest request) {
        Course course = findCourseOrThrow(request.getCourseId());

        if (chapterRepository.existsByTitleAndCourseId(request.getTitle(), request.getCourseId()))
            throw new CustomMessageException("Chapter title already exists in this course",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        // createdAt set by @PrePersist
        Chapter saved = chapterRepository.save(chapterMapper.toEntity(request, course));
        syncCourseTotalLessons(course);

        log.info("Created chapter id={} for course id={}", saved.getId(), course.getId());
        return ApiResponse.success(chapterMapper.toResponse(saved), "Chapter created successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<ChapterResponse>> getChaptersByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId))
            throw new CustomMessageException("Course not found with id: " + courseId,
                    String.valueOf(HttpStatus.NOT_FOUND.value()));

        List<ChapterResponse> chapters = chapterRepository
                .findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(chapterMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(chapters, "Chapters retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ChapterResponse> getChapterById(Long id) {
        return ApiResponse.success(
                chapterMapper.toResponse(findChapterOrThrow(id)),
                "Chapter retrieved successfully");
    }

    @Override
    @Transactional
    public ApiResponse<ChapterResponse> updateChapter(Long id, ChapterRequest request) {
        Chapter chapter = findChapterOrThrow(id);

        Course course = null;
        if (request.getCourseId() != null && !request.getCourseId().equals(chapter.getCourse().getId()))
            course = findCourseOrThrow(request.getCourseId());

        Long targetCourseId = course != null ? course.getId() : chapter.getCourse().getId();
        if (request.getTitle() != null && !request.getTitle().equals(chapter.getTitle())
                && chapterRepository.existsByTitleAndCourseId(request.getTitle(), targetCourseId))
            throw new CustomMessageException("Chapter title already exists in this course",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        chapterMapper.updateEntity(request, chapter, course);
        Chapter saved = chapterRepository.save(chapter);
        log.info("Updated chapter id={}", id);
        return ApiResponse.success(chapterMapper.toResponse(saved), "Chapter updated successfully");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteChapter(Long id) {
        Chapter chapter = findChapterOrThrow(id);
        Course course = chapter.getCourse();
        chapterRepository.delete(chapter);
        syncCourseTotalLessons(course);
        log.info("Deleted chapter id={}", id);
        return ApiResponse.success("Chapter deleted successfully");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Chapter findChapterOrThrow(Long id) {
        return chapterRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Chapter not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private Course findCourseOrThrow(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomMessageException(
                        "Course not found with id: " + courseId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private void syncCourseTotalLessons(Course course) {
        course.setTotalLessons(chapterRepository.countByCourseId(course.getId()));
        courseRepository.save(course);
    }
}
