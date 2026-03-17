package finalproject.backend.oauth;

import finalproject.backend.modal.RefreshToken;
import finalproject.backend.modal.User;
import finalproject.backend.config.JwtProperties;
import finalproject.backend.service.JwtService;
import finalproject.backend.service.RefreshTokenService;
import finalproject.backend.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuthUserProvisioningService oAuthUserProvisioningService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final CookieUtil cookieUtil;
    private final JwtProperties jwtProperties;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = (String) oauthUser.getAttributes().get("email");

            log.info("OAuth2SuccessHandler: extracted email={}, all attributes={}", email, oauthUser.getAttributes().keySet());

            if (email == null || email.isBlank()) {
                log.error("OAuth2SuccessHandler: email is null or blank");
                redirectWithError(request, response, "OAuth email is missing");
                return;
            }

            String profilePictureUrl = resolveProfilePicture(oauthUser);
            User user = oAuthUserProvisioningService.upsertOAuthUser(email, profilePictureUrl);

            Authentication authToken = new UsernamePasswordAuthenticationToken(
                    user, null, user.getAuthorities());
            String accessToken = jwtService.generateAccessToken(authToken);
            RefreshToken refresh = refreshTokenService.createRefreshToken(user);

            cookieUtil.addCookie(response, CookieUtil.ACCESS_TOKEN, accessToken, 15 * 60 * 1000L);
            cookieUtil.addCookie(response, CookieUtil.REFRESH_TOKEN, refresh.getToken(), jwtProperties.getRefreshExpiration());

            log.info("OAuth2SuccessHandler: Successfully authenticated user={}, redirecting to={}", email, redirectUri);

            String targetUrl = buildSuccessRedirectUrl(request, accessToken, refresh.getToken());

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception ex) {
            log.error("OAuth2SuccessHandler: Exception occurred: {}", ex.getMessage(), ex);
            redirectWithError(request, response, ex.getMessage());
        }
    }

    private void redirectWithError(HttpServletRequest request,
                                   HttpServletResponse response,
                                   String rawMessage) throws IOException {
        String message = (rawMessage == null || rawMessage.isBlank())
                ? "OAuth login failed"
                : rawMessage;

        log.warn("OAuth2SuccessHandler redirectWithError: {}", message);

        String targetUrl = UriComponentsBuilder
                .fromUriString(redirectUri)
                .queryParam("error", message)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String buildSuccessRedirectUrl(HttpServletRequest request,
                                           String accessToken,
                                           String refreshToken) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(redirectUri);

        if (isCrossDomainRedirect(request)) {
            builder
                    .queryParam("access_token", accessToken)
                    .queryParam("refresh_token", refreshToken);
        }

        return builder.build().toUriString();
    }

    private boolean isCrossDomainRedirect(HttpServletRequest request) {
        URI target = URI.create(redirectUri);
        String targetHost = target.getHost();
        String requestHost = request.getServerName();

        if (targetHost == null || requestHost == null) {
            return false;
        }

        if (isLocalHost(targetHost) && isLocalHost(requestHost)) {
            return false;
        }

        return !targetHost.equalsIgnoreCase(requestHost);
    }

    private boolean isLocalHost(String host) {
        return "localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host);
    }

    private String resolveProfilePicture(OAuth2User oauthUser) {
        Object avatarUrl = oauthUser.getAttributes().get("avatar_url");
        if (avatarUrl instanceof String profilePicture && !profilePicture.isBlank()) {
            return profilePicture;
        }

        Object picture = oauthUser.getAttributes().get("picture");
        if (picture instanceof String profilePicture && !profilePicture.isBlank()) {
            return profilePicture;
        }

        return null;
    }
}
