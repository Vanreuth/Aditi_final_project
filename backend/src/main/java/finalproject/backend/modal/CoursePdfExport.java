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
@Table(name = "course_pdf_exports",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_course_pdf",
                columnNames = {"course_id"}
        ))
public class CoursePdfExport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── PDF file info ────────────────────────────────────────────────────────
    @Column(name = "pdf_url", nullable = false, length = 500)
    private String pdfUrl;              // R2 URL of merged PDF

    @Column(name = "pdf_name", nullable = false, length = 200)
    private String pdfName;             // "HTML-Beginner-Full-Course.pdf"

    @Column(name = "pdf_size_kb")
    private Long pdfSizeKb;

    @Column(name = "total_pages", columnDefinition = "integer default 0")
    private Integer totalPages = 0;         // total pages in merged PDF

    @Column(name = "total_lessons_included", columnDefinition = "integer default 0")
    private Integer totalLessonsIncluded = 0;

    @Column(name = "download_count", columnDefinition = "integer default 0")
    private Integer downloadCount = 0;      // how many times downloaded

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;  // when this PDF was generated

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ─── Relationships ────────────────────────────────────────────────────────

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @PrePersist
    protected void onCreate() {
        if (createdAt             == null) createdAt             = LocalDateTime.now();
        if (generatedAt           == null) generatedAt           = LocalDateTime.now();
        if (totalPages            == null) totalPages            = 0;
        if (totalLessonsIncluded  == null) totalLessonsIncluded  = 0;
        if (downloadCount         == null) downloadCount         = 0;
    }
}
