# Dokploy Deployment Checklist

## Before Deploy

- confirm the build uses the repo root `Dockerfile`
- confirm the runtime is one FastAPI service
- set `SECRET_KEY`
- set `DATABASE_URL`
- set `ALLOWED_ORIGINS`
- set `ENVIRONMENT=production`

## After Deploy

- check `GET /api/health`
- check `GET /`
- check `POST /auth/login`
- verify the SPA can load authenticated routes

## Guardrails

- do not use stale two-service, PocketBase, or Nginx instructions
- do not store secrets in markdown files
