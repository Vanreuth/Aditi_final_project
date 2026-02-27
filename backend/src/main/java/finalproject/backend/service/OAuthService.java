package finalproject.backend.service;

import finalproject.backend.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface OAuthService {
    ApiResponse<List<String>> getProviders();
    ApiResponse<String> getAuthorizationUrl(String provider, HttpServletRequest request);
}
