# External Integrations

**Analysis Date:** 2026-04-21

## Primary Integration: PocketBase

### Database & Backend-as-a-Service
- **Service:** PocketBase (self-hosted)
- **Type:** Open-source backend with real-time database, authentication, and file storage
- **SDK/Client:** `pocketbase` ^0.25.0 (JavaScript)
- **Location:** Self-hosted binary at `/projects/property-pi/pocketbase`
- **Default URL:** `http://localhost:8090`
- **Environment Variable:** `NEXT_PUBLIC_POCKETBASE_URL`

**Integration Points:**
- Frontend SDK client: `src/lib/pocketbase.ts`
- Type definitions: `src/types/pocketbase.ts`
- API utilities: `src/lib/api.ts`, `src/lib/tenant-api.ts`
- FastAPI backend proxy: `backend/app/routers/*.py` via httpx

**Collections Used:**
- `users` - User authentication and profiles (landlord/tenant roles)
- `units` - Property unit records with status tracking
- `tenants` - Tenant information and contact details
- `leases` - Lease agreements linking tenants to units
- `payments` - Payment records (rent, deposits, fees)
- `expenses` - Expense tracking with categories
- `maintenance_requests` - Maintenance ticket system
- `notices` - Communications to tenants

**PocketBase Features Used:**
- **Authentication:** Built-in auth with email/password, JWT tokens
- **Real-time subscriptions:** WebSocket-based live updates
- **File storage:** Built-in file upload/download for attachments
- **REST API:** Direct HTTP access from FastAPI backend
- **Filtering:** Query filters via PocketBase API (e.g., date ranges, status)

## Data Storage

### PocketBase (Primary)
- **Type:** SQLite-based embedded database with REST API
- **Connection:** Local HTTP to `http://localhost:8090`
- **Client:** PocketBase SDK for frontend, httpx for backend
- **Migrations:** Handled via PocketBase UI or CLI (no Alembic/Prisma migrations)

### No Additional Storage
- **File Storage:** PocketBase built-in (no S3, Cloudinary)
- **Caching:** None detected (no Redis, Memcached)
- **Search:** PocketBase built-in search (no Elasticsearch, Algolia)

## Authentication & Identity

### PocketBase Auth
- **Provider:** PocketBase built-in authentication
- **Implementation:**
  - SDK client in `src/lib/pocketbase.ts`
  - Auth context/provider: `src/lib/AuthProvider.tsx`
  - Type-safe records in `src/types/pocketbase.ts`
- **Auth Flow:**
  - Email/password authentication via PocketBase
  - JWT tokens managed by PocketBase SDK
  - Role-based access: `landlord` | `tenant`

### No External Auth Providers
- No NextAuth.js (removed from dependencies)
- No OAuth providers (Google, GitHub, etc.)
- No custom JWT implementation (replaced by PocketBase auth)
- No bcryptjs (password hashing handled by PocketBase)

## External APIs & Services

### None Detected

No third-party API integrations are present:
- **Payment Processing:** No Stripe, PayPal, Square
- **Email Service:** No SendGrid, Resend, Mailgun
- **SMS/Notifications:** No Twilio, Firebase Cloud Messaging
- **Analytics:** No Google Analytics, Plausible, Mixpanel
- **Monitoring:** No Sentry, LogRocket, Datadog
- **File Storage:** No AWS S3, Cloudinary, Firebase Storage
- **Maps:** No Google Maps, Mapbox

All functionality is self-contained within:
- Next.js frontend
- FastAPI backend (aggregation layer)
- PocketBase database/auth

## Internal Integration Points

### Frontend → PocketBase (Direct SDK)
API utilities using PocketBase SDK directly:
- `src/lib/api.ts` - Main API client with CRUD operations
  - Functions: `fetchDashboardData()`, `createExpense()`, `updateExpense()`, `deleteExpense()`, etc.
  - Uses `pb.collection(...).create()`, `.update()`, `.delete()`, `.getList()`, `.getFirstListItem()`
- `src/lib/tenant-api.ts` - Tenant-specific operations
  - Uses `pb` client for tenant-facing API calls
- Type-safe record interfaces in `src/types/pocketbase.ts`

### Frontend → FastAPI Backend (HTTP)
Dashboard data aggregation:
- FastAPI endpoint: `/api/fastapi/dashboard` in `backend/app/routers/dashboard.py`
- Fetches from PocketBase via httpx:
  - Units: `/api/collections/units/records`
  - Payments: `/api/collections/payments/records` with date filters
  - Expenses: `/api/collections/expenses/records` with date filters
  - Leases: `/api/collections/leases/records`
- Returns aggregated summary (occupancy rate, revenue, expenses, expirations)

### FastAPI → PocketBase (HTTP API)
Backend aggregation layer:
- Config: `backend/app/config.py` with `pocketbase_url` setting
- HTTP client: `httpx.AsyncClient` for async PocketBase API calls
- Filter syntax: PocketBase query language (e.g., `date >= "2026-01-01"`)

## Webhooks & Callbacks

### Incoming Webhooks
- **None detected** - No webhook endpoints configured

### Outgoing Webhooks
- **None detected** - No outbound webhook calls

## Environment Configuration

### Required Environment Variables

**Frontend (.env):**
- `NEXT_PUBLIC_POCKETBASE_URL` - PocketBase server URL (default: `http://localhost:8090`)

**Backend (backend/.env via pydantic-settings):**
- `BACKEND_POCKETBASE_URL` - PocketBase server URL (default: `http://localhost:8090`)
- `BACKEND_ADMIN_TOKEN` - Admin token for PocketBase (if using admin API)
- `BACKEND_FASTAPI_PORT` - FastAPI server port (default: 8000)

**Note:** Prefix `BACKEND_` for backend-specific variables (per `config.py`)

### Secrets Location
- `.env` file at root (frontend)
- Backend uses pydantic-settings with `.env` file
- No secrets manager detected (AWS Secrets Manager, HashiCorp Vault)
- No encrypted secrets file (.env.production.local, etc.)

## Data Flow Summary

```
┌──────────────┐
│   Browser    │
│  (React UI)  │
└──────┬───────┘
       │
       │ PocketBase SDK
       ▼
┌─────────────────────────────────────────┐
│           PocketBase                    │
│  ┌─────────────────────────────────┐    │
│  │  Database (SQLite)              │    │
│  │  Authentication (JWT)           │    │
│  │  File Storage                   │    │
│  │  Real-time Subscriptions        │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
       ▲
       │ httpx HTTP Client
       │ (FastAPI backend)
       │
┌──────┴───────┐
│  FastAPI     │
│  (port 8000) │
│ Aggregation  │
│   Layer      │
└──────────────┘
```

## Integration Patterns

### Direct SDK Pattern (Frontend)
```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase'
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090')

// src/lib/api.ts
const records = await pb.collection('units').getList(1, 50, {
  filter: 'status = "occupied"'
})
```

### HTTP Proxy Pattern (Backend)
```python
# backend/app/routers/dashboard.py
async with httpx.AsyncClient() as client:
    units_resp = await client.get(
        f"{settings.pocketbase_url}/api/collections/units/records",
        params={"perPage": "100"}
    )
```

## Migration Notes

### Removed Integrations
- **Prisma ORM:** Previously used, now removed (no `prisma/` directory)
- **PostgreSQL:** No longer the database (replaced by PocketBase SQLite)
- **NextAuth.js:** Previously used for auth, now replaced by PocketBase auth
- **bcryptjs:** Previously used for password hashing, now handled by PocketBase
- **SQLAlchemy/Alembic:** Present in requirements.txt but not actively used

---

*Integration audit: 2026-04-21*
