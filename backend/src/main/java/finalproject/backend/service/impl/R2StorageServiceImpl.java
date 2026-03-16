package finalproject.backend.service.impl;

import finalproject.backend.config.R2Properties;
import finalproject.backend.exception.FileStorageException;
import finalproject.backend.service.R2StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class R2StorageServiceImpl implements R2StorageService {

    private final S3Client s3Client;
    private final R2Properties r2Properties;

    // ─── Allowed image types ──────────────────────────────────────────────────
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    // ─── Allowed PDF type ─────────────────────────────────────────────────────
    private static final String PDF_CONTENT_TYPE = "application/pdf";

    private static final long MAX_IMAGE_SIZE = 5  * 1024 * 1024L;  // 5 MB
    private static final long MAX_PDF_SIZE   = 50 * 1024 * 1024L;  // 50 MB

    // ═══════════════════════════════════════════════════════════════════════════
    //  IMAGE UPLOAD  (MultipartFile — for course thumbnails etc.)
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        validateImageFile(file);

        String fileKey = buildKey(folder, file.getOriginalFilename());

        try {
            PutObjectRequest req = PutObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(fileKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(req, RequestBody.fromBytes(file.getBytes()));

            String publicUrl = buildPublicUrl(fileKey);
            log.info("✅ Image uploaded: {}", publicUrl);
            return publicUrl;

        } catch (S3Exception e) {
            log.error("❌ Image upload failed: {}", e.getMessage());
            throw new FileStorageException("Failed to upload image: " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  BYTES UPLOAD  (used by CoursePdfGeneratorService for PDFs)
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public String uploadBytes(byte[] bytes, String folder, String filename, String contentType) {
        validateBytes(bytes, contentType);

        String fileKey = folder + "/" + filename;

        try {
            PutObjectRequest req = PutObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(fileKey)
                    .contentType(contentType)
                    .contentLength((long) bytes.length)
                    .cacheControl(
                            PDF_CONTENT_TYPE.equals(contentType)
                                    ? "no-store, no-cache, max-age=0, must-revalidate"
                                    : "public, max-age=31536000, immutable"
                    )
                    // Makes PDF directly downloadable in browser
                    .contentDisposition(
                            PDF_CONTENT_TYPE.equals(contentType)
                                    ? "inline"
                                    : "attachment"
                    )
                    .build();

            s3Client.putObject(req, RequestBody.fromBytes(bytes));

            String publicUrl = buildPublicUrl(fileKey);
            log.info("✅ Bytes uploaded: {} ({} KB)", publicUrl, bytes.length / 1024);
            return publicUrl;

        } catch (S3Exception e) {
            log.error("❌ Bytes upload failed: {}", e.getMessage());
            throw new FileStorageException("Failed to upload bytes: " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  PDF UPLOAD  (convenience method — wraps uploadBytes)
    //  Usage: r2.uploadPdf(pdfBytes, course.getSlug())
    //  Returns: https://cdn.codegrowthkh.site/course-pdfs/courses/{course-slug}.pdf
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public String uploadPdf(byte[] pdfBytes, String courseSlug) {
        String filename = courseSlug + ".pdf";
        return uploadBytes(pdfBytes, "course-pdfs/courses", filename, PDF_CONTENT_TYPE);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  DELETE
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public void deleteFile(String publicUrl) {
        if (!StringUtils.hasText(publicUrl)) return;

        String fileKey = extractKeyFromUrl(publicUrl);
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(fileKey)
                    .build());
            log.info("✅ File deleted: {}", fileKey);
        } catch (S3Exception e) {
            log.error("❌ Delete failed: {}", e.getMessage());
            throw new FileStorageException("Failed to delete file: " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  REPLACE  (delete old + upload new)
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public String replaceFile(String oldPublicUrl, MultipartFile newFile, String folder) throws IOException {
        if (StringUtils.hasText(oldPublicUrl)) {
            deleteFile(oldPublicUrl);
        }
        return uploadFile(newFile, folder);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  EXTRACT KEY FROM CDN URL
    //  e.g. https://cdn.codegrowthkh.site/course-pdfs/xxx.pdf
    //       → course-pdfs/xxx.pdf
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public String extractKeyFromUrl(String publicUrl) {
        String base = r2Properties.getPublicUrl();
        if (StringUtils.hasText(publicUrl) && publicUrl.startsWith(base)) {
            String key = publicUrl.substring(base.length()).replaceFirst("^/", "");
            int queryIndex = key.indexOf('?');
            if (queryIndex >= 0) {
                key = key.substring(0, queryIndex);
            }
            int hashIndex = key.indexOf('#');
            if (hashIndex >= 0) {
                key = key.substring(0, hashIndex);
            }
            return key;
        }
        return publicUrl;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Builds the public CDN URL from the object key.
     * Uses r2Properties.getPublicUrl() which must be:
     *   https://cdn.codegrowthkh.site
     */
    private String buildPublicUrl(String key) {
        return r2Properties.getPublicUrl() + "/" + key;
    }

    private String buildKey(String folder, String originalFilename) {
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return folder + "/" + UUID.randomUUID() + ext;
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new FileStorageException("File is empty");

        if (file.getSize() > MAX_IMAGE_SIZE)
            throw new FileStorageException(
                    "Image too large. Max size: 5 MB. Got: " + file.getSize() / 1024 / 1024 + " MB");

        if (file.getOriginalFilename() == null)
            throw new FileStorageException("File name is missing");

        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType()))
            throw new FileStorageException(
                    "Invalid file type '" + file.getContentType() + "'. Allowed: jpeg, png, webp, gif");
    }

    private void validateBytes(byte[] bytes, String contentType) {
        if (bytes == null || bytes.length == 0)
            throw new FileStorageException("File content is empty");

        if (PDF_CONTENT_TYPE.equals(contentType) && bytes.length > MAX_PDF_SIZE)
            throw new FileStorageException(
                    "PDF too large. Max size: 50 MB. Got: " + bytes.length / 1024 / 1024 + " MB");
    }
}
