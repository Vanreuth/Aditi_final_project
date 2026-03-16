package finalproject.backend.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface R2StorageService {

    // ── Image upload (MultipartFile) ──────────────────────────────────────────
    String uploadFile(MultipartFile file, String folder) throws IOException;

    // ── Raw bytes upload (generic) ────────────────────────────────────────────
    String uploadBytes(byte[] bytes, String folder, String filename, String contentType);

    // ── PDF upload (convenience — uses uploadBytes internally) ────────────────
    // Returns: https://cdn.codegrowthkh.site/course-pdfs/{uuid}-{slug}.pdf
    String uploadPdf(byte[] pdfBytes, String courseSlug);

    // ── Delete by public URL ──────────────────────────────────────────────────
    void deleteFile(String publicUrl);

    // ── Replace old file with new ─────────────────────────────────────────────
    String replaceFile(String oldPublicUrl, MultipartFile newFile, String folder) throws IOException;

    // ── Extract R2 object key from CDN URL ────────────────────────────────────
    String extractKeyFromUrl(String publicUrl);
}