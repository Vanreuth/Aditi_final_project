# Project Overview

## Summary

CodeGrowthKH is a full-stack learning platform with:

- a `frontend/` Next.js app
- a `backend/` Spring Boot API

The platform supports public course browsing, lesson reading, authentication, learner progress tracking, dashboard management, analytics, file uploads, and PDF export.

## Frontend

Main responsibilities:

- public website pages
- course listing and filtering
- course detail and lesson pages
- login, register, forgot password, and OAuth redirect handling
- learner account activity and progress pages
- admin dashboard pages
- proxying browser API calls to the backend

Main stack:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- React Query
- Axios

## Backend

Main responsibilities:

- authentication and authorization
- Google and GitHub OAuth
- users, categories, courses, chapters, lessons, and snippets CRUD
- lesson progress tracking
- admin analytics
- Cloudflare R2 uploads
- Playwright PDF export

Main stack:

- Spring Boot 4
- Java 21
- PostgreSQL
- Spring Security
- JPA / Hibernate
- JWT

## Local Development Flow

Typical local setup:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- frontend proxies requests to the backend using `NEXT_PUBLIC_API_URL`

## Important Notes

- the backend `dev` profile currently uses `ddl-auto=create`
- seed data is enabled by default in `dev`
- course ordering uses `orderIndex`
- dashboard analytics now come from the backend analytics endpoint
