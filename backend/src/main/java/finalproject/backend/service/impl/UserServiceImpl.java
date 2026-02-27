package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.UserMapper;
import finalproject.backend.modal.Role;
import finalproject.backend.modal.User;
import finalproject.backend.repository.RoleRepository;
import finalproject.backend.repository.UserRepository;
import finalproject.backend.request.UpdateUserRequest;
import finalproject.backend.request.UserRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.PageResponse;
import finalproject.backend.response.UserResponse;
import finalproject.backend.service.R2StorageService;
import finalproject.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final R2StorageService r2StorageService;

    @Override
    public ApiResponse<UserResponse> createUser(UserRequest userRequest, MultipartFile profilePicture) {

        //Validation
        this.userRequestValidation(userRequest);

        User user = userMapper.toEntity(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setStatus("ACTIVE");

        user.setRoles(resolveRoles(userRequest.getRoles()));

        // Upload profile picture if provided
        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                String url = r2StorageService.uploadFile(profilePicture, "profile");
                user.setProfilePicture(url);
            } catch (IOException e) {
                throw new CustomMessageException("Failed to upload profile picture: " + e.getMessage());
            }
        }

        User savedUser = userRepository.save(user);


        return ApiResponse.success(userMapper.toResponse(savedUser), "User created successfully");
    }

    @Override
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        Page<UserResponse> userResponsePage = userPage.map(userMapper::toResponse);
        return PageResponse.of(userResponsePage);
    }

    @Override
    public ApiResponse<UserResponse> getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException("User not found with id: " + id));
        return ApiResponse.success(userMapper.toResponse(user),"User successfully retrieved");
    }

    @Override
    public ApiResponse<UserResponse> updateUser(Long id, UpdateUserRequest request, MultipartFile photo) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException("User not found with id: " + id));

        // check username duplicate before applying
        if (request.getUsername() != null && !request.getUsername().isEmpty()
                && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername()))
                throw new CustomMessageException("Username already taken",
                        String.valueOf(HttpStatus.CONFLICT.value()));
        }

        // check email duplicate before applying
        if (request.getEmail() != null && !request.getEmail().isEmpty()
                && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail()))
                throw new CustomMessageException("Email already in use",
                        String.valueOf(HttpStatus.CONFLICT.value()));
        }

        userMapper.updateEntity(request, user);

        if (request.getPassword() != null && !request.getPassword().isEmpty())
            user.setPassword(passwordEncoder.encode(request.getPassword()));

        if (request.getRoles() != null && !request.getRoles().isEmpty())
            user.setRoles(resolveRoles(request.getRoles()));

        if (photo != null && !photo.isEmpty()) {
            try {
                String old = user.getProfilePicture();
                if (old != null && !old.isEmpty())
                    r2StorageService.deleteFile(old);
                user.setProfilePicture(r2StorageService.uploadFile(photo, "profile"));
            } catch (IOException e) {
                throw new CustomMessageException("Failed to upload photo: " + e.getMessage());
            }
        }
        User saved = userRepository.save(user);
        log.info("Admin updated user id={}", id);
        return ApiResponse.success(userMapper.toResponse(saved), "User updated successfully");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException("User not found with id: " + id));
        String old = user.getProfilePicture();
        if (old != null && !old.isEmpty()) {
            try { r2StorageService.deleteFile(old); }
            catch (Exception e) { log.warn("R2 delete failed: {}", e.getMessage()); }
        }
        userRepository.delete(user);
        log.info("Deleted user id={}", id);
        return ApiResponse.success("User deleted successfully");
    }


    private Set<Role> resolveRoles(Set<String> requestedRoles) {
        if (ObjectUtils.isEmpty(requestedRoles)) {
            // Default → ROLE_USER
            return Set.of(findOrCreateRole("USER"));
        }
        return requestedRoles.stream()
                .map(this::findOrCreateRole)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private Role findOrCreateRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(name).build()));
    }

    private void userRequestValidation(UserRequest userRequest) {

        if(ObjectUtils.isEmpty(userRequest.getPassword())) {
            throw new CustomMessageException("Password is empty");
        }

        if(userRepository.existsByEmail(userRequest.getEmail())) {
            throw  new CustomMessageException("Email already exists", String.valueOf(HttpStatus.NOT_FOUND.value()));
        }

    }


}
