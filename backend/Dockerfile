# ---------- Build Stage ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -q -e -B dependency:go-offline

COPY src ./src
RUN mvn -q -e -B clean package -DskipTests

# ---------- Runtime Stage ----------
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN useradd -ms /bin/bash app
USER app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java",
"-XX:+UseContainerSupport",
"-XX:MaxRAMPercentage=75",
"-XX:+UseSerialGC",
"-Xss256k",
"-Djava.security.egd=file:/dev/./urandom",
"-jar","app.jar"]