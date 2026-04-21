---
phase: 03-core-data
plan: 03
subsystem: api
tags: [pocketbase, nextjs, fastapi, typescript, sdk]

# Dependency graph
requires:
  - phase: 02-ui-shell
    provides: "React component library, page structure, form components"
provides:
  - "PocketBase SDK client replacing FastAPI API client"
  - "All CRUD operations via PocketBase SDK"
  - "FastAPI reporting/automation backend using PocketBase Admin API"
affects:
  - "04-automation"
  - "05-deployment"

# Tech tracking
tech-stack:
  added: ["pocketbase (npm)", "httpx (backend)"]
  patterns: ["PocketBase SDK client abstraction", "Field name mapping layer", "FastAPI aggregation endpoint"]

key-files:
  created:
    - "src/lib/api.ts"
    - "backend/app/config.py"
    - "backend/app/main.py"
    - "backend/app/routers/dashboard.py"
    - "backend/app/routers/rent.py"
    - "backend/app/routers/expenses.py"
    - "backend/app/routers/leases.py"
    - "backend/app/routers/health.py"
  modified:
    - "src/lib/AuthProvider.tsx"
    - "src/components/auth/AuthGuard.tsx"
    - "src/types/pocketbase.ts"
    - "src/app/(dashboard)/page.tsx"
    - "src/app/(dashboard)/units/page.tsx"
    - "src/app/(dashboard)/units/new/page.tsx"
    - "src/app/(dashboard)/units/[id]/edit/page.tsx"
    - "src/app/(dashboard)/tenants/page.tsx"
    - "src/app/(dashboard)/leases/page.tsx"
    - "src/app/(dashboard)/rent/page.tsx"
    - "src/app/(dashboard)/expenses/page.tsx"
    - "src/app/(dashboard)/maintenance/page.tsx"
    - "backend/requirements.txt"

key-decisions:
  - "All frontend data operations flow through PocketBase SDK (pb.collection().getFullList/create/update/delete)"
  - "Field name mapping layer in api.ts translates PocketBase camelCase to old Prisma/SQLAlchemy names expected by components"
  - "FastAPI backend only handles aggregation and automation via PocketBase Admin API (no CRUD)"
  - "Status values stored lowercase in PocketBase, mapped to uppercase in api.ts getStatusMap()"

patterns-established:
  - "PocketBase SDK client: pb.collection('X').getFullList<T>() with type annotations"
  - "Field mapping: PocketBase snake_case → old camelCase via api.ts layer"
  - "Status mapping: PocketBase lowercase → component uppercase via getStatusMap()"
  - "RecordModel casting: (pb.collection().create() as unknown as TypedRecord)"

requirements-completed: []

# Metrics
duration: 45min
completed: 2026-04-21
---

# Phase 03 Plan 03: Core Data Layer Swap Summary

**Migrate all CRUD operations from Prisma/FastAPI to PocketBase SDK, rewrite AuthProvider, wire all 6 domain pages, build FastAPI reporting/automation backend**

## Performance

- **Duration:** 45 min
- **Started:** 2026-04-21T13:35:00Z
- **Completed:** 2026-04-21T14:20:00Z
- **Tasks:** 17 (12 committed in prior waves, 5 completed in this wave)
- **Files modified:** 20+

## Accomplishments
- All 6 domain pages (units, tenants, leases, rent, expenses, maintenance) use PocketBase SDK
- AuthProvider rewritten for PocketBase SDK auth with authStore
- FastAPI backend with health check, dashboard aggregation, rent automation, expense reporting, and lease expiry detection
- TypeScript type check passes with zero errors
- Build succeeds with all pages compiled

## Task Commits

### Prior Wave Commits (03-01 through 03-03)

1. **Task 0: Rewrite AuthProvider** - `066cc45` (feat)
2. **Task 1: Replace FastAPI API client with PocketBase SDK** - `bd5f2a8` (feat)
3. **Task 2: Wire units pages to PocketBase SDK** - `5d9c0a2` (feat)
4. **Task 3: Wire tenants page to PocketBase SDK** - `e3e5514` (feat)
5. **Task 4: Wire leases page to PocketBase SDK** - `2f9a91a` (feat)
6. **Task 5: Wire rent page to PocketBase SDK** - `0e3d9aa` (feat)
7. **Task 6: Wire expenses page to PocketBase SDK** - `91b7288` (feat)
8. **Task 7: Wire maintenance page to PocketBase SDK** - `4d23577` (feat)
9. **Task 8: Wire dashboard page to PocketBase SDK** - `d1710df` (feat)
10. **Task 9: Update PocketBase types** - `ced228e` (feat)
11. **Task 10: Set up FastAPI backend** - `235a40c` (feat)

### Current Wave Commits

12. **Task 16: Fix all TypeScript errors and build** - `f91d905` (fix)
    - Fixed all 66 TypeScript errors across api.ts, page components, and forms
    - Added await to all PocketBase SDK calls
    - Cast RecordModel results to typed interfaces
    - Fixed field name mappings in maintenance, tenants, units pages

