package finalproject.backend.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LessonProgressRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Lesson ID is required")
    private Long lessonId;

    private boolean completed = false;

    @Min(0) @Max(100)
    private int scrollPct = 0;

    @Min(0)
    private int readTimeSeconds = 0;

    private boolean pdfDownloaded = false;
}

