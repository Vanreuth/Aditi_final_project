FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Xss256k", \
  "-XX:+UseSerialGC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
  # ↑ SerialGC uses less memory than default GC — good for free tier
  # ↑ Xss256k reduces thread stack size