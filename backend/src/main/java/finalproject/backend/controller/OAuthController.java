package finalproject.backend.controller;

import finalproject.backend.response.ApiResponse;
import finalproject.backend.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth/oauth2")
@RequiredArgsConstructor
public class OAuthController {

    private final OAuthService oAuthService;

    @GetMapping("/providers")
    public ResponseEntity<ApiResponse<List<String>>> providers() {
        return ResponseEntity.ok(oAuthService.getProviders());
    }

    @GetMapping("/authorize/{provider}")
    public ResponseEntity<ApiResponse<String>> authorize(
            @PathVariable String provider,
            HttpServletRequest request) {
        return ResponseEntity.ok(oAuthService.getAuthorizationUrl(provider, request));
    }
}
