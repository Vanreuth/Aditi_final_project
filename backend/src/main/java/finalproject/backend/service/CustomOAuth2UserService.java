package finalproject.backend.service;

import finalproject.backend.modal.Role;
import finalproject.backend.modal.User;
import finalproject.backend.repository.RoleRepository;
import finalproject.backend.repository.UserRepository;


import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) throws OAuth2AuthenticationException {
        // Fetch the user from the OAuth2 provider (Google/GitHub)
        OAuth2User oauth2User = super.loadUser(req);

        // Dynamically get the provider name and the correct identifying attribute
        String provider = req.getClientRegistration().getRegistrationId();
        String userNameAttributeName = req.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        String email = (String) oauth2User.getAttributes().get("email");

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(provider + " email not found. Make sure your email is public.");
        }

        // Find existing user or create a new one
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            Role roleUser = roleRepository.findByName("USER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));

            String username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 6);

            User newUser = User.builder()
                    .email(email)
                    .username(username)
                    .password(null)         // ✅ allow null for oauth2 user
                    .status("ACTIVE")
                    .roles(Set.of(roleUser))
                    .build();

            // ✅ Only save if we are creating a brand new user
            return userRepository.save(newUser);
        });

        return new DefaultOAuth2User(
                user.getAuthorities(), // Ensure your User entity implements UserDetails to return GrantedAuthorities
                oauth2User.getAttributes(),
                userNameAttributeName  // ✅ Dynamically uses "email" for Google and "id" for GitHub
        );
    }
}