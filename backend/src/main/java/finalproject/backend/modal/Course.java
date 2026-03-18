package finalproject.backend.modal;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "course")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT DEFAULT ''")
    @Builder.Default
    private String description = "";

    private String thumbnail;

    @Column(columnDefinition = "TEXT")
    private String requirements;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CourseLevel level = CourseLevel.BEGINNER;


    @Column(nullable = false)
    @Builder.Default
    private String language = "Khmer";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_free")
    @Builder.Default
    private Boolean isFree = false;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "total_lessons", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer totalLessons = 0;

    @Column(name = "order_index", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer orderIndex = 0;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO; // 0.00–5.00

    @Column(name = "view_count", columnDefinition = "bigint default 0")
    @Builder.Default
    private Long viewCount = 0L; // number of times the course page was viewed

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "course_categories",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new LinkedHashSet<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();

    @OneToOne(mappedBy = "course", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private CoursePdfExport pdfExport;


    @PrePersist
    protected void onCreate() {
        if (createdAt    == null) createdAt    = LocalDateTime.now();
        if (description  == null) description  = "";
        if (status       == null) status       = CourseStatus.DRAFT;
        if (level        == null) level        = CourseLevel.BEGINNER;
        if (isFeatured   == null) isFeatured   = false;
        if (isFree       == null) isFree       = false;
        if (price        == null) price        = BigDecimal.ZERO;
        if (totalLessons == null) totalLessons = 0;
        if (orderIndex   == null) orderIndex   = 0;
        if (viewCount    == null) viewCount    = 0L;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (CourseStatus.PUBLISHED == status && publishedAt == null)
            publishedAt = LocalDateTime.now();
    }
}
