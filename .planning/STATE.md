---
state_version: 4
last_updated: "2026-05-08"
runtime_status: current
production_runtime: single_fastapi_service
dev_runtime: vite_plus_fastapi
canonical_auth_prefix: /auth
canonical_health_path: /api/health
---

# State

## Current Runtime

- Production: single FastAPI service serving SPA + API
- Build source: root `Dockerfile`
- Compose source: `docker-compose.yml`
- Storage: SQLite + uploads

## Migration Status

- Split-runtime refactor: complete
- Doc cleanup after refactor: complete

## Archived History

- PocketBase-era planning: obsolete
- Next.js split-runtime planning: obsolete
- Frontend proxy/Nginx production assumptions: obsolete
