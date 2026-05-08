# Property-Pi Architecture

## Summary

Property-Pi runs as a single production service:

- FastAPI serves the REST API
- FastAPI serves the built SPA from `frontend/dist`
- FastAPI serves uploaded files from `/uploads`

The repository still contains separate `frontend/` and `backend/` source trees, but production is one container and one HTTP service.

## Production Runtime

1. The root `Dockerfile` builds the Vite frontend.
2. The same image installs the FastAPI backend.
3. Built frontend assets are copied into the runtime image.
4. `uvicorn app.main:app` serves the API and SPA together.

## Request Contract

- `/auth/*` is the canonical auth surface.
- `/api/health` is the canonical health endpoint.
- `/api/*` contains application APIs.
- `/uploads/*` serves uploaded files.
- Any non-API client route falls back to `index.html`.

Compatibility aliases still exist in the backend for older callers, but they are not the active contract.

## Development Shape

Local development remains split by process:

- Vite dev server for frontend work
- FastAPI dev server for backend work

That is a development convenience, not the production architecture.

## Storage

- Database: SQLite
- Uploads: local filesystem under `uploads/`
- Static frontend assets: baked into the production image

## Operational Implications

- One deployable service in production
- One health endpoint for platform checks
- No frontend Nginx proxy in the active production design
- No separate production frontend container in the active production design

## Historical Note

Earlier planning documents described split runtimes, Next.js pivots, and PocketBase-based designs. Those are historical artifacts only and should not be treated as the current architecture.
