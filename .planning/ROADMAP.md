# Property-Pi — Development Roadmap

Generated: 2026-04-21
Milestone: v1 — Migration to Hybrid PocketBase + FastAPI
Goal: Landlord can see unit status and rent arrears in < 5 seconds

---

## Phase 1: Cleanup & Foundation

**Goal:** Remove legacy stack, establish PocketBase development environment.

**Dependencies:** None (first phase)

**Duration:** Est. 2-3 days

### Tasks

- [x] **1.1** Delete `src/app/api/` directory
- [x] **1.2** Delete `src/middleware.ts` (NextAuth middleware)
- [x] **1.3** Delete `src/lib/auth.ts` (NextAuth server config)
- [x] **1.4** Delete `src/components/auth/session-provider.tsx`
- [x] **1.5** Delete `src/app/(auth)/` directory (NextAuth pages)
- [x] **1.6** Remove `next-auth`, `bcryptjs`, `@types/bcryptjs`, `@prisma/client` from `package.json`
- [x] **1.7** Run `npm install` and verify clean install
- [x] **1.8** Run `npx tsc --noEmit` and fix type errors
- [x] **1.9** Install `pocketbase` npm package
- [x] **1.10** Download PocketBase binary, run locally on `localhost:8090`
- [x] **1.11** Create PocketBase landlord admin account (email/password) in `users` collection
- [x] **1.12** Create PocketBase collections manually (via Admin UI)
  - `users` (auth collection)
  - `units`, `tenants`, `leases`, `payments`, `expenses`, `maintenance`, `notices` (base collections)
- [x] **1.13** Configure API rules for all collections (require auth)
- [x] **1.14** Add `POCKETBASE_URL` and `FASTAPI_URL` to `.env`, remove `NEXTAUTH_SECRET`
- [x] **1.15** Create `src/lib/pocketbase.ts` SDK singleton
- [x] **1.16** Create `src/types/pocketbase.ts` TypeScript interfaces

**Success Criteria:**
- [x] Project builds with `npm run build` (zero errors)
- [x] No references to Prisma, NextAuth, or bcrypt in codebase
- [ ] PocketBase running locally with all collections
- [ ] TypeScript types defined for all PocketBase collections

**Maps to REQ:** REQ-01, REQ-02 (partial)

---

## Phase 2: Authentication

**Goal:** Landlord can log in via PocketBase auth.

**Dependencies:** Phase 1 complete

**Duration:** Est. 1-2 days

### Tasks

- [ ] **2.1** Create AuthContext provider (`src/lib/AuthContext.tsx`)
- [ ] **2.2** Wrap app layout with AuthContext provider
- [ ] **2.3** Create login page (`src/app/(auth)/login/page.tsx`) using PocketBase SDK
- [ ] **2.4** Implement `authWithPassword` flow with PocketBase
- [ ] **2.5** Store token in localStorage via `pb.authStore`
- [ ] **2.6** Protect dashboard layout — redirect to login if not authenticated
- [ ] **2.7** Display logged-in user info in header
- [ ] **2.8** Implement logout (clear token, redirect to login)

**Success Criteria:**
- [ ] Landlord can log in with email/password
- [ ] Dashboard accessible only to authenticated users
- [ ] Logout works correctly
- [ ] Auth token persists across page refreshes (localStorage)

**Maps to REQ:** REQ-03

---

## Phase 3: Core Data Layer Swap

**Goal:** All existing UI pages display and manipulate data via PocketBase.

**Dependencies:** Phase 2 complete

**Duration:** Est. 5-7 days

### Plans

- [ ] **03-01** Rewrite AuthProvider to use PocketBase SDK, replace FastAPI API client with PocketBase SDK client
- [ ] **03-02** Wire units, tenants, leases pages to PocketBase SDK
- [ ] **03-03** Wire rent, expenses, maintenance pages to PocketBase SDK
- [ ] **03-04** Wire dashboard page, update types/config, build & verify
- [ ] **03-05** Set up FastAPI backend, implement reporting/automation endpoints, full verification

**Success Criteria:**
- [ ] Dashboard shows accurate unit counts, revenue, occupancy, expenses from PocketBase
- [ ] All CRUD operations work for units, tenants, leases, payments, expenses, maintenance via PocketBase SDK
- [ ] File uploads work (receipts, lease documents) via PocketBase file fields
- [ ] Monthly rent generation creates payments for all occupied units
- [ ] Overdue payments auto-marked correctly
- [ ] Lease expiry alerts show correct urgency levels
- [ ] FastAPI health check endpoint responds correctly
- [ ] Zero TypeScript errors, zero build errors

**Maps to REQ:** REQ-04, REQ-05, REQ-06, REQ-09, REQ-10, REQ-11, REQ-12

---

## Phase 4: Tenant Portal

**Goal:** Tenants access full dashboard via shared link.

**Dependencies:** Phase 3 complete (leases, tenants, payments, maintenance, notices all working)

**Duration:** Est. 3-4 days

### Tasks

