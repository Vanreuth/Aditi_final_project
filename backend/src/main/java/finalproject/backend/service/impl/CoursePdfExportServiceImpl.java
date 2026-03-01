package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.CoursePdfExportMapper;
import finalproject.backend.modal.*;
import finalproject.backend.repository.CoursePdfExportRepository;
import finalproject.backend.repository.CourseRepository;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CoursePdfExportResponse;
import finalproject.backend.service.CoursePdfExportService;
import finalproject.backend.service.CoursePdfGeneratorService;
import finalproject.backend.service.R2StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoursePdfExportServiceImpl implements CoursePdfExportService {

    private final CoursePdfExportRepository pdfExportRepository;
    private final CourseRepository          courseRepository;
    private final CoursePdfExportMapper     pdfExportMapper;
    private final CoursePdfGeneratorService pdfGeneratorService;
    private final R2StorageService          r2StorageService;

    // ── GET ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CoursePdfExportResponse> getPdfExportByCourse(Long courseId) {
        CoursePdfExport export = pdfExportRepository.findByCourseId(courseId)
                .orElseThrow(() -> new CustomMessageException(
                        "PDF export not found for course id: " + courseId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
        return ApiResponse.success(pdfExportMapper.toResponse(export),
                "PDF export retrieved successfully");
    }

    // ── SAVE (upsert) ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<CoursePdfExportResponse> savePdfExport(Long courseId, String pdfUrl,
                                                               String pdfName, Long pdfSizeKb,
                                                               int totalPages, int totalLessonsIncluded) {
        Course course = findCourseOrThrow(courseId);

        CoursePdfExport export = pdfExportRepository.findByCourseId(courseId)
                .orElseGet(() -> CoursePdfExport.builder().course(course).build());

        export.setPdfUrl(pdfUrl);
        export.setPdfName(pdfName);
        export.setPdfSizeKb(pdfSizeKb);
        export.setTotalPages(totalPages);
        export.setTotalLessonsIncluded(totalLessonsIncluded);
        export.setGeneratedAt(LocalDateTime.now());

        CoursePdfExport saved = pdfExportRepository.save(export);
        log.info("Saved PDF export for course id={}", courseId);
        return ApiResponse.success(pdfExportMapper.toResponse(saved),
                "PDF export saved successfully");
    }

    // ── GENERATE ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<CoursePdfExportResponse> generatePdf(Long courseId) {
        Course course = findCourseOrThrow(courseId);

        // Generate PDF bytes using the dedicated generator service
        byte[] pdfBytes = pdfGeneratorService.generate(course);

        // Build a clean filename
        String pdfName = course.getTitle().replaceAll("[^a-zA-Z0-9\\-_]", "-") + ".pdf";

        // Upload to R2 and get back the public URL
        String pdfUrl = r2StorageService.uploadBytes(pdfBytes, "course-pdfs", pdfName, "application/pdf");

        // Upsert the export metadata record
        CoursePdfExport export = pdfExportRepository.findByCourseId(courseId)
                .orElseGet(() -> CoursePdfExport.builder().course(course).build());

        // If regenerating, delete the old R2 object first
        if (export.getPdfUrl() != null && !export.getPdfUrl().isBlank()) {
            try { r2StorageService.deleteFile(export.getPdfUrl()); }
            catch (Exception e) { log.warn("Could not delete old PDF from R2: {}", e.getMessage()); }
        }

        export.setPdfName(pdfName);
        export.setPdfUrl(pdfUrl);
        export.setPdfSizeKb((long) (pdfBytes.length / 1024));
        export.setTotalPages(0);
        export.setTotalLessonsIncluded(
                course.getChapters().stream()
                        .mapToInt(ch -> ch.getLessons().size())
                        .sum());
        export.setGeneratedAt(LocalDateTime.now());

        CoursePdfExport saved = pdfExportRepository.save(export);
        log.info("Generated & uploaded PDF for course id={} → {}", courseId, pdfUrl);
        return ApiResponse.success(pdfExportMapper.toResponse(saved),
                "PDF generated successfully");
    }

    // ── INCREMENT DOWNLOAD ────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<CoursePdfExportResponse> incrementDownloadCount(Long courseId) {
        CoursePdfExport export = pdfExportRepository.findByCourseId(courseId)
                .orElseThrow(() -> new CustomMessageException(
                        "PDF export not found for course id: " + courseId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
        export.setDownloadCount(export.getDownloadCount() + 1);
        CoursePdfExport saved = pdfExportRepository.save(export);
        log.info("Incremented download count for course id={} → {}", courseId,
                saved.getDownloadCount());
        return ApiResponse.success(pdfExportMapper.toResponse(saved),
                "Download count updated");
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<Void> deletePdfExport(Long courseId) {
        if (!pdfExportRepository.existsByCourseId(courseId))
            throw new CustomMessageException(
                    "PDF export not found for course id: " + courseId,
                    String.valueOf(HttpStatus.NOT_FOUND.value()));
        pdfExportRepository.deleteByCourseId(courseId);
        log.info("Deleted PDF export for course id={}", courseId);
        return ApiResponse.success("PDF export deleted successfully");
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private Course findCourseOrThrow(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomMessageException(
                        "Course not found with id: " + courseId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }
}