**Plan metadata:** `cf3fb09` (docs: create core data layer swap plan)

## Files Created/Modified
- `src/lib/api.ts` — PocketBase SDK client replacing 491-line FastAPI client (922 lines)
- `src/lib/AuthProvider.tsx` — PocketBase SDK auth with pb.authWithPassword + authStore
- `src/components/auth/AuthGuard.tsx` — pb.authStore.isValid check
- `src/types/pocketbase.ts` — All 7 collection types with system fields and JSON arrays
- `backend/app/config.py` — PocketBase settings (URL, admin token)
- `backend/app/main.py` — FastAPI app with reporting/automation routers
- `backend/app/routers/health.py` — Health check verifying PocketBase connectivity
- `backend/app/routers/dashboard.py` — Dashboard aggregation from PocketBase
- `backend/app/routers/rent.py` — Rent generation and overdue marking
- `backend/app/routers/expenses.py` — Expense reporting with category breakdown
- `backend/app/routers/leases.py` — Lease expiry detection with urgency levels
- `backend/requirements.txt` — Updated (removed SQLAlchemy, psycopg2, alembic)

## Decisions Made
- All CRUD operations flow through PocketBase SDK client abstraction in api.ts
- Field name mapping handled in api.ts layer (not in components) so components remain unchanged
- PocketBase SDK `RecordModel` requires explicit casting to typed interfaces
- MaintenanceRecord needs `cost` field added (was missing from types)
- TenantFormData now includes `unitId` optional field for tenant assignment

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] PocketBase SDK returns Promise that needs await**
- **Found during:** Task 16 (TypeScript type check)
- **Issue:** `getUnitsRaw()`, `getExpensesRaw()`, `getMaintenanceRaw()` return `Promise<T[]>` but were used without await in `getUnit`, `getExpense`, `getMaintenanceRequest`, and `getDashboard`
- **Fix:** Added `await` to all async SDK calls
- **Files modified:** `src/lib/api.ts`
- **Verification:** TypeScript passes, build succeeds

**2. [Rule 1 - Bug] PocketBase SDK create/update returns RecordModel, not typed interface**
- **Found during:** Task 16 (TypeScript type check)
- **Issue:** `pb.collection().create()` returns `RecordModel` which doesn't satisfy typed `UnitRecord`, `TenantRecord`, etc.
- **Fix:** Added `(result as unknown as TypedRecord)` casts on all create/update operations
- **Files modified:** `src/lib/api.ts`
- **Verification:** TypeScript passes, no type errors

**3. [Rule 2 - Missing Critical] MaintenanceRecord missing cost field**
- **Found during:** Task 16 (TypeScript type check)
- **Issue:** `MaintenanceRecord` interface had no `cost` field, but `MaintenanceRequest.cost` expects number
- **Fix:** Added `cost?: number` to `MaintenanceRecord` interface in pocketbase.ts
- **Files modified:** `src/types/pocketbase.ts`
- **Verification:** TypeScript passes

**4. [Rule 1 - Bug] UnitRecord missing type field**
- **Found during:** Task 16 (TypeScript type check)
- **Issue:** `UnitRecord` had no `type` property but api.ts accesses `u.type`
- **Fix:** Added `type?: string` to `UnitRecord` interface
- **Files modified:** `src/types/pocketbase.ts`
- **Verification:** TypeScript passes

**5. [Rule 1 - Bug] Page component field name mismatches**
- **Found during:** Task 16 (TypeScript type check)
- **Issue:** maintenance edit page had priority string vs enum mismatch, cost type mismatch; tenants new page referenced missing unitId; units edit/detail pages had interface mismatches
- **Fix:** Fixed priority mapping (lowercase→uppercase), added cost type conversion, added unitId to TenantFormData, fixed UnitData interface
- **Files modified:** `src/app/(dashboard)/maintenance/[id]/edit/page.tsx`, `src/components/tenants/tenant-form.tsx`, `src/app/(dashboard)/units/[id]/edit/page.tsx`, `src/app/(dashboard)/units/[id]/page.tsx`
- **Verification:** TypeScript passes, zero errors

---

**Total deviations:** 5 auto-fixed (5 bugs)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
- PocketBase SDK type annotations require explicit generics: `pb.collection('units').getFullList<UnitRecord>()`
- PocketBase SDK create/update returns `RecordModel` not the typed interface — requires casting
- Component interfaces expect old field names (snake_case, uppercase status) — mapping layer in api.ts handles this
- Maintenance form schema didn't include cost as optional field — added to schema

## User Setup Required

None - no external service configuration required. All PocketBase collections are pre-created on localhost:8090.

## Next Phase Readiness
- Phase 3 core data layer swap complete
- All CRUD operations flow through PocketBase SDK
- FastAPI backend with reporting/automation endpoints ready
- Zero TypeScript errors, build succeeds
- Ready for Phase 4 (automation) and Phase 5 (deployment)

---

*Phase: 03-core-data*
*Completed: 2026-04-21*
