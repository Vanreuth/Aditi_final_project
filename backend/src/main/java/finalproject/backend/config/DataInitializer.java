package finalproject.backend.config;

import finalproject.backend.modal.Role;
import finalproject.backend.modal.User;
import finalproject.backend.repository.RoleRepository;
import finalproject.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedRole("USER");
        seedRole("MODERATOR");
        seedRole("ADMIN");
        seedAdmin();
    }

    private void seedRole(String name) {
        if (roleRepository.findByName(name).isEmpty()) {
            roleRepository.save(Role.builder().name(name).build());
            log.info("Seeded role: {}", name);
        }
    }

    private void seedAdmin() {
        if (userRepository.existsByUsername("admin")) return;
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        Role userRole  = roleRepository.findByName("USER").orElseThrow();
        userRepository.save(User.builder()
                .username("admin").email("admin@example.com")
                .password(passwordEncoder.encode("Admin@1234"))
                .status("ACTIVE")
                .roles(Set.of(adminRole, userRole))
                .build());
        log.info("Seeded admin → username: admin / password: Admin@1234");
    }
}
