# Architecture Decision: PocketBase + FastAPI Hybrid

**Date:** 2026-04-21
**Status:** **SUPERSEDES ALL** prior Phase 1 plans, Phase 2 plans, and all files in `plans/`
**Author:** Property-Pi architecture review
**Applies to:** Entire project — frontend, backend, deployment

---

## 1. Supersession Declaration

This document **explicitly supersedes** the following artifacts:

| Superseded By | What It Was | Why |
|---------------|-------------|-----|
| `plans/01-setup-infrastructure.md` | Prisma + PostgreSQL + NextAuth auth flow | Wrong DB, wrong auth, wrong backend |
| `plans/00-schema-refactoring.md` | Prisma schema migrations with PostgreSQL | Wrong DB engine, wrong ORM |
| `plans/99-fix-for-running.md` | Prisma-based fixes for missing routes | Entirely wrong stack |
| `plans/02-unit-management.md` | CRUD via Prisma → PostgreSQL | Wrong data layer |
| `plans/03-tenant-management.md` | CRUD via Prisma → PostgreSQL | Wrong data layer |
| `plans/04-lease-management.md` | CRUD via Prisma → PostgreSQL | Wrong data layer |
| `plans/05-rent-tracking.md` | CRUD via Prisma → PostgreSQL | Wrong data layer |
| `plans/06-dashboard.md` | Dashboard via Prisma aggregation | Wrong data layer |
| `plans/07-data-seeding.md` | Prisma seed script | Wrong ORM |
| `plans/21-expense-management.md` | CRUD via Prisma → PostgreSQL | Wrong data layer |
| `plans/22-maintenance-tracking.md` | CRUD via Prisma → PostgreSQL | Wrong data layer |
| `plans/23-enhanced-dashboard.md` | Dashboard via Prisma aggregation | Wrong data layer |
| `plans/24-file-upload-integration.md` | File uploads via Prisma → PostgreSQL | Wrong data layer |
| `.planning/phases/02/02-PLAN.md` | Auth via FastAPI token + localStorage | Competing auth approach |
| `.planning/research/STACK.md` | Suggested removing FastAPI entirely | **Corrected** — FastAPI stays for reporting/automation |

All of the above used **Prisma + PostgreSQL + NextAuth** as the backend stack. This is now obsolete.

**What remains valid:** The ROADMAP.md phase structure (Phase 1–5), the requirements (REQ-01 through REQ-15), and the existing Next.js UI component hierarchy. The data layer and auth mechanism change; everything else stands.

---

## 2. The Three Auth Approaches — Resolution

During development, **three competing authentication approaches** were implemented simultaneously:

### The Approaches

| # | Approach | Where It Lives | What It Does |
|---|----------|----------------|--------------|
| **A** | **PocketBase auth** | `src/lib/pocketbase.ts` | Singleton PocketBase SDK instance, initialized with `POCKETBASE_URL`. Does NOT yet handle auth flow. |
| **B** | **FastAPI token auth** | `src/lib/AuthProvider.tsx` | Makes `fetch()` calls to `http://localhost:8000/auth/login`, stores `access_token` in localStorage, fetches `/auth/me` for user profile |
| **C** | **NextAuth (legacy, stripped)** | Previously in `src/app/(auth)/`, `src/middleware.ts`, `src/lib/auth.ts` | All files deleted; no references remain in source code |

### Why This Happened

Phase 1 cleanup deleted NextAuth files and Prisma. Phase 2 was supposed to add PocketBase auth. However, `src/lib/AuthProvider.tsx` was created with FastAPI token auth instead of PocketBase auth — it makes raw `fetch()` calls to FastAPI endpoints (`/auth/login`, `/auth/me`) that **do not exist** in the current FastAPI codebase. The PocketBase SDK singleton exists but is unused for auth.

### The Decision: PocketBase Auth (Approach A)

**PocketBase email/password auth is the single auth approach for this project.**

| Factor | PocketBase Auth | FastAPI Token Auth | NextAuth (legacy) |
|--------|----------------|---------------------|-------------------|
| Already installed | ✅ SDK singleton exists | ❌ AuthProvider calls non-existent FastAPI endpoints | ❌ Deleted |
| Auth provider exists | ✅ PocketBase `users` collection | ❌ No auth router in FastAPI | ❌ Gone |
| Password hashing | ✅ Built-in (bcrypt) | ❌ Would need to implement | ❌ Deleted |
| Session management | ✅ `pb.authStore` (localStorage) | ❌ Manual localStorage, no refresh | ❌ Cookie-based, complex |
| Dashboard protection | ✅ `pb.authStore.isValid` check | ❌ Would need middleware | ❌ NextAuth middleware deleted |
| File upload auth | ✅ SDK handles token | ❌ Would need manual token forwarding | ❌ |
| Tenant portal | ✅ Works with shared link tokens | ❌ Would conflict with FastAPI auth | ❌ |
| Complexity | ✅ 1 SDK call (`authWithPassword`) | ❌ 2+ fetch calls, manual token mgmt | ❌ |

