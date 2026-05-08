# Property-Pi Requirements Baseline

## Current Runtime Requirements

- Production runs as one FastAPI service.
- The production image is built from the repo root `Dockerfile`.
- The production compose file is `docker-compose.yml`.
- Canonical auth routes live under `/auth/*`.
- Canonical health lives at `/api/health`.
- The service must serve the built SPA, API, and uploads.

## Development Requirements

- Frontend development uses Vite.
- Backend development uses FastAPI directly.
- The repo may remain split by source tree even though production is single-service.

## Archived Requirements

The following are obsolete and must not be treated as active requirements:

- PocketBase-based deployment requirements
- Next.js SSR runtime requirements
- separate production frontend and backend service requirements
- Nginx proxy requirements for the active production path
