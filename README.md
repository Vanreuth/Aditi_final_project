# CodeGrowthKH

CodeGrowthKH is a full-stack learning platform built with a Next.js frontend and a Spring Boot backend. It supports public course browsing, lesson learning, authentication, learner progress tracking, admin  dashboards, analytics, file uploads, and PDF export.

## Project Structure

- `frontend/` Next.js application for the public site, learner account pages, and dashboard UI
- `backend/` Spring Boot API for authentication, course content, analytics, progress tracking, uploads, and PDF generation

## Features

### Frontend

- public marketing pages
- courses page with search, level filter, and category filter
- course detail and lesson pages by slug
- login, register, forgot password, and OAuth redirect handling
- learner account activity and progress tracking
- admin  dashboard UI
- course ordering support with `orderIndex`
- Next.js API proxy layer for backend requests

### Backend

- JWT access and refresh token authentication
- Google and GitHub OAuth login
- role-based authorization
- CRUD for categories, courses, chapters, lessons, and snippets
- learner progress tracking
- admin analytics endpoint
- instructor statistics
- Cloudflare R2 file uploads
- Playwright-based PDF generation
- health endpoints for deployment checks

## Tech Stack

### Frontend

- Next.js 16.1.6
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack React Query
- Axios
- Radix UI
- Recharts

### Backend

- Java 21
- Spring Boot 4.0.2
- Spring Security
- Spring Data JPA + Hibernate
- PostgreSQL
- JWT
- OAuth2 Client
- Cloudflare R2
- Playwright Java
- Docker

## Prerequisites

Before running the project locally, install:

- Node.js 20+
- npm 10+
- Java 21
- PostgreSQL

Optional for full functionality:

- Google OAuth credentials
- GitHub OAuth credentials
- Cloudflare R2 credentials

## Local Setup

### 1. Clone and open the project

```bash
git clone <your-repo-url>
cd aditi_final_project
```

### 2. Set up the backend

The backend uses Spring profiles.

#### Development profile

- uses `DB_URL`
- enables seed data by default
- uses non-secure cookies for localhost
- currently uses `spring.jpa.hibernate.ddl-auto=create`

Set these minimum variables for local development:

```env
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:postgresql://localhost:5432/codegrowthkh
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=replace_with_a_long_random_secret
```

Other useful backend variables:

```env
PORT=8080
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

MAX_FILE_SIZE=10MB
MAX_REQUEST_SIZE=20MB

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OAUTH2_REDIRECT_URI=http://localhost:3000/oauth2/redirect

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_URL=
R2_REGION=auto

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
APP_SEED_ENABLED=true
PDF_BROWSER_WARMUP_ENABLED=true
```

Run the backend:

macOS/Linux:

```bash
cd backend
./mvnw spring-boot:run
```

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Default backend URL:

```text
http://localhost:8080
```

### 3. Set up the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Optional fallback:

```env
API_BASE_URL=http://localhost:8080
```

Notes:

- `NEXT_PUBLIC_API_URL` is the preferred backend URL
- `API_BASE_URL` is still supported as a fallback by `frontend/src/lib/proxy.ts`

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:3000
```

### 4. Local development flow

Typical local setup:

- frontend runs on `http://localhost:3000`
- backend runs on `http://localhost:8080`
- browser requests go through the Next.js proxy layer and are forwarded to Spring Boot

## Useful Commands

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run start
npm run lint
```

### Backend

macOS/Linux:

```bash
cd backend
./mvnw spring-boot:run
./mvnw clean package
./mvnw test
```

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
.\mvnw.cmd clean package
.\mvnw.cmd test
```

## Environment Summary

### Frontend

Required:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Optional:

```env
API_BASE_URL=http://localhost:8080
```

### Backend development

```env
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:postgresql://localhost:5432/codegrowthkh
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=replace_with_a_long_random_secret
```

### Backend production

```env
SPRING_PROFILES_ACTIVE=prod
PORT=8080

DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=codegrowthkh
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
OAUTH2_REDIRECT_URI=https://your-frontend-domain.com/oauth2/redirect

APP_SEED_ENABLED=false
PDF_BROWSER_WARMUP_ENABLED=false
```

## Deployment

### Frontend Deployment

Deploy the frontend to Vercel or any Node-compatible platform that supports Next.js.

Recommended production variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Frontend deployment checklist:

- deploy the backend first if possible
- set `NEXT_PUBLIC_API_URL` to the deployed backend URL
- rebuild or redeploy after updating environment variables
- make sure backend CORS allows the frontend domain
- make sure backend OAuth redirect settings point to the deployed frontend

### Backend Deployment

Deploy the backend on any Java-compatible platform such as Render, Railway, Fly.io, a VPS, Docker host, or Kubernetes.

Backend production checklist:

- set `SPRING_PROFILES_ACTIVE=prod`
- configure database variables
- set a strong `JWT_SECRET`
- set `CORS_ALLOWED_ORIGINS` to the frontend domain
- set `OAUTH2_REDIRECT_URI` to the frontend callback page
- disable seeding in production unless explicitly needed
- configure R2 credentials if file uploads are required

### Docker

The backend includes:

- `backend/Dockerfile`
- `backend/docker-compose.yml`

Build the backend image:

```bash
cd backend
docker build -t codegrowthkh-backend .
```

Run the backend container:

```bash
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=codegrowthkh \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e JWT_SECRET=replace_with_a_long_random_secret \
  -e CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com \
  -e OAUTH2_REDIRECT_URI=https://your-frontend-domain.com/oauth2/redirect \
  codegrowthkh-backend
```

Note:

- the current `backend/docker-compose.yml` is closer to a dev-style environment because it passes `DB_URL`
- if you want true production profile behavior in Docker, also set `SPRING_PROFILES_ACTIVE=prod` and the `DB_HOST`/`DB_PORT`/`DB_NAME` variables

## Important Endpoints

Main backend route groups used by the frontend:

- `/api/v1/auth/*`
- `/api/v1/courses/*`
- `/api/v1/admin/analytics`
- `/actuator/health`

## Troubleshooting

### Frontend cannot reach backend

- verify `NEXT_PUBLIC_API_URL`
- verify the backend is running
- restart the frontend after changing `.env.local`

### Backend cannot connect to database

- verify PostgreSQL is running
- verify the active Spring profile
- verify `DB_URL` or `DB_HOST`/`DB_PORT`/`DB_NAME`

### OAuth login fails

- verify Google or GitHub client credentials
- verify callback URLs in the provider console
- verify `OAUTH2_REDIRECT_URI`

### Cookies fail in production

- verify `SPRING_PROFILES_ACTIVE=prod`
- verify HTTPS is enabled
- verify `CORS_ALLOWED_ORIGINS` matches the exact frontend domain

### Seed data is missing

- verify `APP_SEED_ENABLED=true`
- verify the backend is running with the `dev` profile
- remember that `ddl-auto=create` recreates local schema data on startup
