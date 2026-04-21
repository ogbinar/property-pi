---
phase: 04-tenant-portal
plan: 01
subsystem: ui
tags: [pocketbase, nextjs, tenant-portal, shared-link, token-validation]

# Dependency graph
requires:
  - phase: 03-core-data
    provides: "PocketBase SDK client, typed record interfaces, pocketbase singleton"
provides:
  - "Tenant portal route at /tenant/portal with shared-link token validation"
  - "Tenant layout with sidebar navigation and header"
  - "Read-only lease, payment, maintenance, notices views for tenants"
  - "Maintenance request submission form for tenants"
  - "Tenant API layer (tenant-api.ts) with PocketBase SDK calls scoped to tenant portal"
affects:
  - "04-02"

# Tech tracking
tech-stack:
  added: ["tenant-api.ts", "tenant layout & components"]
  patterns: ["Shared-link token validation ({leaseId}:{secret}), PocketBase SDK direct calls from tenant components, URL param-based routing with tab filtering"]

key-files:
  created:
    - "src/lib/tenant-api.ts"
    - "src/app/tenant/layout.tsx"
    - "src/app/tenant/portal/page.tsx"
    - "src/components/tenant/tenant-sidebar.tsx"
    - "src/components/tenant/tenant-header.tsx"
    - "src/components/tenant/lease-details-card.tsx"
    - "src/components/tenant/payment-history-card.tsx"
    - "src/components/tenant/maintenance-status-card.tsx"
    - "src/components/tenant/notices-card.tsx"
    - "src/components/tenant/maintenance-request-form.tsx"
    - "src/components/ui/textarea.tsx"
  modified:
    - "src/components/ui/table.tsx"

key-decisions:
  - "Tenant portal uses URL token ({leaseId}:{secret}) instead of PocketBase auth — no login required"
  - "Table component constraint relaxed from Record<string,unknown> to {id: string} to accept PocketBase typed records"
  - "Portal uses tab filtering via URL ?tab= query param for navigation between sections"

patterns-established:
  - "Tenant API layer: All PocketBase SDK calls scoped to tenant portal in tenant-api.ts"
  - "Token validation: getOne(leaseId, {expand: 'tenant,unit'}) then compare tenantAccess field"
  - "Parallel data fetching: Promise.all([getPaymentHistory, getMaintenanceRequests, getNotices])"
  - "URL param routing: ?tab=payments|maintenance|notices for section navigation"

requirements-completed: []

# Metrics
duration: 15min
completed: 2026-04-21
---

# Phase 04 Plan 01: Tenant Portal Summary

**Shared-link tenant portal with token validation, read-only lease/payment/maintenance/notices views, and maintenance request submission form**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-21T07:31:15Z
- **Completed:** 2026-04-21T07:45:00Z
- **Tasks:** 3
- **Files modified:** 13 (10 created, 2 modified, 1 added)

## Accomplishments
- Full tenant portal route at `/tenant/portal` with shared-link token validation (`{leaseId}:{secret}`)
- Tenant layout with responsive sidebar, header with unit info, and sign-out (URL param clearing)
- 4 read-only data cards (lease details, payment history, maintenance status, notices) with status/priority badges
- Maintenance request submission form with title, description, priority fields and form validation
- Tenant API layer with 5 PocketBase SDK functions scoped to tenant portal

## Task Commits

Each task was committed atomically:

1. **Task 1: Create tenant API layer** - `787cf8a` (feat)
2. **Task 2: Create tenant layout and navigation** - `33301e5` (feat)
3. **Task 3: Create tenant portal page and display components** - `3561b13` (feat)

**Plan metadata:** pending (to be committed with SUMMARY.md)

## Files Created/Modified

