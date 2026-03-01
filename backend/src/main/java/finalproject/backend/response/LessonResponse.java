package finalproject.backend.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LessonResponse {

    private Long id;
    private String title;
    private String slug;
    private String description;
    private String content;
    private int orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Parent references
    private Long chapterId;
    private String chapterTitle;
    private Long courseId;
    private String courseTitle;

    // Nested code snippets (optional)
    private List<CodeSnippetResponse> codeSnippets;
}

