package finalproject.backend.mapper;

import finalproject.backend.modal.Chapter;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import finalproject.backend.request.LessonRequest;
import finalproject.backend.response.LessonResponse;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class LessonMapper {

    private final CodeSnippetMapper codeSnippetMapper;

    public LessonMapper(CodeSnippetMapper codeSnippetMapper) {
        this.codeSnippetMapper = codeSnippetMapper;
    }

    public LessonResponse toResponse(Lesson lesson) {
        LessonResponse.LessonResponseBuilder builder = LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .slug(lesson.getSlug())
                .description(lesson.getDescription())
                .content(lesson.getContent())
                .orderIndex(lesson.getOrderIndex())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .chapterId(lesson.getChapter() != null ? lesson.getChapter().getId() : null)
                .chapterTitle(lesson.getChapter() != null ? lesson.getChapter().getTitle() : null)
                .courseId(lesson.getCourse() != null ? lesson.getCourse().getId() : null)
                .courseTitle(lesson.getCourse() != null ? lesson.getCourse().getTitle() : null);

        if (lesson.getCodeSnippets() != null && !lesson.getCodeSnippets().isEmpty()) {
            builder.codeSnippets(lesson.getCodeSnippets().stream()
                    .map(codeSnippetMapper::toResponse)
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }

    public LessonResponse toSimpleResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .slug(lesson.getSlug())
                .description(lesson.getDescription())
                .content(lesson.getContent())
                .orderIndex(lesson.getOrderIndex())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .chapterId(lesson.getChapter() != null ? lesson.getChapter().getId() : null)
                .chapterTitle(lesson.getChapter() != null ? lesson.getChapter().getTitle() : null)
                .courseId(lesson.getCourse() != null ? lesson.getCourse().getId() : null)
                .courseTitle(lesson.getCourse() != null ? lesson.getCourse().getTitle() : null)
                .build();
    }

    public Lesson toEntity(LessonRequest request, Chapter chapter, Course course) {
        return Lesson.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .content(request.getContent())
                .orderIndex(request.getOrderIndex())
                .chapter(chapter)
                .course(course)
                .build();
    }

    public void updateEntity(LessonRequest request, Lesson lesson, Chapter chapter, Course course) {
        if (request.getTitle() != null && !request.getTitle().isBlank())
            lesson.setTitle(request.getTitle());

        if (request.getDescription() != null)
            lesson.setDescription(request.getDescription());

        if (request.getContent() != null)
            lesson.setContent(request.getContent());

        lesson.setOrderIndex(request.getOrderIndex());

        if (chapter != null)
            lesson.setChapter(chapter);

        if (course != null)
            lesson.setCourse(course);
    }
}

