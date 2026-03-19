# API Overview

This is a quick reference for the main backend route groups in `backend/src/main/java/finalproject/backend/controller`.

## Authentication

Base path:

```text
/api/v1/auth
```

Key endpoints:

- `POST /register`
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `GET /me`
- `PUT /profile`

OAuth support:

```text
/api/v1/auth/oauth2
```

- `GET /providers`
- `GET /authorize/{provider}`

## Courses

Base path:

```text
/api/v1/courses
```

Key endpoints:

- `GET /`
- `GET /{id}`
- `GET /slug/{slug}`
- `GET /slug/{slug}/full`
- `GET /slug/{courseSlug}/lessons/{lessonSlug}`
- `GET /category/{categoryId}`
- `GET /instructor/{instructorId}`
- `GET /featured`
- `GET /coming-soon`
- `POST /`
- `PUT /{id}`
- `DELETE /{id}`

Notes:

- default course sorting uses `orderIndex asc`
- create and update use multipart form data because thumbnails are supported

## Categories

Base path:

```text
/api/v1/categories
```

Key endpoints:

- `GET /`
- `GET /{id}`
- `GET /slug/{slug}`
- `POST /`
- `PUT /{id}`
- `DELETE /{id}`

## Chapters

Base path:

```text
/api/v1/chapters
```

Key endpoints:

- `GET /course/{courseId}`
- `GET /{id}`
- `POST /`
- `PUT /{id}`
- `DELETE /{id}`

## Lessons

Base path:

```text
/api/v1/lessons
```

Key endpoints:

- `GET /chapter/{chapterId}`
- `GET /course/{courseId}`
- `GET /{id}`
- `POST /`
- `PUT /{id}`
- `DELETE /{id}`

## Snippets

Base path:

```text
/api/v1/snippets
```

Key endpoints:

- `GET /lesson/{lessonId}`
- `GET /{id}`
- `POST /`
- `PUT /{id}`
- `DELETE /{id}`

## Lesson Progress

Base path:

```text
/api/v1/lesson-progress
```

Key endpoints:

- `POST /`
- `POST /complete`
- `DELETE /`
- `GET /`
- `GET /me`
- `GET /course/{courseId}`
- `GET /me/completed-count`
- `GET /course/{courseId}/completed-count`

## Admin and Instructor

Admin analytics:

```text
/api/v1/admin/analytics
```

- `GET /?range=7d|30d|90d`

Admin users:

```text
/api/v1/admin/users
```

- `PUT /{id}/role`


- `GET /courses`
- `GET /courses/{id}`
- `GET /stats`

## PDF Export

Base path:

```text
/api/v1/course/pdf
```

Key endpoints:

- `GET /`
- `GET /{courseId}`
- `POST /{courseId}/download`
- `POST /{courseId}/generate`
- `DELETE /{courseId}`

## Health

Useful health routes:

- `GET /`
- `GET /health`
- `GET /actuator/health`
- `GET /actuator/health/readiness`
