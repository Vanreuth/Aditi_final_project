package finalproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsTimelinePointResponse {
    private String label;
    private long enrollments;
    private long users;
    private long completions;
}
