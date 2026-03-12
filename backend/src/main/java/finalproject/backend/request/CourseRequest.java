package finalproject.backend.request;

import finalproject.backend.modal.CourseLevel;
import finalproject.backend.modal.CourseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {

    @NotBlank(message = "Course title is required")
    private String title;

    private String slug;  // optional — auto-generated from title if blank

    private String description;  // optional

    private String requirements;

    private CourseLevel level = CourseLevel.BEGINNER;

    private String language = "Khmer";

    private CourseStatus status = CourseStatus.DRAFT;

    private Boolean featured = false;
    private Boolean isFree = false;

    private BigDecimal price = BigDecimal.ZERO;


    @NotNull(message = "Category ID is required")
    private Integer categoryId;

    private Long instructorId;  // optional — auto-set from logged-in user if blank

    public Boolean getFree() {
        return isFree;
    }

    public void setFree(Boolean free) {
        isFree = free;
    }
}
