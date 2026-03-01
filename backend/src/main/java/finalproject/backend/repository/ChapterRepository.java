package finalproject.backend.repository;

import finalproject.backend.modal.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByCourseIdOrderByOrderIndexAsc(Long courseId);
    boolean existsByTitleAndCourseId(String title, Long courseId);
    int countByCourseId(Long courseId);
    Optional<Chapter> findByCourseIdAndTitle(Long courseId, String title);
}
