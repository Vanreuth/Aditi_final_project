package finalproject.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PlaywrightConfig implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Installing Playwright Chromium...");
            // ✅ Downloads chromium on first deploy
            com.microsoft.playwright.CLI.main(new String[]{"install", "chromium"});
            log.info("Playwright Chromium ready ✅");
        } catch (Exception e) {
            log.warn("Playwright install skipped: {}", e.getMessage());
        }
    }
}