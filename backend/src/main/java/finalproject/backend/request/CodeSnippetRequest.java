package finalproject.backend.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CodeSnippetRequest {

    private String title;

    @NotBlank(message = "Code content is required")
    private String code;

    @NotBlank(message = "Language is required")
    private String language;

    private String explanation;

    private int orderIndex = 0;

    @NotNull(message = "Lesson ID is required")
    private Long lessonId;
}

