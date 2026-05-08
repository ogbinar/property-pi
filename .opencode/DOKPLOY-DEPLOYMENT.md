# Property-Pi Dokploy Deployment

## Current Deployment Shape

Deploy the application as a single service built from the repository root.

- Build file: `Dockerfile`
- Compose file: `docker-compose.yml`
- Runtime: FastAPI serving SPA + API

## Required Environment

```env
SECRET_KEY=replace-me
DATABASE_URL=sqlite:////data/property_pi.db
ALLOWED_ORIGINS=https://your-domain.example
ENVIRONMENT=production
ACCESS_TOKEN_EXPIRE_MINUTES=120
```

## Route Checks

- `GET /api/health`
- `POST /auth/login`
- `GET /`

## Notes

- Do not rely on old split-service deployment instructions.
- Do not commit secrets into deployment notes.
