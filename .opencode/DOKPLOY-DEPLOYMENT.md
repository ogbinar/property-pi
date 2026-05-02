# Property-Pi Dokploy Deployment Guide

## Architecture

- **Frontend:** Vite + React (port 5173)
- **Backend:** FastAPI + Python 3.12 (port 8000)
- **Database:** SQLite (persistent volume)

## Environment Variables

Create a `.env` file with:

```bash
# Backend
DATABASE_URL=sqlite:////data/property_pi.db
SECRET_KEY=<generate-with-openssl-rand-base64-32>
ACCESS_TOKEN_EXPIRE_MINUTES=120
ALLOWED_ORIGINS=https://property-pi.apps.ogbinar.com
ENVIRONMENT=production

# Frontend
VITE_API_BASE_URL=/api
```

## Dokploy Configuration

1. **Create Compose Project** in Dokploy pointing to `https://github.com/ogbinar/property-pi`
2. **Set Environment Variables** in Dokploy's UI for:
   - `SECRET_KEY`
   - `ALLOWED_ORIGINS`
3. **Configure Domains:**
   - Frontend: `property-pi.apps.ogbinar.com` → port 5173
   - Backend: `property-pi.apps.ogbinar.com/api/*` → port 8000
4. **Enable Volumes** for `backend_db_data`

## Deployment

```bash
# Push to GitHub (Dokploy auto-deploys)
git push

# Or deploy manually
docker compose up -d --build
```

## Admin Login

After first deployment, create admin user or set:

```bash
CREATE_DEFAULT_ADMIN=true
DEFAULT_ADMIN_PASSWORD=<your-password>
```

Then restart the backend container.

## Health Check

- Basic: `https://property-pi.apps.ogbinar.com/api/health`
- Database: `https://property-pi.apps.ogbinar.com/api/health/db`
- Full: `https://property-pi.apps.ogbinar.com/api/health/full`
