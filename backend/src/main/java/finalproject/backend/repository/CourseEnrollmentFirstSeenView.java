package finalproject.backend.repository;

import java.time.LocalDateTime;

public interface CourseEnrollmentFirstSeenView {
    Long getCourseId();
    Long getUserId();
    LocalDateTime getFirstSeenAt();
}
