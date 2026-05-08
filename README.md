# Property-Pi

Property-Pi is a property management app for small landlords. The current production runtime is a single FastAPI service that serves both the React/Vite SPA and the API from one container built with the root `Dockerfile`.

## Current Runtime

- Frontend source: React + Vite SPA in `frontend/`
- Backend: FastAPI + SQLAlchemy + SQLite in `backend/`
- Production packaging: one Python service serving SPA assets, API routes, and `/uploads/*`
- Production entrypoint: root `Dockerfile`
- Production compose: `docker-compose.yml`

## Canonical Routes

- SPA: `/`
- Auth: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`
- Health: `/api/health`
- Uploads: `/uploads/{filename}`
- API docs: `/docs`

Legacy aliases still exist in code for compatibility, but active docs and new integrations should use the routes above.

## Repo Layout

- `frontend/` SPA source
- `backend/` FastAPI app, models, routers, and tests
- `Dockerfile` production image build
- `docker-compose.yml` single-service production compose
- `uploads/` local upload storage

## Local Development

Development still uses two processes:

```bash
# backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```bash
# frontend
cd frontend
npm install
npm run dev
```

Local URLs:

- SPA dev server: `http://localhost:5173`
- API health: `http://localhost:8000/api/health`
- FastAPI docs: `http://localhost:8000/docs`

## Production

Build and run the current production stack from the repo root:

```bash
docker compose -f docker-compose.yml config
docker compose -f docker-compose.yml up --build
```

Expected environment variables:

- `SECRET_KEY`
- `DATABASE_URL`
- `ALLOWED_ORIGINS`
- `ENVIRONMENT=production`

## Notes

- SQLite data should live on a persistent volume.
- Uploads should live on persistent storage.
- The old split-runtime and PocketBase-era docs are retained only as archived notes where needed.
