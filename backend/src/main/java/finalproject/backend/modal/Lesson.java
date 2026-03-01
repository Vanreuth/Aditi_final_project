package finalproject.backend.modal;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "lessons",
        uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "slug"}))
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // Unique per course (not globally) — avoids collision with Khmer titles
    @Column(nullable = false)
    private String slug;

    @Column(length = 500)
    private String description;

    // ─── Document content ───────────
    @Column(columnDefinition = "TEXT")
    private String content;


    @Column(name = "order_index", columnDefinition = "integer default 0")
    private Integer orderIndex = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<CodeSnippet> codeSnippets = new ArrayList<>();

    @OneToMany(mappedBy = "lesson", fetch = FetchType.LAZY)
    @Builder.Default
    private List<LessonProgress> progressList = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (orderIndex == null) orderIndex = 0;
        if (slug == null || slug.isBlank()) slug = generateSlug();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Re-generate slug if it looks broken (empty after stripping, or still has trailing hyphen only)
        if (slug == null || slug.isBlank() || slug.equals("-")) slug = generateSlug();
    }

    // ─── Slug helpers ─────────────────────────────────────────────────────────

    /**
     * Generates a URL-friendly slug from the title.
     * - Latin titles  : "useState Hook"      → "usestate-hook"
     * - Mixed titles  : "React គឺជាអ្វី?"    → "react"  (keeps Latin part)
     * - Pure Khmer    : "ការណែនាំ"            → "lesson-ch<chapterId>-<orderIndex>"
     */
    private String generateSlug() {
        if (title == null) return buildFallbackSlug();

        // Normalise: lowercase, keep ASCII letters/digits/spaces/hyphens only
        String base = title.trim().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")   // strip non-ASCII (Khmer, etc.)
                .replaceAll("\\s+", "-")            // spaces → hyphen
                .replaceAll("-{2,}", "-")           // collapse multiple hyphens
                .replaceAll("^-|-$", "");           // trim leading/trailing hyphens

        // If nothing useful remains (pure Khmer title), fall back to positional slug
        return base.isBlank() ? buildFallbackSlug() : base;
    }

    /** chapter-id + orderIndex guarantees uniqueness within a course. */
    private String buildFallbackSlug() {
        Long chId = (chapter != null) ? chapter.getId() : 0L;
        int ord  = (orderIndex != null) ? orderIndex : 0;
        return "lesson-ch" + chId + "-" + ord;
    }
}
