package finalproject.backend.repository;

import finalproject.backend.modal.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    List<LessonProgress> findByUserId(Long userId);
    List<LessonProgress> findByLessonId(Long lessonId);

    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.completed = true")
    long countCompletedByUserId(Long userId);

    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.lesson.course.id = :courseId AND lp.user.id = :userId AND lp.completed = true")
    long countCompletedByCourseIdAndUserId(Long courseId, Long userId);

    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);
}

