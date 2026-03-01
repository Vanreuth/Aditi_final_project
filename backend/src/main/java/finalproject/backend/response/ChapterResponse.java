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
public class ChapterResponse {

    private Long id;
    private String title;
    private String description;
    private String content;
    private Integer orderIndex;
    private Integer durationMinutes;
    private String videoUrl;
    private LocalDateTime createdAt;

    // Parent course info
    private Long courseId;
    private String courseTitle;

    // Nested lessons (populated only for full-course view)
    private List<LessonResponse> lessons;
}
