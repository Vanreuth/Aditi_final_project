package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.LessonProgressMapper;
import finalproject.backend.modal.Lesson;
import finalproject.backend.modal.LessonProgress;
import finalproject.backend.modal.User;
import finalproject.backend.repository.LessonProgressRepository;
import finalproject.backend.repository.LessonRepository;
import finalproject.backend.repository.UserRepository;
import finalproject.backend.request.LessonProgressRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.LessonProgressResponse;
import finalproject.backend.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonProgressServiceImpl implements LessonProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final LessonProgressMapper lessonProgressMapper;

    @Override
    @Transactional
    public ApiResponse<LessonProgressResponse> upsertProgress(LessonProgressRequest request) {
        User user = findUserOrThrow(request.getUserId());
        Lesson lesson = findLessonOrThrow(request.getLessonId());

        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(request.getUserId(), request.getLessonId())
                .orElseGet(() -> LessonProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .build());

        progress.setScrollPct(request.getScrollPct());
        progress.setReadTimeSeconds(progress.getReadTimeSeconds() + request.getReadTimeSeconds());

        if (Boolean.TRUE.equals(request.isCompleted()) && !Boolean.TRUE.equals(progress.getCompleted())) {
            progress.markCompleted();
        }

        if (Boolean.TRUE.equals(request.isPdfDownloaded()) && !Boolean.TRUE.equals(progress.getPdfDownloaded())) {
            progress.setPdfDownloaded(true);
            progress.setPdfDownloadedAt(LocalDateTime.now());
        }

        LessonProgress saved = lessonProgressRepository.save(progress);
        log.info("Upserted lesson progress id={} for user={} lesson={}", saved.getId(), user.getId(), lesson.getId());
        return ApiResponse.success(lessonProgressMapper.toResponse(saved), "Progress saved successfully");
    }

    @Override
    @Transactional
    public ApiResponse<LessonProgressResponse> markCompleted(Long userId, Long lessonId) {
        User user = findUserOrThrow(userId);
        Lesson lesson = findLessonOrThrow(lessonId);

        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> LessonProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .build());

        progress.markCompleted();
        LessonProgress saved = lessonProgressRepository.save(progress);
        log.info("Marked lesson id={} completed for user id={}", lessonId, userId);
        return ApiResponse.success(lessonProgressMapper.toResponse(saved), "Lesson marked as completed");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<LessonProgressResponse> getProgress(Long userId, Long lessonId) {
        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElseThrow(() -> new CustomMessageException(
                        "Progress not found for user id: " + userId + " and lesson id: " + lessonId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
        return ApiResponse.success(lessonProgressMapper.toResponse(progress), "Progress retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<LessonProgressResponse>> getProgressByUser(Long userId) {
        if (!userRepository.existsById(userId))
            throw new CustomMessageException("User not found with id: " + userId,
                    String.valueOf(HttpStatus.NOT_FOUND.value()));

        List<LessonProgressResponse> list = lessonProgressRepository.findByUserId(userId)
                .stream()
                .map(lessonProgressMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(list, "Progress list retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countCompletedByUser(Long userId) {
        long count = lessonProgressRepository.countCompletedByUserId(userId);
        return ApiResponse.success(count, "Completed lesson count retrieved");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countCompletedByCourseAndUser(Long courseId, Long userId) {
        long count = lessonProgressRepository.countCompletedByCourseIdAndUserId(courseId, userId);
        return ApiResponse.success(count, "Completed lesson count for course retrieved");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "User not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private Lesson findLessonOrThrow(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Lesson not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }
}

