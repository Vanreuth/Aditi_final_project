package finalproject.backend.mapper;

import finalproject.backend.modal.CodeSnippet;
import finalproject.backend.modal.Lesson;
import finalproject.backend.request.CodeSnippetRequest;
import finalproject.backend.response.CodeSnippetResponse;
import org.springframework.stereotype.Component;

@Component
public class CodeSnippetMapper {

    public CodeSnippetResponse toResponse(CodeSnippet snippet) {
        return CodeSnippetResponse.builder()
                .id(snippet.getId())
                .title(snippet.getTitle())
                .code(snippet.getCode())
                .language(snippet.getLanguage())
                .explanation(snippet.getExplanation())
                .orderIndex(snippet.getOrderIndex())
                .createdAt(snippet.getCreatedAt())
                .lessonId(snippet.getLesson() != null ? snippet.getLesson().getId() : null)
                .lessonTitle(snippet.getLesson() != null ? snippet.getLesson().getTitle() : null)
                .build();
    }

    public CodeSnippet toEntity(CodeSnippetRequest request, Lesson lesson) {
        return CodeSnippet.builder()
                .title(request.getTitle())
                .code(request.getCode())
                .language(request.getLanguage())
                .explanation(request.getExplanation())
                .orderIndex(request.getOrderIndex())
                .lesson(lesson)
                .build();
    }

    public void updateEntity(CodeSnippetRequest request, CodeSnippet snippet, Lesson lesson) {
        if (request.getTitle() != null)
            snippet.setTitle(request.getTitle());

        if (request.getCode() != null && !request.getCode().isBlank())
            snippet.setCode(request.getCode());

        if (request.getLanguage() != null && !request.getLanguage().isBlank())
            snippet.setLanguage(request.getLanguage());

        if (request.getExplanation() != null)
            snippet.setExplanation(request.getExplanation());

        snippet.setOrderIndex(request.getOrderIndex());

        if (lesson != null)
            snippet.setLesson(lesson);
    }
}

