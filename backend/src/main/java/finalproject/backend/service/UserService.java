package finalproject.backend.service;

import finalproject.backend.request.UpdateUserRequest;
import finalproject.backend.request.UserRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.PageResponse;
import finalproject.backend.response.UserResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

  ApiResponse<UserResponse> createUser(UserRequest userRequest , MultipartFile profilePicture);
  PageResponse<UserResponse> getAllUsers(Pageable pageable);
  ApiResponse<UserResponse> getUserById(Long id);// ← new
  ApiResponse<UserResponse> updateUser(Long id, UpdateUserRequest request, MultipartFile photo);
  ApiResponse<Void>         deleteUser(Long id);

}
