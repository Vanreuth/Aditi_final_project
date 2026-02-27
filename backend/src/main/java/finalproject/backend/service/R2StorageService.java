package finalproject.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface R2StorageService {

    String uploadFile(MultipartFile file , String folder) throws IOException;

    void deleteFile(String publicUrl);

    String replaceFile(String oldPublicUrl, MultipartFile newFile, String folder) throws IOException;

    String extractKeyFromUrl(String publicUrl);

}
