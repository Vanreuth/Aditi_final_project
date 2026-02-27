package finalproject.backend.mapper;

import finalproject.backend.modal.Role;
import finalproject.backend.modal.User;
import finalproject.backend.request.UpdateUserRequest;
import finalproject.backend.request.UserRequest;
import finalproject.backend.response.UserResponse;
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
                .username(request.getUsername())
                .email(request.getEmail())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .bio(request.getBio())
                // password → encoded in service before save
                // roles    → resolved in service
                // status   → set in service
                .build();
    }

    // ─── Apply update to existing entity ─────────────────────────────────────

    public void updateEntity(UpdateUserRequest request, User user) {
        if (request.getUsername()    != null && !request.getUsername().isEmpty())
            user.setUsername(request.getUsername());

        if (request.getEmail()       != null && !request.getEmail().isEmpty())
            user.setEmail(request.getEmail());

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty())
            user.setPhoneNumber(request.getPhoneNumber());

        if (request.getAddress()     != null && !request.getAddress().isEmpty())
            user.setAddress(request.getAddress());

        if (request.getBio()         != null && !request.getBio().isEmpty())
            user.setBio(request.getBio());

        if (request.getStatus()      != null && !request.getStatus().isEmpty())
            user.setStatus(request.getStatus());

        // password + roles resolved in service (needs encoder + repo)
    }


    // ─── Private helper ───────────────────────────────────────────────────────

    private List<String> rolesToList(User user) {
        if (user.getRoles() == null) return List.of();
        return user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
    }
}