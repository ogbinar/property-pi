# External Integrations

**Analysis Date:** 2026-04-21

## APIs & External Services

**Database & Backend-as-a-Service:**
- **PocketBase** - Primary database and authentication provider
  - SDK/Client: `pocketbase` npm package (0.25.0)
  - Frontend URL: `NEXT_PUBLIC_POCKETBASE_URL` (default: `http://localhost:8090`)
  - Backend URL: `POCKETBASE_URL` or `BACKEND_POCKETBASE_URL` (default: `http://localhost:8090`)
  - Admin Auth: `BACKEND_POCKETBASE_ADMIN_TOKEN` environment variable (optional for local dev)
  - Docker Image: `frodenas/pocketbase:0.24.0`
  - Implementation: Direct SDK usage in frontend (`src/lib/pocketbase.ts`), HTTP client (`httpx`) in backend

## Data Storage

**Databases:**
- **PocketBase** (SQLite-based real-time backend)
  - Connection: `NEXT_PUBLIC_POCKETBASE_URL` (frontend), `POCKETBASE_URL` (backend)
  - Client: PocketBase JavaScript SDK (`src/lib/pocketbase.ts`)
  - ORM: Not used - PocketBase provides direct API access
  - Data collections: Users, Units, Tenants, Leases, Payments, Expenses, Maintenance, Notices

**File Storage:**
- PocketBase file upload capability (noted in `ExpenseRecord` interface with `file: string | null`)
- No external file storage service detected (AWS S3, Cloudinary, etc.)

**Caching:**
- None detected (PocketBase handles data caching internally)

## Authentication & Identity

**Auth Provider:**
- **PocketBase** - Built-in authentication system
  - Implementation: Email/password authentication via PocketBase SDK
  - Auth context: `src/lib/AuthProvider.tsx` wraps app with auth state
  - Guard component: `src/components/auth/AuthGuard.tsx` protects routes
  - User roles: `landlord` and `tenant` (defined in `UserRecord` interface)

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, or similar services)

**Logs:**
- Console logging only (no structured logging framework detected)
- FastAPI provides automatic request logging via Uvicorn

## CI/CD & Deployment

**Hosting:**
- Docker-based deployment (multi-stage builds)
- Docker Compose orchestration (`docker-compose.yml`)
- No cloud provider detected (AWS, Vercel, Heroku, etc.)

**CI Pipeline:**
- None detected (no GitHub Actions, GitLab CI, Jenkins, etc.)

## Environment Configuration

**Required env vars:**

*Frontend (Next.js):*
- `NEXT_PUBLIC_POCKETBASE_URL` - PocketBase API URL (must be publicly accessible)
- `NEXT_PUBLIC_API_URL` - Backend API URL (set in docker-compose)

*Backend (FastAPI):*
- `POCKETBASE_URL` - PocketBase API URL for server-to-server communication
- `BACKEND_SECRET_KEY` - Secret key for backend operations (default: `property-pi-secret-key`)
- `FASTAPI_PORT` - Backend server port (default: 8000)
- `BACKEND_POCKETBASE_ADMIN_TOKEN` - Optional admin token for elevated privileges

**Secrets location:**
- Environment variables via `.env` files (not committed to git)
- `.env.example` and `.env.production.example` provide templates
- Secrets stored in runtime environment, not in code

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook endpoints configured)

**Outgoing:**
- None detected (no external webhook calls)

## Rate Limiting

**Provider:**
- **SlowAPI** - Rate limiting for FastAPI backend
  - Client: `slowapi` 0.1.9
  - Implementation: `Limiter` with `get_remote_address` key function
  - Applied to: All backend routes via middleware in `backend/app/main.py`
  - Response: 429 status with "Rate limit exceeded" message

## Security Headers

**Implemented via Next.js config (`next.config.ts`):**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## CORS Configuration

**FastAPI Backend:**
- Allowed origins: `http://localhost:3000` (Next.js dev server)
- Credentials: Allowed
- Methods: All (`*`)
- Headers: All (`*`)
- Location: `backend/app/main.py`

---

*Integration audit: 2026-04-21*
