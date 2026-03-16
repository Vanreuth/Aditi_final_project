package finalproject.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class R2Config {

    private final R2Properties r2Properties;

    @Bean
    public S3Client s3Client() {
        URI endpoint = resolveEndpoint();
        String region = StringUtils.hasText(r2Properties.getRegion()) ? r2Properties.getRegion() : "auto";

        log.info("Configuring R2 client with endpoint='{}', bucket='{}', region='{}'",
                endpoint, r2Properties.getBucketName(), region);

        return S3Client.builder()
                .endpointOverride(endpoint)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                r2Properties.getAccessKeyId(),
                                r2Properties.getSecretAccessKey())))
                .region(Region.of(region))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .chunkedEncodingEnabled(false)
                        .checksumValidationEnabled(false)
                        .build())
                .build();
    }

    private URI resolveEndpoint() {
        if (StringUtils.hasText(r2Properties.getEndpoint())) {
            return URI.create(r2Properties.getEndpoint().trim().replaceAll("/+$", ""));
        }
        if (StringUtils.hasText(r2Properties.getAccountId())) {
            return URI.create("https://" + r2Properties.getAccountId().trim() + ".r2.cloudflarestorage.com");
        }
        throw new IllegalStateException("Cloudflare R2 endpoint is missing. Set R2_ENDPOINT or R2_ACCOUNT_ID.");
    }
}
