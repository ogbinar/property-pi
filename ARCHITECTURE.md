# Property-Pi Architecture

## Summary

Property-Pi is a React + Vite frontend backed by FastAPI and SQLite.

The development setup still uses two processes:

- Vite dev server for the SPA
- FastAPI for the API

The production direction is a single Python runtime that serves:

- the API
- the built SPA
- static uploads

## Current Runtime Shape

### Frontend

- React + Vite SPA
- Client-side routing via React Router
- Bearer token auth stored in `localStorage`
- API calls through `frontend/src/api.js`

### Backend

- FastAPI application
- SQLAlchemy + SQLite
- JWT auth with bcrypt password hashing
- file uploads under `/uploads`
- rate limiting via `slowapi`

### Deployment

- Production compose now builds one backend image from the repo root
- The backend image copies the built frontend assets into the runtime image
- FastAPI serves the SPA and API together

## Key Paths

- `/api/*` - canonical backend API
- `/auth/*` - auth API
- `/uploads/*` - file uploads
- `/docs` - FastAPI docs
- `/` and client routes - SPA fallback

## Why This Shape

The old split runtime added unnecessary failure modes:

- frontend Nginx depended on backend reachability
- route prefixes had to be preserved perfectly
- Dokploy env and proxy state could drift independently

Serving the SPA from FastAPI removes the proxy hop and makes production deploys easier to reason about.

## Persistence

- SQLite remains on a volume
- uploads remain on a separate volume
- schema changes should go through Alembic

## Operational Rules

- `SECRET_KEY` must be non-default in production
- `ALLOWED_ORIGINS` must include the live origin
- production should not rely on implicit bootstrap behavior

## Migration Notes

Compatibility routes and transition code may remain temporarily during the rearchitecture loop, but the end state should be canonical and single-path:

- one SPA host path
- one API prefix
- one production runtime service

