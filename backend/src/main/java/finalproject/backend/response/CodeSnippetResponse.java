package finalproject.backend.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CodeSnippetResponse {

    private Long id;
    private String title;
    private String code;
    private String language;
    private String explanation;
    private int orderIndex;
    private LocalDateTime createdAt;

    // Parent lesson
    private Long lessonId;
    private String lessonTitle;
}

