package finalproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorStatsResponse {
    private long totalCourses;
    private long totalStudents;
    private BigDecimal totalRevenue;
}