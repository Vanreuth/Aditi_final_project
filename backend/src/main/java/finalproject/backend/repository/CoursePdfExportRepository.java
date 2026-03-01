package finalproject.backend.repository;

import finalproject.backend.modal.CoursePdfExport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoursePdfExportRepository extends JpaRepository<CoursePdfExport, Long> {

    Optional<CoursePdfExport> findByCourseId(Long courseId);
    boolean existsByCourseId(Long courseId);
    void deleteByCourseId(Long courseId);
}

