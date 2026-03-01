package finalproject.backend.service;

import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CoursePdfExportResponse;

public interface CoursePdfExportService {

    ApiResponse<CoursePdfExportResponse> getPdfExportByCourse(Long courseId);
    ApiResponse<CoursePdfExportResponse> savePdfExport(Long courseId, String pdfUrl,
                                                        String pdfName, Long pdfSizeKb,
                                                        int totalPages, int totalLessonsIncluded);
    ApiResponse<CoursePdfExportResponse> incrementDownloadCount(Long courseId);
    ApiResponse<Void> deletePdfExport(Long courseId);

    /** Generate (or regenerate) the PDF for the given course and persist the metadata. */
    ApiResponse<CoursePdfExportResponse> generatePdf(Long courseId);
}

