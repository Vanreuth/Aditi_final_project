package finalproject.backend.modal;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "enrollments",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_course",
                columnNames = {"user_id", "course_id"}
        ))
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE / COMPLETED / CANCELLED

    @Column(name = "enrolled_at", updatable = false)
    private LocalDateTime enrolledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_accessed")
    private LocalDateTime lastAccessed;

    @Column(name = "progress_pct")
    private int progressPct = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @PrePersist
    protected void onCreate() {
        enrolledAt   = LocalDateTime.now();
        lastAccessed = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }

    public boolean isCompleted() { return "COMPLETED".equalsIgnoreCase(status); }
    public boolean isActive()    { return "ACTIVE".equalsIgnoreCase(status); }

}
