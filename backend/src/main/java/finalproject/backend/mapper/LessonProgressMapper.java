package finalproject.backend.mapper;

import finalproject.backend.modal.LessonProgress;
import finalproject.backend.request.LessonProgressRequest;
import finalproject.backend.response.LessonProgressResponse;
import org.springframework.stereotype.Component;

@Component
public class LessonProgressMapper {

    public LessonProgressResponse toResponse(LessonProgress progress) {
        return LessonProgressResponse.builder()
                .id(progress.getId())
                .completed(progress.getCompleted())
                .completedAt(progress.getCompletedAt())
                .scrollPct(progress.getScrollPct())
                .readTimeSeconds(progress.getReadTimeSeconds())
                .pdfDownloaded(progress.getPdfDownloaded())
                .pdfDownloadedAt(progress.getPdfDownloadedAt())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                .userId(progress.getUser() != null ? progress.getUser().getId() : null)
                .username(progress.getUser() != null ? progress.getUser().getUsername() : null)
                .lessonId(progress.getLesson() != null ? progress.getLesson().getId() : null)
                .lessonTitle(progress.getLesson() != null ? progress.getLesson().getTitle() : null)
                .build();
    }
}

