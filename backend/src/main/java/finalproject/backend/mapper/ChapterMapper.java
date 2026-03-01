package finalproject.backend.mapper;

import finalproject.backend.modal.Chapter;
import finalproject.backend.modal.Course;
import finalproject.backend.request.ChapterRequest;
import finalproject.backend.response.ChapterResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ChapterMapper {

    private final LessonMapper lessonMapper;

    public ChapterResponse toResponse(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .content(chapter.getContent())
                .orderIndex(chapter.getOrderIndex())
                .durationMinutes(chapter.getDurationMinutes())
                .videoUrl(chapter.getVideoUrl())
                .createdAt(chapter.getCreatedAt())
                .courseId(chapter.getCourse() != null ? chapter.getCourse().getId() : null)
                .courseTitle(chapter.getCourse() != null ? chapter.getCourse().getTitle() : null)
                .build();
    }

    /** Includes nested lessons — used for the /full course endpoint. */
    public ChapterResponse toResponseWithLessons(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .content(chapter.getContent())
                .orderIndex(chapter.getOrderIndex())
                .durationMinutes(chapter.getDurationMinutes())
                .videoUrl(chapter.getVideoUrl())
                .createdAt(chapter.getCreatedAt())
                .courseId(chapter.getCourse() != null ? chapter.getCourse().getId() : null)
                .courseTitle(chapter.getCourse() != null ? chapter.getCourse().getTitle() : null)
                .lessons(chapter.getLessons() != null
                        ? chapter.getLessons().stream()
                                .map(lessonMapper::toSimpleResponse)
                                .collect(Collectors.toList())
                        : null)
                .build();
    }

    public Chapter toEntity(ChapterRequest request, Course course) {
        return Chapter.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex())
                .course(course)
                .build();
    }

    public void updateEntity(ChapterRequest request, Chapter chapter, Course course) {
        if (request.getTitle() != null && !request.getTitle().isBlank())
            chapter.setTitle(request.getTitle());

        if (request.getDescription() != null)
            chapter.setDescription(request.getDescription());

        chapter.setOrderIndex(request.getOrderIndex());

        if (course != null)
            chapter.setCourse(course);
    }
}
