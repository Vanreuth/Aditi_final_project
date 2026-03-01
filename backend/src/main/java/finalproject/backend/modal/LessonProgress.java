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
@Table(name = "lesson_progress",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_lesson",
                columnNames = {"user_id", "lesson_id"}
        ))
public class LessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "is_completed", columnDefinition = "boolean default false")
    private Boolean completed = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "scroll_pct", columnDefinition = "integer default 0")
    private Integer scrollPct = 0;

    @Column(name = "read_time_seconds", columnDefinition = "integer default 0")
    private Integer readTimeSeconds = 0;

    @Column(name = "pdf_downloaded", columnDefinition = "boolean default false")
    private Boolean pdfDownloaded = false;

    @Column(name = "pdf_downloaded_at")
    private LocalDateTime pdfDownloadedAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (completed       == null) completed       = false;
        if (scrollPct       == null) scrollPct       = 0;
        if (readTimeSeconds == null) readTimeSeconds = 0;
        if (pdfDownloaded   == null) pdfDownloaded   = false;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public void markCompleted() {
        this.completed   = true;
        this.completedAt = LocalDateTime.now();
        this.scrollPct   = 100;
    }
}
