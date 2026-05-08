# Property-Pi

Property-Pi is a lightweight property management app for small landlords and small portfolios.

It tracks:

- units
- tenants
- leases
- rent payments
- expenses
- maintenance requests
- tenant portal access
- uploaded receipts and documents

## Current Architecture

- Frontend: React + Vite SPA
- Backend: FastAPI + SQLite + JWT auth
- Auth: bearer token stored in `localStorage`
- Local dev: two-process setup with a Vite dev server and FastAPI
- Production direction: single Python runtime serving the built SPA and API together

## Repo Layout

- `frontend/` - React/Vite source
- `backend/` - FastAPI app, models, routers, tests, and migrations
- `docker-compose.yml` - production Dokploy/runtime compose
- `docker-compose.override.yml` - local development override

## Local Development

Install dependencies:

```bash
cd frontend
npm install
cd ../backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run the local dev stack:

```bash
# terminal 1
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# terminal 2
cd frontend
npm run dev
```

Local dev URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8000/api/health`
- Backend docs: `http://localhost:8000/docs`

## Production Build

The production compose is built from the repo root and uses the root `Dockerfile`.

```bash
docker compose -f docker-compose.yml config
docker compose -f docker-compose.yml up --build
```

Production expects:

- `SECRET_KEY`
- `DATABASE_URL`
- `ALLOWED_ORIGINS`
- `ENVIRONMENT=production`

## Auth Flow

The frontend stores the JWT access token in `localStorage` and sends it as:

```http
Authorization: Bearer <token>
```

The backend exposes canonical auth endpoints under:

- `/auth/register`
- `/auth/login`
- `/auth/me`
- `/auth/logout`

Compatibility routes remain in place during the rearchitecture transition.

## Deployment Notes

- Keep `SECRET_KEY` set to a non-default value in production.
- SQLite lives on a volume.
- Uploaded files live under `uploads/`.
- The repo is in the middle of a runtime simplification from a split frontend/backend container model to a single Python production service.

