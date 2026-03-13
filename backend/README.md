# Backend (Spring Boot)

This is the backend API for the online education platform. It provides authentication, course management, lesson delivery, progress tracking, OAuth2 login, file storage integration, and PDF export.

## Tech Stack

- Java 21
- Spring Boot 4
- Spring Security + JWT
- Spring OAuth2 Client (Google, GitHub)
- Spring Data JPA + Hibernate
- PostgreSQL
- Cloudflare R2 (S3-compatible storage)
- Playwright Java (PDF rendering)

## Core Domain

- User, Role, RefreshToken
- Category, Course, Chapter, Lesson, CodeSnippet
- LessonProgress
- CoursePdfExport

## Prerequisites

- Java 21
- Maven (or use mvnw/mvnw.cmd)
- PostgreSQL (or a hosted PostgreSQL URL)

## Environment Variables

Create a file named .env in this backend folder (or set variables in your host environment).

```env
# Server
PORT=8080

# Database
DB_URL=jdbc:postgresql://localhost:5432/backend
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_POOL_SIZE=3
SPRING_JPA_HIBERNATE_DDL_AUTO=validate

# Upload limits
MAX_FILE_SIZE=10MB
MAX_REQUEST_SIZE=20MB

# JWT
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# OAuth2
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OAUTH2_REDIRECT_URI=http://localhost:3000/oauth2/redirect

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_URL=
R2_REGION=auto

# Cookies and CORS
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL_ROOT=WARN
LOG_LEVEL_APP=INFO
```

## Run Locally

Windows:

```bash
mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
./mvnw spring-boot:run
```

API base URL: http://localhost:8080

## Build

Windows:

```bash
mvnw.cmd clean package
```

macOS/Linux:

```bash
./mvnw clean package
```

## Docker

This folder includes Dockerfile and docker-compose.yml.

```bash
docker compose up --build
```

## Important Config

- src/main/resources/application.yml
- OAuth2 client registration for Google and GitHub
- JWT and refresh token expiration settings
- Cloudflare R2 object storage configuration
- CORS and cookie security settings

## PDF Generation

- Uses Playwright to render styled HTML into PDF.
- Supports multilingual content and syntax-highlighted code snippets.
- PDF metadata is stored on course records.

## Health Endpoint

- /actuator/health

## Notes

- Ensure frontend uses the same backend base URL and allowed CORS origin.
- For production, use secure cookie settings and HTTPS-only origins.
