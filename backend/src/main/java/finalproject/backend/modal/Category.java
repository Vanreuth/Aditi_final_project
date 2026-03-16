package finalproject.backend.modal;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String thumbnail;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "order_index", columnDefinition = "integer default 0")
    private Integer orderIndex = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Course> courses = new LinkedHashSet<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt  == null) createdAt  = LocalDateTime.now();
        if (isActive   == null) isActive   = true;
        if (orderIndex == null) orderIndex = 0;
    }
}
