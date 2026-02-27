package finalproject.backend.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {



        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 30)
        @Pattern(
                regexp = "^[a-zA-Z0-9_]+$",
                message = "Username: letters, numbers, underscores only"
        )

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String username;

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

        private String confirmPassword;

        private Set<String> roles;
}
