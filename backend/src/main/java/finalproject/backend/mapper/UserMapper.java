package finalproject.backend.mapper;

import finalproject.backend.modal.Role;
import finalproject.backend.modal.User;
import finalproject.backend.request.UpdateUserRequest;
import finalproject.backend.request.UserRequest;
import finalproject.backend.response.UserResponse;
import finalproject.backend.util.RoleUtil;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    // ─── Entity → Response (Builder) ─────────────────────────────────────────

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .address(user.getAddress())
                .phoneNumber(user.getPhoneNumber())
                .bio(user.getBio())
                .status(user.getStatus())
                .profilePicture(user.getProfilePicture())
                .roles(rolesToList(user))
                .loginAttempt(user.getLoginAttempt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // ─── Request → Entity ─────────────────────────────────────────────────────

    public User toEntity(UserRequest request) {
        return User.builder()
                .username(request.getUsername() != null ? request.getUsername().trim() : null)
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .address(normalizeOptional(request.getAddress()))
                .phoneNumber(normalizeOptional(request.getPhoneNumber()))
                .bio(normalizeOptional(request.getBio()))
                // password → encoded in service before save
                // roles    → resolved in service
                // status   → set in service
                .build();
    }

    // ─── Apply update to existing entity ─────────────────────────────────────

    public void updateEntity(UpdateUserRequest request, User user) {
        if (request.getUsername() != null) {
            String username = request.getUsername().trim();
            if (!username.isEmpty()) user.setUsername(username);
        }

        if (request.getEmail() != null) {
            String email = request.getEmail().trim();
            if (!email.isEmpty()) user.setEmail(email);
        }

        if (request.getPhoneNumber() != null)
            user.setPhoneNumber(normalizeOptional(request.getPhoneNumber()));

        if (request.getAddress() != null)
            user.setAddress(normalizeOptional(request.getAddress()));

        if (request.getBio() != null)
            user.setBio(normalizeOptional(request.getBio()));

        if (request.getStatus() != null) {
            String status = request.getStatus().trim();
            if (!status.isEmpty()) user.setStatus(status.toUpperCase());
        }

        // password + roles resolved in service (needs encoder + repo)
    }


    // ─── Private helper ───────────────────────────────────────────────────────

    private List<String> rolesToList(User user) {
        if (user.getRoles() == null) return List.of();
        return user.getRoles().stream()
                .map(Role::getName)
                .map(name -> {
                    try {
                        return RoleUtil.normalize(name);
                    } catch (IllegalArgumentException ignored) {
                        return name;
                    }
                })
                .collect(Collectors.toList());
    }

    private String normalizeOptional(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
