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
@Table(name = "code_snippets")
public class CodeSnippet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 200)
    private String title;               // "Hello World Example"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String code;                // source code

    @Column(nullable = false, length = 50)
    private String language;            // java / html / python / c / javascript / sql

    @Column(columnDefinition = "TEXT")
    private String explanation;         // shown below code block

    @Column(name = "order_index", columnDefinition = "integer default 0")
    private Integer orderIndex = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (orderIndex == null) orderIndex = 0;
    }
}
