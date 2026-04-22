# Property-Pi Development Plan

## Architecture Change: Separate Python Backend

The application is being refactored from a monolithic Next.js app (with NextAuth + Prisma API routes) into a **separate Python FastAPI backend** with a **Next.js frontend** that only handles UI.

```
┌─────────────────────┐         ┌─────────────────────────┐         ┌──────────────┐
│  Next.js Frontend   │  HTTP   │  Python FastAPI Backend  │  DB     │  PostgreSQL  │
│  (React + Tailwind) │ ─────▶  │  (REST API)             │ ◀────── │              │
│  No server-side     │         │  - Auth (JWT)           │         │              │
│  logic anymore        │         │  - CRUD for all 7 models  │         │              │
│  Auth handled in    │         │  - Validation (Pydantic) │         │              │
│  browser (client)   │         │  - Dashboard aggregation │         │              │
└─────────────────────┘         └─────────────────────────┘         └──────────────┘
```

**Key changes:**
- Remove all `src/app/api/**` routes from Next.js
- Build a new Python FastAPI backend with all 15+ endpoints
- Frontend calls Python backend via `fetch()` instead of Next.js API routes
- Auth moves from NextAuth (server) to JWT-based (client-side session)
- Prisma ORM replaced by SQLAlchemy async in Python
- NextAuth replaced by `python-jose` + `passlib`

---

## Phase A: Backend Foundation (Python)

### A.1 Project Setup
- [ ] **A.1.1** Create `backend/` directory structure
- [ ] **A.1.2** Set up Python virtual environment
- [ ] **A.1.3** Install dependencies: `fastapi`, `uvicorn[standard]`, `sqlalchemy[async]`, `alembic`, `psycopg2-binary`, `pydantic`, `pydantic-settings`, `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart`, `httpx`
- [ ] **A.1.4** Create `requirements.txt`
- [ ] **A.1.5** Create `backend/app/main.py` — FastAPI app with CORS middleware, health check endpoint
- [ ] **A.1.6** Create `backend/app/config.py` — DB URL, JWT secret, settings via pydantic-settings
- [ ] **A.1.7** Create `backend/app/database.py` — async SQLAlchemy engine + session factory

### A.2 Database Models
- [ ] **A.2.1** Create `backend/app/models/` directory
- [ ] **A.2.2** Create SQLAlchemy async models mirroring Prisma schema exactly:
  - `User` — id, name, email (unique), password, role, timestamps
  - `Unit` — id, unitNumber (unique), type, status, rentAmount, securityDeposit, timestamps, relationships
  - `Tenant` — id, firstName, lastName, email (unique), phone, emergencyContact, unitId FK, timestamps, relationships
  - `Lease` — id, startDate, endDate, rentAmount, status, tenantId FK, unitId FK, documents, timestamps
  - `Payment` — id, amount, date, method, status, dueDate, unitId FK, leaseId FK, timestamps
  - `Expense` — id, amount, category, description, date, receiptUrl, unitId FK, timestamps
  - `MaintenanceRequest` — id, title, description, priority, status, cost, unitId FK, timestamps
  - `RentAdjustment` — id, oldRentAmount, newRentAmount, reason, effectiveDate, unitId FK, timestamps
  - `ContactLog` — id, type, subject, notes, date, tenantId FK, timestamps
  - `Notice` — id, type, title, content, sentAt, deliveredAt, unitId FK, timestamps
- [ ] **A.2.3** Create Alembic configuration (`alembic.ini`, `alembic/env.py`)
- [ ] **A.2.4** Create first migration to sync DB schema (drop all tables, recreate with SQLAlchemy)
- [ ] **A.2.5** Run migration against existing PostgreSQL database
- [ ] **A.2.6** Verify all tables created with correct constraints, indexes, foreign keys

---

## Phase B: Auth System

### B.1 Authentication Endpoints
- [ ] **B.1.1** Create `backend/app/routers/auth.py`
- [ ] **B.1.2** Implement `POST /auth/register` — create landlord account, hash password with passlib/bcrypt, return JWT
- [ ] **B.1.3** Implement `POST /auth/login` — verify email/password, return JWT access token
- [ ] **B.1.4** Implement `GET /auth/me` — return current user profile from JWT
- [ ] **B.1.5** Create `backend/app/deps.py` — JWT auth dependency (extract token from `Authorization: Bearer` header, verify, decode, return user)
- [ ] **B.1.6** Add auth protection to all data endpoints using FastAPI `Depends(auth_dependency)`
- [ ] **B.1.7** Test auth flow: register → login → access protected endpoint

---

## Phase C: CRUD Routers

