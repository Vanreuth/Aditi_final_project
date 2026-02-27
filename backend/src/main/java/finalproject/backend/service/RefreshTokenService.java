package finalproject.backend.service;


import finalproject.backend.modal.RefreshToken;
import finalproject.backend.modal.User;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    RefreshToken validateRefreshToken(String refreshToken);

    void revokeRefreshToken(String refreshToken);

    void revokeAllUserTokens(User user);


}
