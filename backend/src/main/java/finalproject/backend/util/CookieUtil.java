package finalproject.backend.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

@Component
public class CookieUtil {

    public static final String ACCESS_TOKEN  = "access_token";
    public static final String REFRESH_TOKEN = "refresh_token";

    @Value("${app.cookie.secure:false}")
    private boolean secure;

    @Value("${app.cookie.same-site:Lax}")
    private String sameSite;

    public void addCookie(HttpServletResponse response,
                          String name, String value, long maxAgeMs) {
        StringBuilder sb = new StringBuilder()
                .append(name).append("=").append(value)
                .append("; HttpOnly; Path=/")
                .append("; SameSite=").append(sameSite)
                .append("; Max-Age=").append(maxAgeMs / 1000);
        if (secure) sb.append("; Secure");
        response.addHeader("Set-Cookie", sb.toString());
    }

    public void clearCookie(HttpServletResponse response, String name) {
        StringBuilder sb = new StringBuilder()
                .append(name).append("=")
                .append("; HttpOnly; Path=/")
                .append("; SameSite=").append(sameSite)
                .append("; Max-Age=0");
        if (secure) sb.append("; Secure");
        response.addHeader("Set-Cookie", sb.toString());
    }

    public String getCookieValue(HttpServletRequest request, String name) {
        Cookie cookie = WebUtils.getCookie(request, name);
        return (cookie != null) ? cookie.getValue() : null;
    }
}
