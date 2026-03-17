package finalproject.backend.oauth;

import finalproject.backend.modal.Role;
import finalproject.backend.modal.User;
import finalproject.backend.repository.RoleRepository;
import finalproject.backend.repository.UserRepository;
import finalproject.backend.util.RoleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthUserProvisioningService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public User upsertOAuthUser(String email, String profilePictureUrl) {
        return userRepository.findByEmail(email)
                .map(user -> updateExistingUser(user, email, profilePictureUrl))
                .orElseGet(() -> createNewUser(email, profilePictureUrl));
    }

    private User updateExistingUser(User user, String email, String profilePictureUrl) {
        boolean changed = false;
        String preferredUsername = resolvePreferredUsername(email, user);

        if (!StringUtils.hasText(user.getUsername())) {
            user.setUsername(preferredUsername);
            changed = true;
        } else if (shouldUpdateUsername(user, preferredUsername)) {
            if (!preferredUsername.equals(user.getUsername())) {
                user.setUsername(preferredUsername);
                changed = true;
            }
        }

        if (!StringUtils.hasText(user.getProfilePicture()) && StringUtils.hasText(profilePictureUrl)) {
            user.setProfilePicture(profilePictureUrl);
            changed = true;
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            user.setStatus("ACTIVE");
            changed = true;
        }

        if (!changed) {
            return user;
        }

        User savedUser = userRepository.save(user);
        log.info("Updated OAuth user: email={}, username={}", savedUser.getEmail(), savedUser.getUsername());
        return savedUser;
    }

    private User createNewUser(String email, String profilePictureUrl) {
        Role roleUser = roleRepository.findByName(RoleUtil.ROLE_USER)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(RoleUtil.ROLE_USER).build()));

        User newUser = User.builder()
                .email(email)
                .username(resolvePreferredUsername(email, null))
                .password(null)
                .status("ACTIVE")
                .profilePicture(profilePictureUrl)
                .roles(Set.of(roleUser))
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("Created new OAuth user: email={}, username={}", savedUser.getEmail(), savedUser.getUsername());
        return savedUser;
    }

    private boolean shouldUpdateUsername(User user, String preferredUsername) {
        if (user.getPassword() != null) {
            return false;
        }

        return StringUtils.hasText(preferredUsername)
                && !preferredUsername.equalsIgnoreCase(user.getUsername());
    }

    private String resolvePreferredUsername(String email, User currentUser) {
        String baseUsername = extractBaseUsername(email);

        if (isUsernameAvailableForUser(baseUsername, currentUser)) {
            return baseUsername;
        }

        String username = baseUsername + "_" + UUID.randomUUID().toString().substring(0, 6);

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + UUID.randomUUID().toString().substring(0, 6);
        }

        return username;
    }

    private boolean isUsernameAvailableForUser(String username, User currentUser) {
        return userRepository.findByUsername(username)
                .map(existingUser -> currentUser != null && existingUser.getId().equals(currentUser.getId()))
                .orElse(true);
    }

    private String extractBaseUsername(String email) {
        String rawBase = email != null && email.contains("@")
                ? email.substring(0, email.indexOf('@'))
                : "user";

        String sanitized = rawBase
                .toLowerCase()
                .replaceAll("[^a-z0-9._-]", "");

        return StringUtils.hasText(sanitized) ? sanitized : "user";
    }
}
