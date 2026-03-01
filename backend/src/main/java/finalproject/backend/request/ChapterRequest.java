package finalproject.backend.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChapterRequest {

    @NotBlank(message = "Chapter title is required")
    private String title;

    private String description;

    private Integer orderIndex = 0;

    @NotNull(message = "Course ID is required")
    private Long courseId;
}
