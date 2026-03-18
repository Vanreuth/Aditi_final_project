package finalproject.backend.repository;

import finalproject.backend.modal.CodeSnippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodeSnippetRepository extends JpaRepository<CodeSnippet, Long> {

    List<CodeSnippet> findByLessonIdOrderByOrderIndexAsc(Long lessonId);
    boolean existsByTitleAndLessonId(String title, Long lessonId);
    Optional<CodeSnippet> findByTitleAndLessonId(String title, Long lessonId);
    int countByLessonId(Long lessonId);
    void deleteByLessonId(Long lessonId);
}

