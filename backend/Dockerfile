# ---------------------------
# 1️⃣ Build Stage (Maven)
# ---------------------------
FROM maven:3.9.9-amazoncorretto-21 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests


# ---------------------------
# 2️⃣ Runtime Stage (Playwright + Chromium — official image)
# Chromium + all system libs are pre-installed in this image.
# ---------------------------
FROM mcr.microsoft.com/playwright/java:v1.44.0-jammy

WORKDIR /app

# Khmer fonts — renders correctly offline if Google Fonts CDN unreachable
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      fonts-noto \
      fonts-noto-cjk \
      fonts-noto-color-emoji && \
    rm -rf /var/lib/apt/lists/*

# Copy jar
COPY --from=builder /app/target/*.jar app.jar

# Required in all containerised environments — read by CoursePdfGeneratorService
ENV PLAYWRIGHT_CHROMIUM_LAUNCH_OPTIONS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"

ENV PORT=8080
EXPOSE 8080

# Non-root user (Playwright image ships 'pwuser')
USER pwuser

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]