### C.1 Unit Management
- [ ] **C.1.1** Create `backend/app/routers/units.py`
- [ ] **C.1.2** `GET /units` — list units with optional `status` and `q` query filters, include current tenant + active lease
- [ ] **C.1.3** `POST /units` — create unit, validate with Pydantic, 409 on duplicate unitNumber
- [ ] **C.1.4** `GET /units/{id}` — single unit with tenant, lease, and payment relations
- [ ] **C.1.5** `PATCH /units/{id}` — update unit, auto-create RentAdjustment on rent change
- [ ] **C.1.6** `DELETE /units/{id}` — delete unit, 409 if has tenants/leases

### C.2 Tenant Management
- [ ] **C.2.1** Create `backend/app/routers/tenants.py`
- [ ] **C.2.2** `GET /tenants` — list tenants with `q` search param (name/email/phone), include unit + active lease
- [ ] **C.2.3** `POST /tenants` — create tenant, 409 on duplicate email
- [ ] **C.2.4** `GET /tenants/{id}` — tenant detail with active lease + unit payments
- [ ] **C.2.5** `PATCH /tenants/{id}` — update tenant, 409 on duplicate email (excluding current)
- [ ] **C.2.6** `DELETE /tenants/{id}` — delete tenant, 409 if has active leases

### C.3 Lease Management
- [ ] **C.3.1** Create `backend/app/routers/leases.py`
- [ ] **C.3.2** `GET /leases` — list leases with optional `status` filter, include tenant + unit
- [ ] **C.3.3** `POST /leases` — create lease, 409 if unit has active lease, auto-update unit status to OCCUPIED
- [ ] **C.3.4** `GET /leases/{id}` — lease detail with tenant, unit, and payments
- [ ] **C.3.5** `PATCH /leases/{id}` — update lease status/dates/rent, auto-update unit status, auto-expire if past endDate

### C.4 Rent Tracking
- [ ] **C.4.1** Create `backend/app/routers/rent.py`
- [ ] **C.4.2** `GET /rent/month/{month}/{year}` — fetch payments for month, auto-update OVERDUE, calculate summary
- [ ] **C.4.3** `POST /rent/generate` — bulk create PENDING payments for all OCCUPIED units for current month
- [ ] **C.4.4** `POST /rent/{unitId}/mark-paid` — mark payment as PAID/PARTIAL, accept amount/method/date

### C.5 Expense Management
- [ ] **C.5.1** Create `backend/app/routers/expenses.py`
- [ ] **C.5.2** `GET /expenses` — list expenses with optional `category`, `unitId`, `month`, `year` filters
- [ ] **C.5.3** `POST /expenses` — create expense
- [ ] **C.5.4** `GET /expenses/{id}` — expense detail
- [ ] **C.5.5** `PATCH /expenses/{id}` — update expense
- [ ] **C.5.6** `DELETE /expenses/{id}` — delete expense

### C.6 Maintenance Management
- [ ] **C.6.1** Create `backend/app/routers/maintenance.py`
- [ ] **C.6.2** `GET /maintenance` — list requests with optional `status`, `priority`, `unitId` filters
- [ ] **C.6.3** `POST /maintenance` — create request
- [ ] **C.6.4** `GET /maintenance/{id}` — request detail
- [ ] **C.6.5** `PATCH /maintenance/{id}` — update request, auto-update unit status to OCCUPIED when completed
- [ ] **C.6.6** `DELETE /maintenance/{id}` — delete request

### C.7 Dashboard Aggregation
- [ ] **C.7.1** Create `backend/app/routers/dashboard.py`
- [ ] **C.7.2** `GET /dashboard` — aggregate all dashboard data in one call:
  - Unit counts by status
  - Monthly revenue (collected vs expected)
  - Occupancy rate
  - Expense breakdown (total, net profit, category breakdown)
  - Recent activities (payments, leases, maintenance — last 5)
  - Upcoming expirations (leases expiring in 60 days with urgency)
- [ ] **C.7.3** Use SQLAlchemy joins/queries to minimize DB round-trips

---

## Phase D: Frontend Migration

### D.1 Remove Next.js API Routes
- [ ] **D.1.1** Delete `src/app/api/` directory (all API routes)
- [ ] **D.1.2** Remove `src/lib/auth.ts` (NextAuth config)
- [ ] **D.1.3** Remove `src/app/(auth)/` directory (NextAuth layout, login page)
- [ ] **D.1.4** Remove `src/components/auth/session-provider.tsx`
- [ ] **D.1.5** Remove `src/middleware.ts` (NextAuth middleware)
- [ ] **D.1.6** Remove `next-auth` and `bcryptjs` from `package.json` dependencies

