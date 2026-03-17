package finalproject.backend.oauth;

import finalproject.backend.modal.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final String GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

    private final OAuthUserProvisioningService oAuthUserProvisioningService;
    private final RestTemplate restTemplate;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(req);

        String provider = req.getClientRegistration().getRegistrationId();
        String configuredNameAttribute = req.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        log.info("OAuth2 loadUser: provider={}, attributes={}",
                provider, oauth2User.getAttributes().keySet());

        String email = resolveEmail(provider, oauth2User, req);

        if (email == null || email.isBlank()) {
            log.error("OAuth2 email resolution failed for provider: {}", provider);
            // ✅ Correct constructor — description is readable in FailureHandler
            throw new OAuth2AuthenticationException(
                    new OAuth2Error(
                            "email_not_found",
                            "[" + provider + "] Email not found. " +
                                    "For GitHub: Settings → Emails → uncheck 'Keep my email private'.",
                            null
                    )
            );
        }

        log.info("OAuth2 resolved email={} provider={}", email, provider);

        String profilePictureUrl = resolveProfilePicture(provider, oauth2User);
        User user = oAuthUserProvisioningService.upsertOAuthUser(email, profilePictureUrl);

        Map<String, Object> attributes = new HashMap<>(oauth2User.getAttributes());
        attributes.put("email", email);
        attributes.put("profile_picture", user.getProfilePicture());

        String nameAttr = resolveNameAttribute(configuredNameAttribute, provider, attributes);
        return new DefaultOAuth2User(user.getAuthorities(), attributes, nameAttr);
    }

    private String resolveEmail(String provider, OAuth2User oauth2User, OAuth2UserRequest req) {
        Object raw = oauth2User.getAttributes().get("email");
        if (raw instanceof String email && !email.isBlank()) return email;
        if ("github".equalsIgnoreCase(provider)) {
            return fetchGithubPrimaryEmail(req.getAccessToken().getTokenValue());
        }
        return null;
    }

    private String resolveNameAttribute(String configured, String provider,
                                        Map<String, Object> attributes) {
        if (configured != null && attributes.containsKey(configured)) return configured;
        if ("github".equalsIgnoreCase(provider) && attributes.containsKey("id")) return "id";
        if (attributes.containsKey("sub"))   return "sub";
        if (attributes.containsKey("email")) return "email";
        return attributes.keySet().stream().findFirst().orElse("email");
    }

    private String resolveProfilePicture(String provider, OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();

        Object raw = "github".equalsIgnoreCase(provider)
                ? attributes.get("avatar_url")
                : attributes.get("picture");

        if (raw instanceof String profilePicture && !profilePicture.isBlank()) {
            return profilePicture;
        }

        Object fallback = attributes.get("avatar_url");
        if (fallback instanceof String profilePicture && !profilePicture.isBlank()) {
            return profilePicture;
        }

        fallback = attributes.get("picture");
        if (fallback instanceof String profilePicture && !profilePicture.isBlank()) {
            return profilePicture;
        }

        return null;
    }

    private String fetchGithubPrimaryEmail(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    GITHUB_EMAILS_URL, HttpMethod.GET,
                    new HttpEntity<>(headers),
                    new ParameterizedTypeReference<>() {}
            );

            List<Map<String, Object>> emails = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful()
                    || emails == null || emails.isEmpty()) return null;

            String primary = null, verified = null, any = null;
            for (Map<String, Object> row : emails) {
                String email  = row.get("email") instanceof String v ? v : null;
                boolean isPri = Boolean.TRUE.equals(row.get("primary"));
                boolean isVer = Boolean.TRUE.equals(row.get("verified"));
                if (email == null || email.isBlank()) continue;
                if (isPri && isVer)              return email;
                if (isPri  && primary  == null)  primary  = email;
                if (isVer  && verified == null)  verified = email;
                if (any == null)                 any      = email;
            }
            return primary != null ? primary : verified != null ? verified : any;

        } catch (RestClientException ex) {
            log.error("GitHub emails API call failed: {}", ex.getMessage(), ex);
            return null;
        }
    }
}
