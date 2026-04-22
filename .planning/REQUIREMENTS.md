# Property-Pi — Requirements

Generated: 2026-04-21
Source: `.planning/PROJECT.md` § Requirements, user decisions from questioning

---

## 1. Architecture & Migration

### REQ-01: Strip Legacy Backend Stack
Landlord can see the status of all units and know exactly which tenants owe rent for the current month in under 5 seconds.

**Description:** Remove all monolithic backend dependencies from the Next.js codebase: NextAuth, Prisma client, bcryptjs, next-auth types, middleware.ts, and the entire `src/app/api/` directory. The frontend becomes a zero-server-side-logic application.

**Acceptance:**
- [ ] `src/app/api/` removed
- [ ] `src/middleware.ts` removed
- [ ] `src/lib/auth.ts` (NextAuth server config) removed
- [ ] `next-auth`, `bcryptjs`, `@types/bcryptjs` removed from `package.json`
- [ ] `@prisma/client` removed from `package.json`
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds

### REQ-02: PocketBase Setup & Schema
Database schema recreated in PocketBase matching existing Prisma structure.

**Description:** PocketBase instance configured with SQLite for local development. Collections created to mirror all Prisma models: `users` (auth), `units`, `tenants`, `leases`, `payments`, `expenses`, `maintenance`, `notices`. `RentAdjustment` and `ContactLog` stored as JSON arrays on parent records (`units.rentHistory`, `tenants.contactLog`). File fields replace `String[] documents` and `receiptUrl` strings.

**Acceptance:**
- [ ] PocketBase running locally (`localhost:8090`)
- [ ] 7 collections created with correct field types
- [ ] Enum values mapped to PocketBase `select` fields
- [ ] `RentAdjustment` → JSON on `units`
- [ ] `ContactLog` → JSON on `tenants`
- [ ] Document fields → PocketBase file fields
- [ ] API rules configured (all landlord collections require `@request.auth.id != ''`)

### REQ-03: PocketBase Auth Integration
Landlord authenticates via email/password with PocketBase managing sessions.

**Description:** Next.js integrates PocketBase JS SDK for auth. `pb.authStore.token` stored in localStorage. Auth context provider replaces NextAuth `useSession()`. Dashboard routes protected by checking `pb.authStore.isValid`. Single PocketBase user account created for the landlord (no self-registration — set up manually during deployment).

**Acceptance:**
- [ ] `src/lib/pocketbase.ts` singleton created
- [ ] Auth context provider (`src/lib/AuthProvider.tsx`) wraps app layout
- [ ] Landlord login page authenticates against PocketBase
- [ ] Dashboard protected — unauthenticated users redirected to login
- [ ] Logout clears token and redirects to login
- [ ] Auth token sent automatically with all PocketBase SDK requests

### REQ-04: Unified API Proxy Layer
All frontend API calls route through Next.js API routes that proxy to PocketBase + FastAPI.

**Description:** Next.js API routes act as a unified proxy to both PocketBase and FastAPI. This provides a single interface for the frontend, avoids CORS issues between Vercel and hosted backends, and centralizes auth token forwarding. Proxy routes forward requests to PocketBase Admin API and FastAPI endpoints transparently.

**Acceptance:**
- [ ] `src/app/api/pb/` routes proxy to PocketBase
- [ ] `src/app/api/fastapi/` routes proxy to FastAPI
- [ ] Auth token forwarded from Next.js to PocketBase
- [ ] Proxy layer transparent — frontend code doesn't need backend URLs
- [ ] All existing page components work through proxy

### REQ-05: FastAPI Backend
FastAPI handles reporting aggregation, file processing, and automated tasks.

**Description:** FastAPI backend provides endpoints that PocketBase doesn't handle natively: dashboard aggregation queries, rent automation (monthly generation, overdue marking, lease expiry detection), expense reporting, and file processing. FastAPI communicates with PocketBase via PocketBase Admin API (not direct DB access).