**Rationale:** The architecture is PocketBase-first. PocketBase handles auth, database, and file storage. FastAPI is reporting/automation only. Auth via FastAPI would require building an auth provider in FastAPI that talks to PocketBase — circular, complex, and unnecessary when PocketBase already provides auth natively.

### What This Means for `src/lib/AuthProvider.tsx`

The current `src/lib/AuthProvider.tsx` (which calls FastAPI `/auth/login`) **must be rewritten** to use the PocketBase SDK:

```typescript
// New AuthProvider uses PocketBase, NOT FastAPI
'use client'
import pb from '@/lib/pocketbase'

export function AuthProvider({ children }) {
  // Uses pb.authStore (not fetch + localStorage)
  // signIn calls pb.authWithPassword(email, password)
  // signOut calls pb.authStore.clear()
}
```

---

## 3. The Hybrid Architecture — Single Source of Truth

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND (Vercel)                     │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Dashboard      │  │  Unit/Tenant/   │  │  Tenant Portal  │  │
│  │  (landing)      │  │  Lease Pages    │  │  (shared link)  │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                     │            │
│  ┌────────┴────────────────────┴─────────────────────┴────────┐  │
││  PocketBase JS SDK (src/lib/pocketbase.ts)                    │  │
││  - authWithPassword() → session token in pb.authStore         │  │
││  - collection CRUD → all data operations                      │  │
││  - files → file upload/download                               │  │
│ └─────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              POCKETBASE BACKEND (fly.io / Railway)           ││
│  │                                                             ││
│  │  Auth (users collection)    Collections (7 base + auth)     ││
│  │  ┌──────────┐              ┌──────────┐  ┌──────────┐      ││
│  │  │  Email/  │              │  units   │  │ tenants  │      ││
│  │  │ Password │              │  tenants │  │ leases   │      ││
│  │  │  Auth    │              │  leases  │  │ payments │      ││
│  │  └──────────┘              │  payments│  │ expenses │      ││
│  │                             │  expenses│  │ maint.   │      ││
│  │                             │  maintenance│ │ notices  │      ││
│  │                             └──────────┘  └──────────┘      ││
│  │                                                             ││
│  │  ┌──────────────────────────────────┐                       ││
│  │  │  SQLite Database (embedded)       │                       ││
│  │  └──────────────────────────────────┘                       ││
│  │                                                             ││
│  │  ┌──────────────────────────────┐                            ││
│  │  │  File Storage (uploads/)      │                            ││
│  │  └──────────────────────────────┘                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              POCKETBASE ADMIN PANEL                          ││
│  │  /admin on PocketBase host — landlord data inspector         ││
│  └─────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              FASTAPI BACKEND (same host as PocketBase)       ││
│  │                                                             ││
│  │  /api/fastapi/dashboard  — aggregation queries              ││
│  │  /api/fastapi/rent/generate — monthly rent creation          ││
│  │  /api/fastapi/rent/mark-overdue — overdue detection          ││
│  │  /api/fastapi/leases/expiring — expiry alerts                ││
│  │  /api/fastapi/expenses/report — expense breakdown            ││
│  │  /health — health check                                     ││
│  │                                                             ││
│  │  Communicates with PocketBase via Admin API                 ││
│  │  (NOT direct DB access, NOT Prisma, NOT SQLAlchemy)         ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **PocketBase Auth** | Email/password auth, session tokens, password hashing | Next.js frontend (via JS SDK) |
| **PocketBase Collections** | All CRUD data — units, tenants, leases, payments, expenses, maintenance, notices | Next.js frontend (via JS SDK) |
| **PocketBase File Storage** | Lease documents, expense receipts | Next.js frontend (via JS SDK) |
| **PocketBase Admin Panel** | Data inspection, record CRUD (landlord tool) | Landlord only (separate UI) |
| **SQLite** | Embedded database for all data | PocketBase (internal) |
| **FastAPI** | **Reporting, automation, aggregation ONLY** — NOT CRUD, NOT auth | PocketBase Admin API (HTTP calls) |