- [ ] **4.1** Add `tenantAccess` field to leases collection (text, stores token)
- [ ] **4.2** Create tenant portal page (`src/app/tenant/portal/page.tsx`)
- [ ] **4.3** Implement token validation against lease records
- [ ] **4.4** Build tenant dashboard layout (sidebar with lease, payments, maintenance, notices)
- [ ] **4.5** Display lease details (dates, rent, status)
- [ ] **4.6** Display payment history for tenant's unit
- [ ] **4.7** Display maintenance request status
- [ ] **4.8** Display notices sent to tenant's unit
- [ ] **4.9** Allow tenant to submit new maintenance requests
- [ ] **4.10** Add "Share Tenant Link" button to lease edit page
- [ ] **4.11** Implement token generation (cryptographically random, stored in lease)
- [ ] **4.12** Implement token regeneration (invalidates old link)

**Success Criteria:**
- [ ] Tenant can access portal via shared link (no login required)
- [ ] Tenant sees correct data for their unit only and cannot access landlord pages or other tenants' data
- [ ] Tenant can submit maintenance requests
- [ ] Landlord can generate/regenerate tenant links (old tokens invalidated)

**Maps to REQ:** REQ-07, REQ-08

---

## Phase 5: Polish & Deploy

**Goal:** Production deployment, performance verification, security hardening.

**Dependencies:** Phase 4 complete

**Duration:** Est. 2-3 days

### Tasks

- [ ] **5.1** Deploy PocketBase to fly.io or Railway (~$5/mo)
- [ ] **5.2** Create landlord admin account in production PocketBase instance
- [ ] **5.3** Deploy FastAPI to same infrastructure
- [ ] **5.4** Deploy Next.js to Vercel
- [ ] **5.5** Configure environment variables (`POCKETBASE_URL`, `FASTAPI_URL`)
- [ ] **5.6** Verify all CRUD operations in production
- [ ] **5.7** Verify tenant portal links work from production
- [ ] **5.8** Verify file storage accessible from production
- [ ] **5.9** Run performance test — dashboard loads < 5s on 4G
- [ ] **5.10** Security audit — confirm all collections require auth
- [ ] **5.11** Add `.env` to `.gitignore` (no secrets in repo)
- [ ] **5.12** Seed production database with demo data (optional)
- [ ] **5.13** Configure cron for rent automation on FastAPI server
- [ ] **5.14** Configure PocketBase JSVM hooks for automation (optional — defer to cron)

**Success Criteria:**
- [ ] Dashboard loads < 5s on 4G connection
- [ ] All CRUD operations work in production (create unit → see it on dashboard)
- [ ] No hardcoded secrets in codebase
- [ ] Tenant portal accessible from production URL
- [ ] File uploads/reads work in production
- [ ] Zero TypeScript errors, zero lint warnings
- [ ] Landlord can log in and see accurate dashboard data

**Maps to REQ:** REQ-13, REQ-14, REQ-15

---

## Execution Order (Critical Path)

```
Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4 ──▶ Phase 5
              │          │         │         │
          (Foundation) (Auth)   (Core)   (Tenant) (Deploy)
```

1. **Phase 1: Cleanup & Foundation** — Remove legacy, set up PocketBase
2. **Phase 2: Authentication** — Landlord login via PocketBase
3. **Phase 3: Core Data Layer** — Swap all CRUD, build FastAPI, automation
4. **Phase 4: Tenant Portal** — Shared link tenant dashboard
5. **Phase 5: Polish & Deploy** — Production deployment, verification

---

## Dependency Graph

```
Phase 1: No dependencies
Phase 2: Phase 1 (PocketBase running)
Phase 3: Phase 2 (Auth working) + Phase 1 (Schema ready)
Phase 4: Phase 3 (All CRUD + leases/tenants/payments/maintenance/notices working)
Phase 5: Phase 4 (All features complete)
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard load time | < 5s | Lighthouse / WebPageTest |
| CRUD operation success rate | 100% | Manual testing + error logs |
| TypeScript errors | 0 | `npx tsc --noEmit` |
| Lint warnings | 0 | `npm run lint` |
| Production uptime | > 99% | fly.io/Railway/Vercel dashboards |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| PocketBase JSVM hooks complex for automation | Medium | Use FastAPI + cron instead (simpler, already planned) |
| File storage migration from URLs to file fields | Medium | Existing UI stores URLs; new UI stores files — document the difference |
| PocketBase performance at scale | Low | ≤5 unit portfolio; SQLite handles this easily |
| Shared link token security | Medium | Use cryptographically random tokens (crypto.randomBytes), store in DB |
| PocketBase deployment cost | Low | fly.io free tier covers single PocketBase instance |

---

## Requirements Mapping Summary

| Phase | REQ IDs | Count |
|-------|---------|-------|
| Phase 1 | REQ-01, REQ-02 | 2 |
| Phase 2 | REQ-03 | 1 |
| Phase 3 | REQ-04, REQ-05, REQ-06, REQ-09, REQ-10, REQ-11, REQ-12 | 7 |
| Phase 4 | REQ-07, REQ-08 | 2 |
| Phase 5 | REQ-13, REQ-14, REQ-15 | 3 |
| **Total** | **REQ-01 through REQ-15** | **15** |

---

## Evolution

After each phase completes:
1. Update ROADMAP.md — mark tasks as complete
2. Update REQUIREMENTS.md — move completed REQ IDs to "Completed" section
3. Update PROJECT.md — move validated requirements from Active to Validated

---
*Generated: 2026-04-21 from REQUIREMENTS.md and PROJECT.md specifications*