**Acceptance:**
- [ ] FastAPI running (`localhost:8000`)
- [ ] `/api/fastapi/dashboard` — aggregated dashboard data
- [ ] `/api/fastapi/rent/generate` — bulk create monthly payments
- [ ] `/api/fastapi/rent/mark-overdue` — auto-mark overdue payments
- [ ] `/api/fastapi/rent/check-expirations` — detect leases expiring within 60 days
- [ ] `/api/fastapi/expenses/report` — expense report with category breakdown
- [ ] Health check endpoint at `/health`
- [ ] CORS configured for Next.js

### REQ-06: Connect UI to Data Layer
Existing UI pages display data from PocketBase via the unified proxy.

**Description:** All existing dashboard pages (units, tenants, leases, rent, expenses, maintenance) replace Prisma API calls with PocketBase SDK calls through the unified proxy layer. Data shapes must match existing component expectations.

**Acceptance:**
- [ ] Dashboard page loads unit counts, revenue, expenses, occupancy
- [ ] Units page — CRUD operations work (create, read, update, delete)
- [ ] Tenants page — CRUD operations work
- [ ] Leases page — CRUD operations work
- [ ] Rent page — payment listing, mark-paid, generate monthly
- [ ] Expenses page — CRUD operations work
- [ ] Maintenance page — CRUD operations work
- [ ] All forms validate and submit correctly
- [ ] File uploads (receipts, lease documents) work via PocketBase

---

## 2. Tenant Portal

### REQ-07: Full Tenant Portal
Tenants access a dedicated dashboard with lease details, payment history, maintenance status, and notices — accessible via shared link.

**Description:** New tenant portal pages under `src/app/tenant/`. Tenants see: lease details (dates, rent, status), payment history for their unit, maintenance request status, and notices sent to their unit. Accessed via `/tenant/portal?token=xxx` where the token is a unique identifier derived from the lease/unit combination. No PocketBase tenant accounts — landlord shares the link.

