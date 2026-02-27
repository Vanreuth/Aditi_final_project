package finalproject.backend.service;

import finalproject.backend.request.LoginRequest;
import finalproject.backend.request.RegisterRequest;
import finalproject.backend.request.UpdateProfileRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.AuthResponse;
import finalproject.backend.response.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    ApiResponse<Void> register(RegisterRequest request , MultipartFile profilePicture);
    ApiResponse<AuthResponse> login(LoginRequest request, HttpServletResponse response);
    ApiResponse<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response);
    ApiResponse<Void>         logout(HttpServletRequest request, HttpServletResponse response);
    ApiResponse<AuthResponse> me(HttpServletRequest request);
    ApiResponse<AuthResponse> updateProfile(Authentication authentication, UpdateProfileRequest request,MultipartFile photo);
}