### D.2 Create Frontend API Client
- [ ] **D.2.1** Create `src/lib/api.ts` — centralized fetch wrapper:
  - Base URL from `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`)
  - Auto-attach `Authorization: Bearer <token>` header
  - Handle 401 responses → redirect to login
  - Typed request/response helpers for each endpoint
- [ ] **D.2.2** Create `src/lib/auth-client.ts` — client-side auth utilities:
  - `login(email, password)` → POST to `/auth/login`, store JWT in localStorage
  - `logout()` → clear localStorage, redirect to login
  - `getToken()` → get current token from localStorage
  - `isAuthenticated()` → check token validity

### D.3 Update Pages to Use Python Backend
- [ ] **D.3.1** Update `src/app/(dashboard)/page.tsx` — replace `fetch('/api/dashboard')` with `fetch('/api/dashboard')` (will be proxied or use BACKEND_URL)
- [ ] **D.3.2** Update all unit pages — replace API calls with new backend endpoints
- [ ] **D.3.3** Update all tenant pages — replace API calls with new backend endpoints
- [ ] **D.3.4** Update all lease pages — replace API calls with new backend endpoints
- [ ] **D.3.5** Update rent page — replace API calls with new backend endpoints
- [ ] **D.3.6** Update expense pages — replace API calls with new backend endpoints
- [ ] **D.3.7** Update maintenance pages — replace API calls with new backend endpoints

### D.4 Update Auth Flow
- [ ] **D.4.1** Create `src/app/(auth)/login/page.tsx` — new login page that POSTs to Python backend `/auth/login`
- [ ] **D.4.2** Store JWT in `localStorage` on successful login
- [ ] **D.4.3** Replace NextAuth `useSession()` with custom `useAuth()` hook
- [ ] **D.4.4** Create `src/lib/auth-provider.tsx` — React context provider for auth state
- [ ] **D.4.5** Update `src/app/(dashboard)/layout.tsx` — check auth on server-side render, redirect if no token
- [ ] **D.4.6** Update `src/app/(dashboard)/layout.tsx` — pass user info from localStorage instead of NextAuth session

### D.5 Update Layout & Components
- [ ] **D.5.1** Update `src/components/layout/header.tsx` — show logged-in user name, add logout button
- [ ] **D.5.2** Update `src/app/layout.tsx` — wrap with new auth provider (no SessionProvider)
- [ ] **D.5.3** Update `src/app/(auth)/layout.tsx` — minimal wrapper (no NextAuth)

---

## Phase E: Cleanup & Testing

### E.1 Dependency Cleanup
- [ ] **E.1.1** Remove `next-auth`, `bcryptjs` from `package.json`
- [ ] **E.1.2** Remove `@types/bcryptjs` from devDependencies
- [ ] **E.1.3** Run `npm install` and verify clean install
- [ ] **E.1.4** Remove `src/app/api/` from `.gitignore` if present

### E.2 TypeScript & Linting
- [ ] **E.2.1** Run `npx tsc --noEmit` — fix any type errors from removed NextAuth types
- [ ] **E.2.2** Run `npm run lint` — fix remaining warnings
- [ ] **E.2.3** Fix `useForm` watch() warning in lease-form.tsx (if still present)

### E.3 Build & Test
- [ ] **E.3.1** Run `npm run build` — verify zero errors
- [ ] **E.3.2** Start Python backend (`uvicorn backend.app.main:app --reload`)
- [ ] **E.3.3** Start Next.js dev server (`npm run dev`)
- [ ] **E.3.4** Test full auth flow: register → login → dashboard loads
- [ ] **E.3.5** Test CRUD for each entity: create, read, update, delete
- [ ] **E.3.6** Test rent generation and mark-paid workflow
- [ ] **E.3.7** Test dashboard shows accurate data
- [ ] **E.3.8** Test responsive layout on mobile viewport
- [ ] **E.3.9** Test edge cases: delete unit with tenants, duplicate email, invalid forms

---

## Phase F: Data Seeding

- [ ] **F.1** Create `backend/scripts/seed.py` — populate DB with demo data
- [ ] **F.2** Seed data: 5 units (3 occupied, 1 vacant, 1 under renovation), 3 tenants, 3 leases, 6-10 payments, 2-3 expenses, 1-2 maintenance requests
- [ ] **F.3** Add `backend/requirements.txt` with all backend dependencies
- [ ] **F.4** Add seed script to `package.json` or create standalone script

---

## Execution Order (Critical Path)

```
A.1 → A.2 → A.3 → B.1 → B.2 → C.1 → C.2 → C.3 → C.4 → C.5 → C.6 → C.7 → D.1 → D.2 → D.3 → D.4 → D.5 → E.1 → E.2 → E.3 → F
```

