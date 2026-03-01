package finalproject.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface R2StorageService {

    String uploadFile(MultipartFile file, String folder) throws IOException;

    /** Upload raw bytes directly (e.g. generated PDFs). */
    String uploadBytes(byte[] bytes, String folder, String filename, String contentType);

    void deleteFile(String publicUrl);

    String replaceFile(String oldPublicUrl, MultipartFile newFile, String folder) throws IOException;

    String extractKeyFromUrl(String publicUrl);

}
