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
@Table(
        name = "course_pdf_exports",
        uniqueConstraints = @UniqueConstraint(
                name  = "uk_course_pdf",
                columnNames = {"course_id"}
        )
)
public class CoursePdfExport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── PDF file info (single source of truth) ───────────────────────────────

    /** Full CDN URL — e.g. https://cdn.codegrowthkh.site/course-pdfs/xxx.pdf */
    @Column(name = "pdf_url", nullable = false, length = 500)
    private String pdfUrl;

    /** Human-readable filename — e.g. "Java-ខ្មែរ-1.pdf" */
    @Column(name = "pdf_name", nullable = false, length = 200)
    private String pdfName;

    /** File size in KB */
    @Column(name = "pdf_size_kb")
    private Long pdfSizeKb;

    /** Total pages in the generated PDF */
    @Column(name = "total_pages", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer totalPages = 0;

    /** Number of lessons included in this PDF */
    @Column(name = "total_lessons_included", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer totalLessonsIncluded = 0;

    /** How many times this PDF has been downloaded */
    @Column(name = "download_count", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer downloadCount = 0;

    /** When this PDF was last generated / regenerated */
    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    /** Row creation timestamp — never changes after insert */
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ─── Relationship ─────────────────────────────────────────────────────────

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        if (createdAt            == null) createdAt            = LocalDateTime.now();
        if (generatedAt          == null) generatedAt          = LocalDateTime.now();
        if (totalPages           == null) totalPages           = 0;
        if (totalLessonsIncluded == null) totalLessonsIncluded = 0;
        if (downloadCount        == null) downloadCount        = 0;
    }
}