### What FastAPI Actually Does

**FastAPI is NOT a CRUD backend. It is NOT an auth provider. It is NOT a data store.**

FastAPI handles exactly four categories of work that PocketBase doesn't handle natively:

| Category | What | Why PocketBase Can't Do It |
|----------|------|---------------------------|
| **Dashboard aggregation** | Single endpoint returning unit counts, revenue, expenses, occupancy, lease expirations | PocketBase returns one record at a time; aggregation requires JOINs across 7 collections |
| **Rent automation** | Monthly rent generation, overdue marking, lease expiry detection | Requires date math, bulk operations, scheduled execution |
| **Expense reporting** | Category breakdown, net profit calculation, time-range filtering | Requires GROUP BY, date range filtering, aggregation |
| **Health check** | `/health` endpoint for deployment monitoring | No built-in health endpoint |

**What FastAPI does NOT do:**
- ❌ Does NOT handle authentication
- ❌ Does NOT serve CRUD data to the frontend
- ❌ Does NOT store data
- ❌ Does NOT manage files
- ❌ Does NOT talk to the database directly (it talks to PocketBase Admin API)

### Tenant Portal Auth

Tenant access uses **shared link tokens — NOT PocketBase auth**:

```
Landlord shares link: /tenant/portal?token={leaseId}:{token}
        ↓
Tenant opens URL (no login required)
        ↓
Next.js page validates token against PocketBase leases collection
        ↓
Tenant sees: lease details, payment history, maintenance status, notices
        ↓
Tenant can submit maintenance requests (via PocketBase SDK, no auth required)
```

The tenant portal bypasses PocketBase auth entirely. It validates the shared token client-side against the `leases` collection. This is a **read-only** (plus maintenance submissions) view — tenants cannot access landlord pages.

---

## 4. PocketBase Collection Structure

The Prisma schema (9 models) maps to PocketBase (7 collections):

| Prisma Model | PocketBase Collection | Notes |
|--------------|----------------------|-------|
| `User` | `users` | Built-in auth collection. Email/password. |
| `Unit` | `units` | `rentHistory` (JSON) replaces `RentAdjustment[]` |
| `Tenant` | `tenants` | `contactLog` (JSON) replaces `ContactLog[]` |
| `Lease` | `leases` | File field replaces `documents: String[]` |
| `Payment` | `payments` | `dueDate` included |
| `Expense` | `expenses` | File field replaces `receiptUrl: String?` |
| `MaintenanceRequest` | `maintenance` | |
| `Notice` | `notices` | |
| `RentAdjustment` | → JSON on `units` | `rentHistory` field |
| `ContactLog` | → JSON on `tenants` | `contactLog` field |

**Why JSON for RentAdjustment and ContactLog:** These are append-only logs tied to single parent records. For a ≤5 unit portfolio, separate collections add complexity without benefit.

---

## 5. Data Flow

### Authentication Flow (PocketBase)

```
User enters email/password on /login
        ↓
Next.js → pb.collection('users').authWithPassword(email, password)
        ↓
PocketBase validates credentials, returns { token, record }
        ↓
pb.authStore.token → localStorage (automatic via SDK)
        ↓
Layout checks pb.authStore.isValid
        ↓
Dashboard renders → all PocketBase SDK calls include auth token
```

### Dashboard Data Fetch

```
Client component useEffect
        ↓
pb.collection('units').getFullList({ expand: 'tenants' })
        ↓
PocketBase SDK attaches auth token → POST /api/collections/units/records
        ↓
PocketBase evaluates rules → returns JSON
        ↓
For aggregation (revenue, occupancy):
        ↓
pb.collection('payments').getFullList() + pb.collection('expenses').getFullList()
        OR
        ↓
GET /api/fastapi/dashboard (single aggregated response)
```

### Form Submission

```
User submits form (react-hook-form + Zod)
        ↓
Client validates with Zod
        ↓
pb.collection('units').create(formData) or .update(id, data)
        ↓
PocketBase validates → listRule → saves to SQLite
        ↓
Returns updated record → React re-renders
```

---

## 6. API Rules

All landlord-facing collections require authentication:

| Collection | All Rules |
|------------|-----------|
| `users` | `@request.auth.id != ''` (list/view/create/update/delete) |
| `units` | `@request.auth.id != ''` (all) |
| `tenants` | `@request.auth.id != ''` (all) |
| `leases` | `@request.auth.id != ''` (all) |
| `payments` | `@request.auth.id != ''` (all) |
| `expenses` | `@request.auth.id != ''` (all) |
| `maintenance` | `@request.auth.id != ''` (all) |
| `notices` | `@request.auth.id != ''` (all) |

**Tenant portal exception:** Tenant portal pages do NOT use PocketBase auth rules. They validate the shared link token client-side against the `leases` collection. The `leases` collection rules still require auth, but the tenant portal uses a special bypass (admin API key or permissive rules for the `leases` collection view endpoint when accessed from tenant portal domain).

---

## 7. Key Decisions

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| **D-01** | PocketBase for auth, data, and file storage | Single binary, built-in admin panel, SQLite, email/password auth | ✅ Confirmed |
| **D-02** | FastAPI for reporting and automation only | PocketBase can't do aggregation/JOINs; FastAPI handles dashboard queries | ✅ Confirmed |
| **D-03** | Next.js as frontend only (zero server-side logic) | No Prisma, no NextAuth, no bcrypt — all backend logic goes to PocketBase/FastAPI | ✅ Confirmed |
| **D-04** | SQLite for dev and production | PocketBase uses SQLite natively; cheap hosting; no separate DB maintenance | ✅ Confirmed |
| **D-05** | Landlord-only auth (single PocketBase user) | No self-registration; tenant access via shared link tokens | ✅ Confirmed |
| **D-06** | Tenant portal via shared link tokens (no tenant accounts) | Tenants don't need PocketBase accounts; landlord shares unique token link | ✅ Confirmed |
| **D-07** | RentAdjustment and ContactLog as JSON fields | Append-only logs on parent records; unnecessary collections for ≤5 units | ✅ Confirmed |
| **D-08** | File uploads via PocketBase file fields | Replaces String[] and receiptUrl strings; built-in storage | ✅ Confirmed |
| **D-09** | PocketBase SDK for all frontend data operations | No Next.js API proxy routes needed; SDK handles auth, HTTP, errors | ✅ Confirmed |
| **D-10** | FastAPI communicates with PocketBase via Admin API | NOT direct DB access; NOT Prisma; NOT SQLAlchemy | ✅ Confirmed |

---

## 8. What Must Be Done Next

### Immediate (Phase 1 → Phase 2 transition)

1. **Rewrite `src/lib/AuthProvider.tsx`** — Replace FastAPI token auth with PocketBase SDK auth (`pb.authWithPassword`, `pb.authStore`)
2. **Create `src/types/pocketbase.ts`** — TypeScript interfaces for all PocketBase collections
3. **Verify PocketBase running locally** — `localhost:8090` with all collections created
4. **Verify build succeeds** — `npm run build` with zero errors

### Phase 3 (Core Data Layer)

5. **Swap all Prisma calls → PocketBase SDK calls** — Every page component that was using Prisma now uses `pb.collection('X').getFullList()`, `.create()`, `.update()`, `.delete()`
6. **Build FastAPI endpoints** — Dashboard aggregation, rent generation, overdue marking, lease expiry, expense reporting
7. **Wire UI to PocketBase** — Connect existing pages to the PocketBase SDK data layer

### Phase 4–5

8. **Build tenant portal** — Shared link validation, tenant dashboard
9. **Deploy** — PocketBase + FastAPI on fly.io/Railway, Next.js on Vercel

---

## 9. Deployment Stack

| Service | Platform | Cost | Notes |
|---------|----------|------|-------|
| Next.js | Vercel | Free tier | Zero-config; env vars point to PocketBase URL |
| PocketBase | fly.io or Railway | ~$5/mo | Single binary, SQLite-backed |
| FastAPI | Same host as PocketBase | Included | fly.io services or Railway |
| File Storage | PocketBase local disk | Included | Lease docs + expense receipts |

---

## 10. Environment Variables

```env
# Development
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
POCKETBASE_URL=http://localhost:8090
FASTAPI_URL=http://localhost:8000

# Production
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase.fly.dev
POCKETBASE_URL=https://your-pocketbase.fly.dev
FASTAPI_URL=https://your-fastapi.fly.dev
```

**Removed:** `NEXTAUTH_SECRET` (replaced by PocketBase auth), `DATABASE_URL` (replaced by PocketBase URL)

---

*Last updated: 2026-04-21 — Architecture decision resolving three competing auth approaches and establishing PocketBase + FastAPI hybrid as the single source of truth.*
