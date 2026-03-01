package finalproject.backend.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LessonRequest {

    @NotBlank(message = "Lesson title is required")
    private String title;

    private String description;

    private String content;

    private int orderIndex = 0;

    @NotNull(message = "Chapter ID is required")
    private Long chapterId;

    @NotNull(message = "Course ID is required")
    private Long courseId;
}

