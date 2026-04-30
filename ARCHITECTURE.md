# Architecture: Property-Pi

## Overview

Property-Pi is a two-service application consisting of a Next.js frontend and a FastAPI backend, backed by a single SQLite database.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (port 3000)         │  │
│  │                                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │  │
│  │  │ (dashboard)│ │ login/   │  │ tenant/        │  │  │
│  │  │ Landlord │  │ Login    │  │ Tenant Portal  │  │  │
│  │  │ Pages    │  │ Page     │  │ (shared link)  │  │  │
│  │  └──────────┘  └──────────┘  └────────────────┘  │  │
│  │                                                   │  │
│  │  Auth: session cookie (JWT, 2h expiry)            │  │
│  │  Server Actions → GET /api/* with token header    │  │
│  └───────────────────────────────────────────────────┘  │
│                              │                          │
│                              │ HTTP (token in header)   │
│                              ▼                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │          FastAPI Backend (port 8000)              │  │
│  │                                                   │  │
│  │  /api/*  — REST endpoints                         │  │
│  │  /uploads/* — static file serving                 │  │
│  │  /docs        — Swagger UI                        │  │
│  │                                                   │  │
│  │  Auth: JWT (HS256) + bcrypt password hashing      │  │
│  │  Rate limiting: slowapi (IP-based)                │  │
│  │  CORS: configurable via ALLOWED_ORIGINS           │  │
│  └───────────────────────────────────────────────────┘  │
│                              │                          │
│                              │ SQLAlchemy ORM           │
│                              ▼                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │           SQLite Database                         │  │
│  │           property_pi.db                          │  │
│  │                                                   │  │
│  │  Tables: users, units, tenants, leases,           │  │
│  │          payments, expenses, maintenance, notices │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Framework: Next.js 14+ (App Router)

The frontend is a thin client that communicates with the FastAPI backend via REST APIs. It uses Server Actions for authenticated requests and client-side actions for auth flows.

### Routing Structure

```
src/app/
├── (dashboard)/              # Route group — landlord pages
│   ├── layout.tsx            # Dashboard layout with auth guard + sidebar
│   ├── page.tsx              # Dashboard overview
│   ├── units/                # Unit CRUD
│   ├── tenants/              # Tenant CRUD
│   ├── leases/               # Lease CRUD
│   ├── rent/                 # Rent payments
│   ├── expenses/             # Expense CRUD
│   └── maintenance/          # Maintenance request CRUD
├── login/                    # Login page
├── tenant/                   # Tenant portal
│   └── portal/               # Shared-link tenant dashboard
├── actions/                  # Server Actions
│   ├── auth-actions.ts       # signIn, signOut, register (client-side)
│   ├── unit-actions.ts       # CRUD unit operations
│   ├── tenant-actions.ts     # CRUD tenant operations
│   ├── lease-actions.ts      # CRUD lease operations
│   ├── payment-actions.ts    # Payment operations
│   ├── expense-actions.ts    # CRUD expense operations
│   ├── maintenance-actions.ts# CRUD maintenance operations
│   └── dashboard-actions.ts  # Dashboard data fetch
├── layout.tsx                # Root layout
└── page.tsx                  # Root redirect (→ /login or /dashboard)
```

### Auth Flow

1. **Registration/Login** (`'use client'` Server Action):
   - `signIn(email, password)` calls `POST /api/auth/login`
   - On success, sets `session=<jwt>` cookie (2h expiry, SameSite=Lax)
   - `register(name, email, password)` calls `POST /api/auth/register`
   - Same cookie setting on success

2. **Authenticated Requests** (`'use server'` Server Actions):
   - `getServerToken()` reads `session` cookie from `next/headers`
   - Passes token as `Authorization: Bearer <token>` header to `apiRequest()`
   - All CRUD Server Actions follow this pattern

3. **Client-Side Auth** (`api-client.ts`):
   - Reads `session` cookie from `document.cookie` for client-side requests
   - Accepts explicit `token` parameter for server-side requests
   - Handles 401/403 by redirecting to login

4. **Dashboard Layout Guard**:
   - `(dashboard)/layout.tsx` checks for valid session
   - Redirects to `/login` if no valid token

### Component Architecture

- **shadcn/ui**: Reusable UI components (Button, Input, Dialog, Table, etc.)
- **Dashboard Layout**: Sidebar navigation + header with user info and logout
- **Feature Pages**: Each CRUD entity has list page, detail page, new page, and edit page
- **Tenant Portal**: Read-only view of lease, payments, maintenance, notices

## Backend Architecture

### Framework: FastAPI

REST API with SQLite backend, JWT authentication, and file upload support.

### Module Structure

```
backend/app/
├── main.py               # FastAPI app, CORS, static files, router mounting
├── config.py             # Settings (env vars with aliases, JWT secret validation)
├── database.py           # SQLite connection, Session factory
├── models.py             # SQLAlchemy declarative models (8 tables)
├── schemas.py            # Pydantic schemas (request validation + response types)
├── auth.py               # JWT create/verify, bcrypt hash/verify, get_current_user
└── routers/              # API route handlers
    ├── health.py         # GET /api/health
    ├── auth.py           # POST /register, /login, /me, /logout
    ├── units.py          # Unit CRUD + rent_history JSON endpoints
    ├── tenants.py        # Tenant CRUD + contact_log JSON endpoints
    ├── leases.py         # Lease CRUD + share-link generation
    ├── payments.py       # Payment CRUD + monthly rent generation
    ├── expenses.py       # Expense CRUD
    ├── maintenance.py    # Maintenance CRUD
    ├── dashboard.py      # Aggregated dashboard stats
    ├── tenant_portal.py  # Shared-link tenant data access
    └── upload.py         # File upload endpoint
```

### Database Layer

**SQLite** with SQLAlchemy ORM. Tables are created automatically on backend startup via `Base.metadata.create_all()`.

**Model naming convention**: SQLAlchemy models use singular nouns (`Unit`, `Tenant`) while table names use singular (`units`, `tenants`). Column names are designed to match the frontend TypeScript types for consistency.

**Field name mapping**: Backend uses database column names (`number`, `rent`, `deposit`) while API endpoints use frontend-friendly names (`unit_number`, `rent_amount`, `security_deposit`). The `_to_out` serializer functions handle this mapping.

### JSON Fields

Two fields use SQLite Text columns storing JSON, with dedicated CRUD endpoints:

- **`Unit.rent_history`**: Stores array of rent adjustment records
  - `POST /api/units/{id}/rent-history` — append entry
  - `GET /api/units/{id}/rent-history` — get history
  - `PUT /api/units/{id}/rent-history` — replace entire history

- **`Tenant.contact_log`**: Stores array of interaction entries
  - `POST /api/tenants/{id}/contact-log` — append entry
  - `GET /api/tenants/{id}/contact-log` — get log
  - `PUT /api/tenants/{id}/contact-log` — replace entire log

### Authentication

**JWT (HS256)** with bcrypt password hashing:

1. `create_access_token(data)` creates JWT with `sub` (user ID), `email`, `name`, `exp`
2. `verify_password(plain, hash)` uses bcrypt to compare
3. `hash_password(plain)` generates bcrypt hash
4. `get_current_user(token)` extracts and validates JWT, returns user dict
5. Sessions expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 120)

**Security**: Default JWT secret triggers a `RuntimeWarning` on startup if not overridden by environment.

### File Uploads

`POST /api/upload/` accepts multipart file uploads:
- Max size: 10MB
- Allowed extensions: pdf, jpg, jpeg, png, gif, webp, doc, docx
- Filenames are sanitized (alphanumeric + `_`, `-`, ` `) with UUID prefix
- Files stored in `uploads/` directory, served at `/uploads/{filename}`

### Rate Limiting

Implemented via `slowapi` middleware — IP-based rate limiting applied to all endpoints.

### CORS

Origins configured via `ALLOWED_ORIGINS` env var (comma-separated string). Parsed into list and applied to `CORSMiddleware`.

## Data Flow

### Landlord Creating a Unit

```
Dashboard UI → Unit Form → createUnitAction (Server Action)
  → getServerToken() reads session cookie
  → apiRequest('POST /api/units', { token })
  → FastAPI: validate schema, create SQLAlchemy model, commit
  → _unit_to_out() serializes to dict
  → JSON response → UI shows new unit
```

### Tenant Accessing Portal

```
Shared link (from lease detail page) → Tenant Portal page
  → Reads leaseId + token from URL query params
  → apiRequest('GET /api/tenant/{leaseId}?token={token}')
  → FastAPI: validates token against Lease.tenant_access
  → Returns lease, payments, maintenance, notices
  → UI shows read-only tenant dashboard
```

## Deployment

### Docker Compose

`docker-compose.yml` defines two services:
1. **app** (Next.js): Built from Dockerfile, port 3000, depends on backend
2. **backend** (FastAPI): Built from backend/Dockerfile, port 8000, SQLite volume

SQLite database stored in mounted volume at `prop-pi-data:/app/property_pi.db`.

### Production Checklist

- [ ] Set `SECRET_KEY` / `JWT_SECRET` to strong random value
- [ ] Set `ALLOWED_ORIGINS` to production domain
- [ ] Set `ACCESS_TOKEN_EXPIRE_MINUTES` as appropriate
- [ ] Use reverse proxy for HTTPS
- [ ] Regular database backups
- [ ] Monitor SQLite file size and performance
- [ ] Consider Alembic for schema migrations

## Evolution History

| Phase | Architecture | Status |
|-------|-------------|--------|
| v1.0 | Next.js + PocketBase + FastAPI (hybrid) | Complete, abandoned |
| post-v1.0 | Next.js single service + SQLite + Drizzle + Server Actions | Complete, abandoned |
| post-v1.1 | Next.js frontend + FastAPI backend + SQLite | **Current** |
