package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class OAuthServiceImpl implements OAuthService {

    private final ClientRegistrationRepository clientRegistrationRepository;

    @Override
    public ApiResponse<List<String>> getProviders() {
        return ApiResponse.success(resolveProviders(), "OAuth providers fetched successfully");
    }

    @Override
    public ApiResponse<String> getAuthorizationUrl(String provider, HttpServletRequest request) {
        String normalizedProvider = provider.toLowerCase(Locale.ROOT);
        List<String> providers = resolveProviders();

        if (!providers.contains(normalizedProvider)) {
            throw new CustomMessageException("Unsupported OAuth provider: " + provider,
                    String.valueOf(HttpStatus.BAD_REQUEST.value()));
        }

        String authorizationUrl = ServletUriComponentsBuilder
                .fromRequestUri(request)
                .replacePath("/oauth2/authorization/{provider}")
                .replaceQuery(null)
                .buildAndExpand(normalizedProvider)
                .toUriString();

        return ApiResponse.success(authorizationUrl, "OAuth authorization URL generated successfully");
    }

    private List<String> resolveProviders() {
        List<String> providers = new ArrayList<>();
        if (clientRegistrationRepository instanceof Iterable<?> iterable) {
            for (Object registration : iterable) {
                ClientRegistration clientRegistration = (ClientRegistration) registration;
                providers.add(clientRegistration.getRegistrationId().toLowerCase(Locale.ROOT));
            }
        }
        return providers;
    }
}