1. **Backend foundation** — models, DB, migrations (Phase A)
2. **Auth system** — JWT login/register (Phase B)
3. **CRUD routers** — all entity endpoints (Phase C)
4. **Frontend migration** — remove Next.js API routes, connect to Python backend (Phase D)
5. **Cleanup & testing** — remove unused deps, verify build (Phase E)
6. **Data seeding** — populate demo data (Phase F)

---

## Tech Stack Summary

| Layer | Tool |
|---|---|
| **Backend** | Python 3.12 + FastAPI |
| **DB ORM** | SQLAlchemy 2.x (async) |
| **Migrations** | Alembic |
| **Auth** | JWT (`python-jose`) + bcrypt (`passlib`) |
| **Validation** | Pydantic v2 |
| **Server** | Uvicorn (ASGI) |
| **Frontend** | Next.js 16 (frontend-only, no API routes) |
| **Frontend Auth** | Custom React context + localStorage JWT |
| **DB** | PostgreSQL (same as before) |

---

## API Endpoint Mapping (Next.js → Python)

| Current Route | Python Route | Methods |
|---|---|---|
| `POST /api/auth/[...nextauth]` | `POST /auth/login` | POST |
| *(new)* | `POST /auth/register` | POST |
| `GET /api/dashboard` | `GET /dashboard` | GET |
| `GET /api/units` | `GET /units` | GET |
| `POST /api/units` | `POST /units` | POST |
| `GET /api/units/[id]` | `GET /units/{id}` | GET |
| `PATCH /api/units/[id]` | `PATCH /units/{id}` | PATCH |
| `DELETE /api/units/[id]` | `DELETE /units/{id}` | DELETE |
| `GET /api/tenants` | `GET /tenants` | GET |
| `POST /api/tenants` | `POST /tenants` | POST |
| `GET /api/tenants/[id]` | `GET /tenants/{id}` | GET |
| `PATCH /api/tenants/[id]` | `PATCH /tenants/{id}` | PATCH |
| `DELETE /api/tenants/[id]` | `DELETE /tenants/{id}` | DELETE |
| `GET /api/leases` | `GET /leases` | GET |
| `POST /api/leases` | `POST /leases` | POST |
| `GET /api/leases/[id]` | `GET /leases/{id}` | GET |
| `PATCH /api/leases/[id]` | `PATCH /leases/{id}` | PATCH |
| `GET /api/rent/month/{month}/{year}` | `GET /rent/month/{month}/{year}` | GET |
| `POST /api/rent/generate` | `POST /rent/generate` | POST |
| `POST /api/rent/{unitId}/mark-paid` | `POST /rent/{unitId}/mark-paid` | POST |
| `GET /api/expenses` | `GET /expenses` | GET |
| `POST /api/expenses` | `POST /expenses` | POST |
| `GET /api/expenses/[id]` | `GET /expenses/{id}` | GET |
| `PATCH /api/expenses/[id]` | `PATCH /expenses/{id}` | PATCH |
| `DELETE /api/expenses/[id]` | `DELETE /expenses/{id}` | DELETE |
| `GET /api/maintenance` | `GET /maintenance` | GET |
| `POST /api/maintenance` | `POST /maintenance` | POST |
| `GET /api/maintenance/[id]` | `GET /maintenance/{id}` | GET |
| `PATCH /api/maintenance/[id]` | `PATCH /maintenance/{id}` | PATCH |
| `DELETE /api/maintenance/[id]` | `DELETE /maintenance/{id}` | DELETE |

---

## Risks & Considerations

- **JWT storage** — Use `localStorage` for simplicity, but be aware of XSS risk. Could upgrade to `httpOnly` cookies later.
- **CORS** — FastAPI needs `CORSMiddleware` configured for `http://localhost:3000`
- **Decimal handling** — Python/SQLAlchemy needs careful Decimal handling (matching Prisma's `DECIMAL` precision)
- **Prisma schema reuse** — Models recreated in SQLAlchemy but keep same column names, enums, and constraints for frontend compatibility
- **No Prisma in Python** — Backend uses SQLAlchemy directly
- **Dev workflow** — Both servers must run concurrently during development (Python on port 8000, Next.js on port 3000)
- **Production** — Consider Docker Compose to run both services together

---

## Success Criteria (per SPEC.md)

- [ ] ✅ Can see status of all units in under 5 seconds (dashboard loads instantly)
- [ ] ✅ Zero confusion on which tenant owes rent for the current month (rent page is clear)
- [ ] ✅ Clear visibility into monthly net profit (dashboard shows collected vs expected)
- [ ] ✅ All CRUD operations work through Python backend
- [ ] ✅ Auth works with JWT (login, protected routes, logout)
- [ ] ✅ Zero TypeScript errors, zero lint warnings