- `src/lib/tenant-api.ts` — PocketBase SDK calls for tenant portal (validateTenantToken, getPaymentHistory, getMaintenanceRequests, getNotices, createTenantMaintenanceRequest)
- `src/app/tenant/layout.tsx` — Tenant portal chrome layout (sidebar + main content, no AuthGuard)
- `src/app/tenant/portal/page.tsx` — Main tenant portal page with token parsing, validation, parallel data fetching, and tab-based section navigation
- `src/components/tenant/tenant-sidebar.tsx` — Responsive navigation sidebar with Dashboard/Payments/Maintenance/Notices links
- `src/components/tenant/tenant-header.tsx` — Portal header showing Property-Pi branding, unit info, tenant name, and sign-out
- `src/components/tenant/lease-details-card.tsx` — Lease info display with status badge, rent, dates, tenant name, unit number
- `src/components/tenant/payment-history-card.tsx` — Payment history table with date, amount, due date, status, method
- `src/components/tenant/maintenance-status-card.tsx` — Maintenance requests table with title, priority, status, date
- `src/components/tenant/notices-card.tsx` — Notices table with title, type, status, date
- `src/components/tenant/maintenance-request-form.tsx` — Form with title, description, priority select and submit
- `src/components/ui/textarea.tsx` — Textarea UI component matching Input/Select patterns
- `src/components/ui/table.tsx` — Relaxed type constraint from `Record<string,unknown>` to `{id: string}`

## Decisions Made

- Tenant portal uses URL token format `{leaseId}:{secret}` (split on `:`, supports colons in secret) — no separate auth flow
- Table component constraint changed to accept any type with `id` field — PocketBase typed records don't have index signatures
- Portal uses `?tab=` query param for section navigation — allows deep linking to specific sections

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] PocketBase SDK uses `getOne()`, not `getFirstMatchQuery()`**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** `getFirstMatchQuery` method does not exist on PocketBase SDK v2 — it uses `getOne(id, options)` for single records and `getFullList<T>(options)` for lists
- **Fix:** Changed `getFirstMatchQuery({ id: leaseId }, { expand })` to `getOne<LeaseRecord>(leaseId, { expand })`
- **Files modified:** `src/lib/tenant-api.ts`
- **Verification:** TypeScript compiles with zero errors

**2. [Rule 1 - Bug] PocketBase SDK `getFullList` returns typed results directly**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** `getFullList<T>()` with proper generic type annotation returns `T[]` directly — no casting needed
- **Fix:** Removed `as PaymentRecord[]` casts, used `getFullList<PaymentRecord>()` pattern
- **Files modified:** `src/lib/tenant-api.ts`
- **Verification:** TypeScript compiles with zero errors

**3. [Rule 2 - Missing Critical] Table component type constraint too strict**
- **Found during:** Task 3 (TypeScript compilation)
- **Issue:** `Table<T extends Record<string, unknown>>` rejected PocketBase typed records (PaymentRecord, MaintenanceRecord, NoticeRecord) because they lack index signatures
- **Fix:** Relaxed constraint to `Table<T extends { id: string }>` and cast column values via `Record<string, unknown>`
- **Files modified:** `src/components/ui/table.tsx`
- **Verification:** TypeScript passes, all tenant cards compile

**4. [Rule 1 - Bug] Missing `'use client'` directive on tenant sidebar**
- **Found during:** Build (Next.js)
- **Issue:** `TenantSidebar` uses `useState` and `usePathname` from React/next/navigation but lacked `'use client'` directive
- **Fix:** Added `'use client'` at top of `tenant-sidebar.tsx`
- **Files modified:** `src/components/tenant/tenant-sidebar.tsx`
- **Verification:** Build succeeds with zero errors

---

**Total deviations:** 4 auto-fixed (3 bugs, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
- PocketBase SDK v2 API differs significantly from v3 — uses `getOne(id)` and `getFullList<T>(options)` instead of `getFirstMatchQuery()` and `getFullList()`
- Table component's generic constraint needed relaxation for PocketBase typed records

## User Setup Required

None - no external service configuration required. PocketBase collections are pre-created on localhost:8090.

## Next Phase Readiness
- Phase 4 Plan 01 complete — tenant portal is fully functional
- Phase 4 Plan 02 (share tenant link generation on lease detail page) can now proceed
- Tenant link format verified: `/tenant/portal?token={leaseId}:{token}`
- Build succeeds with zero TypeScript errors

---
*Phase: 04-tenant-portal*
*Completed: 2026-04-21*
