# Deployment Notes

## Current Render Configuration

The repository currently includes:

- `render.yaml`

Current deployment setup from that file:

- managed PostgreSQL database on Render
- backend deployed as a Docker web service
- backend root directory: `./backend`
- backend health check: `/actuator/health/readiness`
- production profile enabled with:

```env
SPRING_PROFILES_ACTIVE=prod
```

## Render Environment Variables in Use

Configured in `render.yaml`:

- `SPRING_PROFILES_ACTIVE=prod`
- database host, port, name, username, password from the Render database
- `DB_POOL_SIZE=3`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`
- `JWT_EXPIRATION=900000`
- `JWT_REFRESH_EXPIRATION=604800000`
- `R2_REGION=auto`
- `MAX_FILE_SIZE=10MB`
- `MAX_REQUEST_SIZE=20MB`
- `APP_SEED_ENABLED=false`
- `LOG_LEVEL_ROOT=WARN`
- `LOG_LEVEL_APP=INFO`

Secrets that still need manual values:

- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `OAUTH2_REDIRECT_URI`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `R2_PUBLIC_URL`
- `CORS_ALLOWED_ORIGINS`

## Recommended Deployment Order

1. Deploy the backend.
2. Confirm `/actuator/health` and `/actuator/health/readiness` work.
3. Set the frontend backend URL to the deployed backend domain.
4. Deploy the frontend.
5. Verify login, cookies, CORS, and OAuth redirect flow.

## Frontend Deployment Notes

For the frontend, set:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Also verify:

- backend `CORS_ALLOWED_ORIGINS` includes the frontend domain
- backend `OAUTH2_REDIRECT_URI` points to the frontend callback URL
- production uses HTTPS so cookie behavior works correctly

## Docker Notes

The backend Docker build:

- uses Maven + Temurin 21 in the build stage
- installs Playwright Chromium during image build
- runs on Temurin 21 JRE in the runtime stage
- includes system dependencies and Khmer-friendly fonts

## Production Checks

Before going live, verify:

- database connectivity
- health checks
- login and refresh flow
- Google/GitHub OAuth
- file upload to R2
- analytics endpoint
- PDF generation if enabled
