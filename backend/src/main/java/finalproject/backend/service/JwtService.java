package finalproject.backend.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {

    String extractUsername(String token);
    String generateAccessToken(Authentication authentication);
    String generateRefreshToken(String username);
    boolean isValidateToken(String token, UserDetails userDetails) ;
    boolean isTokenExpired(String token);
}
