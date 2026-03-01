package finalproject.backend.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseResponse {

    private Long id;
    private String title;
    private String slug;
    private String description;
    private String thumbnail;
    private String requirements;
    private String level;
    private String language;
    private String status;
    private Boolean isFeatured;
    private Boolean isFree;
    private Integer totalLessons;
    private BigDecimal avgRating;
    private String pdfUrl;
    private String pdfName;
    private Long pdfSizeKb;
    private LocalDateTime pdfUpdatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    // Nested summary info
    private Long instructorId;
    private String instructorName;
    private Integer categoryId;
    private String categoryName;

    // Full course view — chapters with lessons (populated only on /full endpoint)
    private List<ChapterResponse> chapters;
}