**Acceptance:**
- [ ] `/tenant/portal?token=xxx` page created
- [ ] Token validated against lease records (tenant's lease + unit match)
- [ ] Tenant dashboard shows: lease info, payment history, maintenance status, notices
- [ ] Tenant can submit new maintenance requests (via PocketBase)
- [ ] Tenant cannot access landlord pages
- [ ] Token-based access works without PocketBase authentication

### REQ-08: Tenant Access Tokens
Landlord generates unique shared links for each tenant.

**Description:** When creating/updating a lease, landlord can generate a unique access token for the tenant. The link format is `/tenant/portal?token={leaseId}:{sharedSecret}` where the shared secret is a deterministic hash. Landlord can share this link via email/text.

**Acceptance:**
- [ ] Lease edit page has "Share Tenant Link" button
- [ ] Link format: `/tenant/portal?token={leaseId}:{token}`
- [ ] Token stored in PocketBase lease record (`tenantAccess` field)
- [ ] Token can be regenerated (invalidating old link)
- [ ] Tenant portal validates token matches lease record

---

## 3. Automation

### REQ-09: Monthly Rent Generation
Payments automatically created for all occupied units at the start of each month.

**Description:** FastAPI endpoint (`POST /api/fastapi/rent/generate`) creates PENDING payment records for all units with active leases. Can be triggered manually or via scheduled cron job. Only generates payments for units not already having a payment for the target month.

**Acceptance:**
- [ ] Endpoint creates one payment per occupied unit
- [ ] Payment amount matches current lease rent amount
- [ ] Payment date = first day of target month
- [ ] Due date = 5th of target month
- [ ] Skips units already having payment for that month
- [ ] Returns list of created payments

### REQ-10: Auto-Mark Overdue
Payments automatically marked OVERDUE when past due date without being paid.

**Description:** FastAPI endpoint (`POST /api/fastapi/rent/mark-overdue`) scans all PENDING payments where `dueDate < now()` and marks them as OVERDUE. Runs via cron or manually triggered from dashboard.

**Acceptance:**
- [ ] Endpoint marks all past-due PENDING payments as OVERDUE
- [ ] Dashboard shows overdue count in revenue summary
- [ ] Overdue payments highlighted in rent page

### REQ-11: Lease Expiry Alerts
Dashboard shows leases expiring within 60 days with urgency levels.

**Description:** FastAPI endpoint (`GET /api/fastapi/leases/expiring`) returns leases ending within 60 days, sorted by urgency: critical (≤15 days), warning (≤30 days), upcoming (≤60 days). Dashboard displays these in the expirations widget.

**Acceptance:**
- [ ] Endpoint returns leases expiring within 60 days
- [ ] Urgency levels: critical (≤15 days), warning (≤30 days), upcoming (≤60 days)
- [ ] Dashboard expirations widget displays urgency-colored alerts
- [ ] Includes tenant name and unit number

---

## 4. File Storage

### REQ-12: Document Upload & Storage
Lease documents and expense receipts stored via PocketBase file storage.

**Description:** Lease document uploads and expense receipt uploads use PocketBase file fields (not URL strings). Files stored in PocketBase's `uploads/` directory. Existing Prisma `documents: String[]` and `receiptUrl: String?` replaced with PocketBase file fields.

**Acceptance:**
- [ ] Lease form accepts file uploads (PDF, images)
- [ ] Expense form accepts receipt file upload
- [ ] Files stored in PocketBase file storage
- [ ] Files accessible via PocketBase CDN URL
- [ ] File upload uses FormData (not JSON)
- [ ] File URLs displayed in tenant portal and landlord UI

---

## 5. Deployment

### REQ-13: Production Deployment
PocketBase + FastAPI hosted together, Next.js on Vercel.

**Description:** PocketBase instance hosted on fly.io or Railway (~$5/mo). FastAPI hosted on same infrastructure (fly.io services or Railway). Next.js frontend deployed on Vercel. Environment variables configured: `POCKETBASE_URL`, `FASTAPI_URL`, `NEXTAUTH_SECRET` (removed — replaced by PocketBase).

**Acceptance:**
- [ ] PocketBase deployed and accessible
- [ ] FastAPI deployed and accessible
- [ ] Next.js deployed on Vercel
- [ ] Environment variables configured
- [ ] Tenant portal links work from production
- [ ] File storage accessible from production
- [ ] All CRUD operations work in production

---

## 6. Non-Functional Requirements

### REQ-14: Performance
Dashboard loads in under 5 seconds on production.

**Acceptance:**
- [ ] Dashboard page loads < 5s on 4G connection
- [ ] API proxy adds < 100ms overhead
- [ ] PocketBase queries use indexes where applicable

### REQ-15: Security
All landlord operations require authentication. Tenant portal uses single-use token.

**Acceptance:**
- [ ] All PocketBase collections require auth (`@request.auth.id != ''`)
- [ ] Tenant portal validates token against lease records
- [ ] No hardcoded secrets in codebase
- [ ] `.env` file in `.gitignore`
- [ ] Token not guessable (uses cryptographically random secret)

---

## Requirements Traceability

| REQ-ID | Phase | Status | Notes |
|--------|-------|--------|-------|
| REQ-01 | Phase 1 | Pending | Cleanup legacy stack |
| REQ-02 | Phase 2 | Pending | PocketBase schema |
| REQ-03 | Phase 2 | Pending | Auth integration |
| REQ-04 | Phase 3 | Pending | API proxy layer |
| REQ-05 | Phase 3 | Pending | FastAPI backend |
| REQ-06 | Phase 3 | Pending | UI integration |
| REQ-07 | Phase 4 | Pending | Tenant portal pages |
| REQ-08 | Phase 4 | Pending | Tenant access tokens |
| REQ-09 | Phase 3 | Pending | Monthly rent generation |
| REQ-10 | Phase 3 | Pending | Auto-mark overdue |
| REQ-11 | Phase 3 | Pending | Lease expiry alerts |
| REQ-12 | Phase 3 | Pending | File storage |
| REQ-13 | Phase 5 | Pending | Deployment |
| REQ-14 | Phase 5 | Pending | Performance |
| REQ-15 | Phase 5 | Pending | Security |

---

## Evolution

Requirements are updated at phase boundaries. Completed requirements move to "Validated" section of PROJECT.md with phase reference. New requirements discovered during implementation are added here with REQ-IDs.

---
*Generated: 2026-04-21 from PROJECT.md requirements and user decisions*
