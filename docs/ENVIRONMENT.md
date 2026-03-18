# Environment and Setup Notes

## Frontend

Create:

```text
frontend/.env.local
```

Recommended:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Optional fallback:

```env
API_BASE_URL=http://localhost:8080
```

Notes:

- `NEXT_PUBLIC_API_URL` is preferred
- the Next.js proxy helper falls back to `API_BASE_URL`
- restart the frontend dev server after editing env files

## Backend Development

Recommended local development variables:

```env
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:postgresql://localhost:5432/codegrowthkh
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=replace_with_a_long_random_secret
```

Useful additional variables:

```env
PORT=8080
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
APP_SEED_ENABLED=true
PDF_BROWSER_WARMUP_ENABLED=true
```

Optional integrations:

```env
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
```

## Backend Production

Recommended production shape:

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

## Local Run Commands

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Windows backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
