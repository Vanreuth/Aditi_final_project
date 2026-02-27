package finalproject.backend.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "password") // Prevent password from appearing in logs
public class UserRequest {


        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 30)
        @Pattern(
                regexp = "^[a-zA-Z0-9_]+$",
                message = "Username: letters, numbers, underscores only"
        )
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;


        private String phoneNumber;

        private String address;

        private String bio;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Minimum 8 characters")
        // @Pattern(
        //     regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
        //     message = "Must have uppercase, lowercase, number and special character"
        // )
        private String password;

        private Set<String> roles;
}