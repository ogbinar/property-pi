---
phase: 3
plan_number: 03
plan: 03
type: execute
wave: 1
depends_on: []
title: Core Data Layer Swap
objective: Migrate all CRUD operations from Prisma/FastAPI to PocketBase SDK. Rewrite AuthProvider, replace API client, wire all 6 domain pages, build FastAPI reporting/automation backend.
autonomous: true
files_modified:
  - src/lib/AuthProvider.tsx
  - src/lib/pocketbase.ts
  - src/lib/api.ts
  - src/types/pocketbase.ts
  - src/components/auth/AuthGuard.tsx
  - src/app/(dashboard)/page.tsx
  - src/app/(dashboard)/layout.tsx
  - src/app/(dashboard)/units/page.tsx
  - src/app/(dashboard)/units/new/page.tsx
  - src/app/(dashboard)/units/[id]/edit/page.tsx
  - src/app/(dashboard)/tenants/page.tsx
  - src/app/(dashboard)/leases/page.tsx
  - src/app/(dashboard)/rent/page.tsx
  - src/app/(dashboard)/expenses/page.tsx
  - src/app/(dashboard)/maintenance/page.tsx
  - backend/app/main.py
  - backend/app/config.py
  - backend/app/routers/dashboard.py
  - backend/app/routers/rent.py
  - backend/app/routers/expenses.py
  - backend/app/routers/leases.py
  - backend/app/routers/health.py
  - backend/requirements.txt
waves:
  - wave: 1
    plans:
      - id: "03-01"
        autonomous: true
        objective: Rewrite AuthProvider to PocketBase SDK, replace FastAPI API client with PocketBase SDK client (api.ts)
      - id: "03-02"
        autonomous: true
        objective: Wire units, tenants, leases pages to PocketBase SDK
      - id: "03-03"
        autonomous: true
        objective: Wire rent, expenses, maintenance pages to PocketBase SDK
      - id: "03-04"
        autonomous: true
        objective: Wire dashboard page, update PocketBase types, build & verify (zero TS errors)
      - id: "03-05"
        autonomous: true
        objective: Set up FastAPI backend with PocketBase Admin API, implement reporting/automation endpoints
files_modified:
  - src/lib/AuthProvider.tsx
  - src/lib/pocketbase.ts
  - src/lib/api.ts
  - src/types/pocketbase.ts
  - src/components/auth/AuthGuard.tsx
  - src/app/(dashboard)/page.tsx
  - src/app/(dashboard)/layout.tsx
  - src/app/(dashboard)/units/page.tsx
  - src/app/(dashboard)/units/new/page.tsx
  - src/app/(dashboard)/units/[id]/edit/page.tsx
  - src/app/(dashboard)/tenants/page.tsx
  - src/app/(dashboard)/leases/page.tsx
  - src/app/(dashboard)/rent/page.tsx
  - src/app/(dashboard)/expenses/page.tsx
  - src/app/(dashboard)/maintenance/page.tsx
  - backend/app/main.py
  - backend/app/config.py
  - backend/app/routers/dashboard.py
  - backend/app/routers/rent.py
  - backend/app/routers/expenses.py
  - backend/app/routers/leases.py
  - backend/app/routers/health.py
  - backend/requirements.txt
tasks:
  - Rewrite AuthProvider to use pb.authWithPassword + pb.authStore
  - Replace entire FastAPI API client (491 lines) with PocketBase SDK client
  - Wire units pages (list, new, edit) to PocketBase SDK
  - Wire tenants page to PocketBase SDK
  - Wire leases page to PocketBase SDK
  - Wire rent page (view, generate, mark-paid) to PocketBase SDK
  - Wire expenses page to PocketBase SDK
  - Wire maintenance page to PocketBase SDK
  - Wire dashboard page to PocketBase SDK aggregation
  - Update PocketBase types to match collection schema (field name mapping)
  - Set up FastAPI backend communicating via PocketBase Admin API
  - Implement FastAPI dashboard aggregation endpoint
  - Implement FastAPI rent generation + overdue marking endpoints
  - Implement FastAPI expense reporting endpoint
  - Implement FastAPI lease expiry detection endpoint
  - Update dashboard page to use FastAPI aggregation endpoint
  - Full TypeScript type check and build verification
  - Clean up stale legacy files (prisma, alembic, SQLAlchemy, auth router)
must_haves:
  truths:
    - "Landlord can log in and see a populated dashboard with unit counts, revenue, expenses, and occupancy"
    - "Landlord can create, read, update, and delete units, tenants, leases, expenses, and maintenance requests"
    - "Landlord can view monthly rent, generate rent records, and mark payments as paid"
    - "File uploads work for expense receipts and lease documents"
    - "Monthly rent generation creates payment records for all occupied units"
    - "Overdue payments are auto-detected and marked correctly"
    - "Lease expiry alerts display correct urgency levels on the dashboard"
    - "FastAPI health check endpoint responds correctly"
  artifacts:
    - path: "src/lib/AuthProvider.tsx"
      provides: "PocketBase auth context replacing FastAPI token auth"
    - path: "src/lib/api.ts"
      provides: "PocketBase SDK client replacing FastAPI API client"
    - path: "src/types/pocketbase.ts"
      provides: "TypeScript types matching PocketBase collections"
    - path: "backend/app/main.py"
      provides: "FastAPI app with reporting/automation endpoints"
    - path: "backend/app/config.py"
      provides: "PocketBase Admin API config for FastAPI"
  key_links:
    - from: "src/lib/AuthProvider.tsx"
      to: "pocketbase.authStore"
      via: "pb.authWithPassword + pb.authStore.token"
      pattern: "pb\\.authWithPassword"
    - from: "src/lib/api.ts"
      to: "pocketbase.collection"
      via: "pb.collection('X').getFullList/create/update/delete"
      pattern: "pb\\.collection\\(.*\\)\\.(getFullList|create|update|delete)"
    - from: "backend/app/main.py"
      to: "PocketBase Admin API"
      via: "HTTP calls with admin token to PocketBase"
      pattern: "POCKETBASE_ADMIN_TOKEN"
---

## Objective

Migrate the entire data layer from Prisma/FastAPI to PocketBase. Rewrite AuthProvider to use PocketBase SDK, replace the entire FastAPI API client with a PocketBase SDK client, wire all 6 domain pages (units, tenants, leases, rent, expenses, maintenance) to PocketBase SDK calls, build the FastAPI backend with reporting/automation endpoints that communicate via PocketBase Admin API, and implement file upload support.

Purpose: Complete the backend migration — every UI page and data operation now goes through PocketBase. FastAPI handles only aggregation and automation.

Output: Fully functional landlord dashboard backed by PocketBase, FastAPI reporting endpoints working, all CRUD operations functional.

## Execution Context

@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md

## Context

@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@ARCHITECTURE-DECISION.md

# Interface Context — Key Types and Contracts the executor needs:

# From src/lib/pocketbase.ts:
#   - Single export: `pocketBase` (PocketBase instance using NEXT_PUBLIC_POCKETBASE_URL)
#   - Auth token auto-attached by SDK via pb.authStore

# From src/types/pocketbase.ts:
#   - UserRecord: { id, email, name, role: 'landlord' | 'tenant', ... }
#   - UnitRecord: { id, name, number, floor, area, rent, deposit, status, ... }
#   - TenantRecord: { id, firstName, lastName, email, phone, unit, ... }
#   - LeaseRecord: { id, unit, tenant, startDate, endDate, monthlyRent, tenantAccess, ... }
#   - PaymentRecord: { id, unit, tenant, lease, amount, date, dueDate, status, ... }
#   - ExpenseRecord: { id, category, amount, date, description, unit, file, ... }
#   - MaintenanceRecord: { id, unit, tenant, title, description, priority, status, ... }
#   - NoticeRecord: { id, unit, tenant, title, message, type, status, ... }

# PocketBase SDK patterns (from src/lib/pocketbase.ts and pocketbase npm docs):
#   pb.collection('units').getFullList()           // GET all records
#   pb.collection('units').getFirst()              // GET first record
#   pb.collection('units').getList(page, perPage)  // PAGINATED
#   pb.collection('units').getRecordAndExpand(id)  // GET with relations
#   pb.collection('units').create(data)            // POST create
#   pb.collection('units').update(id, data)        // PATCH update
#   pb.collection('units').delete(id)              // DELETE
#   pb.authStore.isValid                           // boolean — is user authenticated
#   pb.authStore.token                             // string — auth token
#   pb.authStore.clear()                           // clears session

# PocketBase file upload pattern:
#   pb.collection('expenses').create({
#     ...formData,
#     file: fileInput.files[0]
#   })

# PocketBase query filters:
#   pb.collection('units').getFullList({
#     filter: 'status == "occupied" && name ~ "1"',
#     expand: 'tenants'
#   })

# From src/lib/api.ts (current — needs replacement):
#   - 491 lines of FastAPI client code
#   - Types: Unit, UnitWithRelations, Tenant, TenantWithRelations, Lease, LeaseWithRelations, Payment, RentSummary, Expense, MaintenanceRequest, Dashboard
#   - All methods call fetch() to localhost:8000 (FastAPI)

# From src/lib/AuthProvider.tsx (current — needs rewrite):
#   - Calls FastAPI /auth/login and /auth/me
#   - Stores token in localStorage
#   - Provides signIn, signOut, user, isLoading

# From src/components/auth/AuthGuard.tsx:
#   - Wraps dashboard layout
#   - Checks useAuth().user — needs to check pb.authStore.isValid instead

# From src/app/(dashboard)/page.tsx:
#   - Calls getDashboard() from @/lib/api
#   - Transforms API data to component props
#   - Components: UnitStatusGrid, RevenueCard, OccupancyCard, ExpenseBreakdown, ActivityFeed, ExpirationsCard

# Dashboard pages call @/lib/api methods:
#   - units/page.tsx → getUnits()
#   - tenants/page.tsx → getTenants()
#   - leases/page.tsx → fetch('/api/leases')
#   - rent/page.tsx → getMonthRent(), generateRent(), markPaid()
#   - expenses/page.tsx → fetch('/api/expenses')
#   - maintenance/page.tsx → fetch('/api/maintenance')

# Create pages call fetch('/api/{entity}') POST:
#   - units/new/page.tsx → fetch('/api/units') POST
#   - expenses/new/page.tsx → fetch('/api/expenses') POST
#   - maintenance/new/page.tsx → fetch('/api/maintenance') POST
#   - tenants/new/page.tsx → fetch('/api/tenants') POST
#   - leases/new/page.tsx → fetch('/api/leases') POST

# Edit pages call fetch('/api/{entity}/{id}') PATCH/DELETE:
#   - units/[id]/edit/page.tsx → fetch('/api/units/{id}') GET + PATCH + DELETE
#   - expenses/[id]/edit/page.tsx → fetch('/api/expenses/{id}') GET + PATCH + DELETE
#   - maintenance/[id]/edit/page.tsx → fetch('/api/maintenance/{id}') GET + PATCH + DELETE
#   - tenants/[id]/edit/page.tsx → fetch('/api/tenants/{id}') GET + PATCH + DELETE

# Backend (FastAPI) — current state:
#   - backend/app/main.py — imports auth_router, units, tenants, leases, rent, expenses, maintenance routers
#   - All routers use SQLAlchemy + PostgreSQL (legacy)
#   - FastAPI is NOT talking to PocketBase yet
#   - Auth router exists but not needed (PocketBase handles auth)
#   - /health endpoint exists

# Key constraints:
#   - Phase 1 already deleted Prisma, NextAuth, bcrypt, src/app/api/
#   - pocketbase npm package is installed
#   - PocketBase collections must exist on localhost:8090
#   - FastAPI must use PocketBase Admin API (not direct DB)
#   - D-09: PocketBase SDK for all frontend data operations
#   - D-05: Single landlord user (no self-registration)
#   - D-07: RentAdjustment and ContactLog as JSON fields on parent records

## Tasks

<task type="auto">
  <name>Task 0: Rewrite AuthProvider to use PocketBase SDK</name>
  <files>src/lib/AuthProvider.tsx</files>
  <action>
Rewrite `src/lib/AuthProvider.tsx` to use the PocketBase SDK instead of FastAPI token auth.

Replace the current implementation (which calls `fetch()` to FastAPI `/auth/login` and `/auth/me`) with PocketBase SDK auth:

```typescript
'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import pb from '@/lib/pocketbase'

export interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: check if PocketBase has a valid session
  useEffect(() => {
    const updateAuth = () => {
      if (pb.authStore.isValid && pb.authStore.record) {
        setUser({
          id: pb.authStore.record.id,
          email: pb.authStore.record.email,
          name: pb.authStore.record.name || pb.authStore.record.email,
        })
      } else {
        setUser(null)
      }
    }

    updateAuth()
    pb.authStore.onChange(updateAuth)
    setIsLoading(false)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await pb.collection('users').authWithPassword(email, password)
      // pb.authStore is automatically updated by the SDK
      if (pb.authStore.isValid && pb.authStore.record) {
        setUser({
          id: pb.authStore.record.id,
          email: pb.authStore.record.email,
          name: pb.authStore.record.name || pb.authStore.record.email,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    pb.authStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

Also update `src/components/auth/AuthGuard.tsx` to use `pb.authStore.isValid` directly instead of `useAuth().user`:

```typescript
'use client'
import pb from '@/lib/pocketbase'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!pb.authStore.isValid) {
      redirect('/login')
    }
    setChecking(false)
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
```

Key changes:
- Remove all `fetch()` calls to FastAPI
- Use `pb.collection('users').authWithPassword(email, password)` for login
- Use `pb.authStore.onChange` for reactive auth state
- Use `pb.authStore.clear()` for logout
- AuthGuard uses `pb.authStore.isValid` directly (no AuthProvider dependency)
- Per D-03: Next.js is zero-server-side-logic; all auth logic goes to PocketBase

Using PocketBase SDK per user decision (D-09). Research suggested custom token refresh but PocketBase SDK handles this natively.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'AuthProvider' || echo 0</automated>
  </verify>
  <done>
    AuthProvider uses pb.authWithPassword + pb.authStore, AuthGuard checks pb.authStore.isValid directly, zero FastAPI auth calls remain.
  </done>
</task>

<task type="auto">
  <name>Task 1: Replace FastAPI API client with PocketBase SDK client</name>
  <files>src/lib/api.ts</files>
  <action>
Replace the entire `src/lib/api.ts` (491 lines of FastAPI client code) with a PocketBase SDK client.

Create a new `src/lib/api.ts` that:

1. Imports `pb` from `@/lib/pocketbase`
2. Replaces ALL 12 API modules with PocketBase SDK equivalents:

| Old (FastAPI) | New (PocketBase SDK) |
|---------------|---------------------|
| getUnits() → GET /units | pb.collection('units').getFullList() |
| getUnit(id) → GET /units/:id | pb.collection('units').getFirst({ filter: \`number="${id}"\` }) |
| createUnit(data) → POST /units | pb.collection('units').create(data) |
| updateUnit(id, data) → PATCH /units/:id | pb.collection('units').update(id, data) |
| deleteUnit(id) → DELETE /units/:id | pb.collection('units').delete(id) |
| getTenants(q) → GET /tenants?q= | pb.collection('tenants').getFullList({ filter: \`search("${q}")\` }) |
| getTenant(id) → GET /tenants/:id | pb.collection('tenants').getFirst({ filter: \`id="${id}"\` }) |
| createTenant(data) → POST /tenants | pb.collection('tenants').create(data) |
| updateTenant(id, data) → PATCH /tenants/:id | pb.collection('tenants').update(id, data) |
| deleteTenant(id) → DELETE /tenants/:id | pb.collection('tenants').delete(id) |
| getLeases(status) → GET /leases?status= | pb.collection('leases').getFullList({ filter: \`status="${status}"\` }) |
| getLease(id) → GET /leases/:id | pb.collection('leases').getFirst({ filter: \`id="${id}"\` }) |
| createLease(data) → POST /leases | pb.collection('leases').create(data) |
| updateLease(id, data) → PATCH /leases/:id | pb.collection('leases').update(id, data) |
| deleteLease(id) → DELETE /leases/:id | pb.collection('leases').delete(id) |
| getMonthRent(month,year) → GET /rent/month/:m/:y | pb.collection('payments').getFullList({ filter: \`date >= "YYYY-MM-01" && date <= "YYYY-MM-31"\` }) |
| generateRent(data) → POST /rent/generate | pb.collection('payments').create({ ... }) x N |
| markPaid(unitId, data) → POST /rent/:id/mark-paid | pb.collection('payments').update(id, { status: 'paid' }) |
| getExpenses(filters) → GET /expenses? | pb.collection('expenses').getFullList({ filter: \`...\` }) |
| getExpense(id) → GET /expenses/:id | pb.collection('expenses').getFirst({ filter: \`id="${id}"\` }) |
| createExpense(data) → POST /expenses | pb.collection('expenses').create(data) |
| updateExpense(id, data) → PATCH /expenses/:id | pb.collection('expenses').update(id, data) |
| deleteExpense(id) → DELETE /expenses/:id | pb.collection('expenses').delete(id) |
| getMaintenance(filters) → GET /maintenance? | pb.collection('maintenance').getFullList({ filter: \`...\` }) |
| getMaintenanceRequest(id) → GET /maintenance/:id | pb.collection('maintenance').getFirst({ filter: \`id="${id}"\` }) |
| createMaintenance(data) → POST /maintenance | pb.collection('maintenance').create(data) |
| updateMaintenance(id, data) → PATCH /maintenance/:id | pb.collection('maintenance').update(id, data) |
| deleteMaintenance(id) → DELETE /maintenance/:id | pb.collection('maintenance').delete(id) |
| getDashboard() → GET /dashboard | pb.collection('units').getFullList() + pb.collection('payments').getFullList() + pb.collection('expenses').getFullList() |

3. Keep the TypeScript interface types (Unit, Tenant, Lease, Payment, Expense, MaintenanceRequest, Dashboard) but update field names to match PocketBase collection schema from `src/types/pocketbase.ts`.

4. Map field names between old Prisma/SQLAlchemy names and new PocketBase names:
   - `unit_number` → `number`
   - `rent_amount` → `rent`
   - `security_deposit` → `deposit`
   - `first_name` → `firstName`
   - `last_name` → `lastName`
   - `created_at` → `createdAt`
   - `status: 'OCCUPIED'` → `status: 'occupied'`
   - etc.

5. Export all the same function signatures as before so page components don't need to change their import names.

6. Add file upload support for expenses and leases:
   - `createExpense(data, file?)` → uses `pb.collection('expenses').create({ ...data, file })`
   - `createLease(data, files?)` → uses `pb.collection('leases').create({ ...data, file: files })`

Field name mapping reference (Prisma/SQLAlchemy → PocketBase):
```
Unit: unit_number→number, type→type, status→status, rent_amount→rent, security_deposit→deposit
Tenant: first_name→firstName, last_name→lastName, unit_id→unit, emergency_contact→notes
Lease: start_date→startDate, end_date→endDate, rent_amount→monthlyRent, tenant_id→tenant, unit_id→unit
Payment: amount→amount, date→date, due_date→dueDate, status→status, unit_id→unit, lease_id→lease
Expense: amount→amount, category→category, description→description, date→date, receipt_url→file, unit_id→unit
Maintenance: title→title, description→description, priority→priority, status→status, cost→cost, unit_id→unit
```
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | wc -l</automated>
  </verify>
  <done>
    api.ts is a PocketBase SDK client with all same exported function names, field name mapping applied, file upload support for expenses and leases.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire units pages to PocketBase SDK</name>
  <files>
src/app/(dashboard)/units/page.tsx
src/app/(dashboard)/units/new/page.tsx
src/app/(dashboard)/units/[id]/edit/page.tsx
  </files>
  <action>
Update all three units page components to use the new PocketBase API client (`@/lib/api`) instead of raw `fetch()` calls.

**units/page.tsx:**
- Change `import { getUnits, UnitWithRelations } from '@/lib/api'`
- `getUnits(search)` → returns data directly from PocketBase SDK (no nested `data.units` wrapper)
- Remove manual status filtering on frontend — PocketBase SDK already returns filtered data
- Keep the search, filter, and grid layout the same

**units/new/page.tsx:**
- Change `fetch('/api/units') POST` → `createUnit(data)` from `@/lib/api`
- Handle error responses from PocketBase SDK (validation errors)
- Keep toast + redirect flow the same

**units/[id]/edit/page.tsx:**
- Change `fetch('/api/units/{id}') GET` → `pb.collection('units').getFirst({ filter: \`id="${id}"\` })` or use `getUnit(id)` from api.ts
- Change `fetch('/api/units/{id}') PATCH` → `updateUnit(id, data)` from `@/lib/api`
- Change `fetch('/api/units/{id}') DELETE` → `deleteUnit(id)` from `@/lib/api`
- Handle PocketBase SDK error responses
- Keep delete confirmation modal the same

Field mapping for form data: `UnitFormData` from `unit-form.tsx` uses `unitNumber, type, rentAmount, securityDeposit` — these need to be mapped to PocketBase field names (`number, type, rent, deposit`) inside the API client layer so component code doesn't need to change.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'units' || echo 0</automated>
  </verify>
  <done>
    All units pages use @/lib/api methods, zero raw fetch() calls to /api/units remain.
  </done>
</task>

<task type="auto">
  <name>Task 3: Wire tenants pages to PocketBase SDK</name>
  <files>src/app/(dashboard)/tenants/page.tsx</files>
  <action>
Update tenants page to use PocketBase SDK via `@/lib/api`:

- Change `import { getTenants, TenantWithRelations } from '@/lib/api'`
- Replace `getTenants(search)` call — PocketBase returns flat list, not nested
- Map `TenantWithRelations` type from PocketBase schema
- Keep search functionality (using PocketBase `search()` function)
- Keep TenantTable component unchanged (it receives the data array)

No new tenants sub-pages exist in the codebase (no tenants/new, tenants/[id]/edit), so only the main page needs updating.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'tenants' || echo 0</automated>
  </verify>
  <done>
    Tenants page uses PocketBase SDK, zero raw fetch() to /api/tenants remains.
  </done>
</task>

<task type="auto">
  <name>Task 4: Wire leases page to PocketBase SDK</name>
  <files>src/app/(dashboard)/leases/page.tsx</files>
  <action>
Update leases page to use PocketBase SDK via `@/lib/api`:

- Replace `fetch('/api/leases?status=...')` → `getLeases(status)` from `@/lib/api`
- Replace `fetch('/api/leases/{id}') PATCH { status: 'TERMINATED' }` → `updateLease(id, { status: 'terminated' })`
- Map lease status: `'TERMINATED'` (Prisma) → `'terminated'` (PocketBase)
- Map `Lease` type to PocketBase schema (startDate, endDate, monthlyRent, tenant, unit)
- Keep LeaseTable and LeaseFilters components unchanged
- Remove the `data.leases` wrapper access (PocketBase returns array directly)
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'leases' || echo 0</automated>
  </verify>
  <done>
    Leases page uses PocketBase SDK, zero raw fetch() to /api/leases remains.
  </done>
</task>

<task type="auto">
  <name>Task 5: Wire rent page to PocketBase SDK</name>
  <files>src/app/(dashboard)/rent/page.tsx</files>
  <action>
Update rent page to use PocketBase SDK via `@/lib/api`:

- Replace `getMonthRent(month, year)` → uses PocketBase to query payments for the month
- Replace `generateRent({ month, year })` → creates payment records for active leases (this is a client-side generation for now; the FastAPI endpoint will be wired in the backend plan)
- Replace `markPaid(unitId, data)` → `updatePayment(id, { status: 'paid' })` from `@/lib/api`

The rent page needs the most complex mapping:
- PocketBase payments have `date`, `dueDate`, `amount`, `status`, `unit`, `lease` fields
- Map `Payment` type from `@/lib/api` to page's `RentRecord` interface
- Calculate `daysOverdue` and `daysUntilDue` client-side (same as current logic)
- `generateRent` for now creates payments client-side using PocketBase SDK (Phase 3 minimal implementation — the FastAPI endpoint replaces this later)

Keep MonthPicker, RentSummary, RentTable components unchanged.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'rent' || echo 0</automated>
  </verify>
  <done>
    Rent page uses PocketBase SDK for all payment operations.
  </done>
</task>

<task type="auto">
  <name>Task 6: Wire expenses page to PocketBase SDK</name>
  <files>src/app/(dashboard)/expenses/page.tsx</files>
  <action>
Update expenses page to use PocketBase SDK via `@/lib/api`:

- Replace `fetch('/api/expenses?{params}')` → `getExpenses(filters)` from `@/lib/api`
- Map `Expense` type: `receipt_url` → `file` (PocketBase file field)
- Filter by category using PocketBase filter: `category === "Plumbing"`
- Keep summary calculations (total, count, average) the same
- Keep expense list and filter UI unchanged

No expenses sub-pages exist (no expenses/new, expenses/[id]/edit) in the current codebase — only the main listing page.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'expenses' || echo 0</automated>
  </verify>
  <done>
    Expenses page uses PocketBase SDK, zero raw fetch() to /api/expenses remains.
  </done>
</task>

<task type="auto">
  <name>Task 7: Wire maintenance page to PocketBase SDK</name>
  <files>src/app/(dashboard)/maintenance/page.tsx</files>
  <action>
Update maintenance page to use PocketBase SDK via `@/lib/api`:

- Replace `fetch('/api/maintenance?{params}')` → `getMaintenance(filters)` from `@/lib/api`
- Map `MaintenanceRequest` type: `priority` values (`LOW`, `MEDIUM`, `HIGH`, `EMERGENCY` → `low`, `medium`, `high`, `urgent`)
- Map `status` values: `REPORTED`, `IN_PROGRESS`, `COMPLETED` → `open`, `in_progress`, `completed`
- Keep summary counts (open, completed, total cost) the same
- Keep filter UI (search, status filter, priority filter) unchanged

No maintenance sub-pages exist (no maintenance/new, maintenance/[id]/edit) — only the main listing page.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'maintenance' || echo 0</automated>
  </verify>
  <done>
    Maintenance page uses PocketBase SDK, zero raw fetch() to /api/maintenance remains.
  </done>
</task>

<task type="auto">
  <name>Task 8: Wire dashboard page to PocketBase SDK</name>
  <files>src/app/(dashboard)/page.tsx</files>
  <action>
Update dashboard page to use PocketBase SDK for aggregation:

1. Replace `getDashboard()` from `@/lib/api` with a dashboard aggregation function that:
   - Fetches all units: `pb.collection('units').getFullList()`
   - Fetches all payments for current month: `pb.collection('payments').getFullList({ filter: \`date >= "2026-04-01" && date < "2026-05-01"\` })`
   - Fetches all expenses for current month: `pb.collection('expenses').getFullList({ filter: \`date >= "2026-04-01" && date < "2026-05-01"\` })`
   - Fetches all leases: `pb.collection('leases').getFullList()`
   - Computes dashboard aggregation client-side:
     - `unit_counts`: count by status
     - `occupancy_rate`: occupied / total × 100
     - `monthly_revenue`: sum of paid payments vs expected from leases
     - `expenses`: sum by category, net_profit = revenue - expenses
     - `upcoming_expirations`: leases ending within 60 days, sorted by urgency

2. Map `Dashboard` type to PocketBase data:
   - `unit_counts.total` → units.length
   - `unit_counts.occupied` → units.filter(u => u.status === 'occupied').length
   - `monthly_revenue.collected` → payments.filter(p => p.status === 'paid').reduce(sum)
   - `expenses.by_category` → expenses grouped by category

3. Keep all component props and rendering the same — only the data source changes

4. The `getDashboard()` function in `@/lib/api.ts` handles all the aggregation logic
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'page.tsx' || echo 0</automated>
  </verify>
  <done>
    Dashboard page uses PocketBase SDK for all data, zero FastAPI calls remain.
  </done>
</task>

<task type="auto">
  <name>Task 9: Update PocketBase types and config</name>
  <files>src/types/pocketbase.ts</files>
  <action>
Update `src/types/pocketbase.ts` to match the actual PocketBase collection schema:

1. Map all types to use PocketBase field naming convention (camelCase):
   - `UnitRecord`: `number`, `rent`, `deposit`, `status`, `features`, `description`
   - `TenantRecord`: `firstName`, `lastName`, `phone`, `unit`, `moveInDate`, `status`
   - `LeaseRecord`: `unit`, `tenant`, `startDate`, `endDate`, `monthlyRent`, `tenantAccess`
   - `PaymentRecord`: `unit`, `tenant`, `lease`, `amount`, `date`, `dueDate`, `status`, `paymentMethod`
   - `ExpenseRecord`: `category`, `amount`, `date`, `description`, `unit`, `status`, `file`
   - `MaintenanceRecord`: `unit`, `tenant`, `title`, `description`, `priority`, `status`
   - `NoticeRecord`: `unit`, `tenant`, `title`, `message`, `type`, `status`

2. Add PocketBase system fields to all records: `id`, `collectionId`, `createdAt`, `updatedAt`

3. For `file` fields (ExpenseRecord.file, LeaseRecord.documents), the type should be `FileItem | null` where `FileItem` has `id`, `name`, `url`

4. Add `rentHistory` as JSON field on `UnitRecord` (replaces RentAdjustment collection)
5. Add `contactLog` as JSON field on `TenantRecord` (replaces ContactLog collection)

Per D-07: RentAdjustment and ContactLog stored as JSON arrays on parent records.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'pocketbase' || echo 0</automated>
  </verify>
  <done>
    All PocketBase types match collection schema, system fields included, JSON fields for rentHistory/contactLog defined.
  </done>
</task>

<task type="auto">
  <name>Task 10: Set up FastAPI backend with PocketBase Admin API</name>
  <files>
backend/app/main.py
backend/app/config.py
backend/app/models/__init__.py
backend/app/routers/__init__.py
backend/app/routers/health.py
backend/requirements.txt
  </files>
  <action>
Rewrite the FastAPI backend to communicate with PocketBase via Admin API instead of SQLAlchemy/PostgreSQL.

**backend/app/config.py** — Update settings:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    pocketbase_url: str = "http://localhost:8090"
    pocketbase_admin_token: str = ""  # Admin API token for automation
    fastapi_port: int = 8000

    class Config:
        env_file = ".env"
```

**backend/app/main.py** — Simplify:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health, dashboard, rent, expenses, leases

app = FastAPI(title="Property-Pi", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-vercel-url.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(rent.router)
app.include_router(expenses.router)
app.include_router(leases.router)
```
Remove all CRUD routers (units, tenants, maintenance) — those are handled by PocketBase SDK directly from the frontend.

**backend/app/routers/health.py** — Health check:
```python
from fastapi import APIRouter
import httpx

router = APIRouter()

@router.get("/health")
async def health_check():
    # Verify PocketBase is reachable
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{settings.pocketbase_url}/api/management/tenants")
            if resp.status_code == 200:
                return {"status": "ok", "pocketbase": "connected"}
        except Exception:
            return {"status": "degraded", "pocketbase": "unreachable"}
    return {"status": "ok"}
```

**requirements.txt** — Update:
```
fastapi==0.104.1
uvicorn==0.24.0
httpx==0.25.2
pydantic-settings==2.1.0
```
Remove SQLAlchemy, alembic, psycopg2.

Delete old files:
- `backend/app/database.py` (SQLAlchemy engine)
- `backend/app/deps.py` (JWT auth deps — not needed)
- `backend/app/setup_db.py` (DB init — not needed)
- `backend/app/routers/auth.py` (auth router — PocketBase handles auth)
- `backend/app/routers/units.py`, `tenants.py`, `leases.py`, `rent.py`, `expenses.py`, `maintenance.py` (CRUD routers — replaced by PocketBase SDK)
- `backend/alembic/` directory
- `backend/migrations/` directory
- `prisma/` directory (already deleted in Phase 1)
  </action>
  <verify>
    <automated>cd backend && python -c "from app.main import app; print('OK')" 2>&1</automated>
  </verify>
  <done>
    FastAPI communicates only with PocketBase Admin API, CRUD routers removed, health endpoint working.
  </done>
</task>

<task type="auto">
  <name>Task 11: Implement FastAPI dashboard aggregation endpoint</name>
  <files>backend/app/routers/dashboard.py</files>
  <action>
Create `backend/app/routers/dashboard.py` — aggregated dashboard data endpoint:

```python
from fastapi import APIRouter
import httpx
from app.config import settings

router = APIRouter()

@router.get("/api/fastapi/dashboard")
async def get_dashboard():
    """Aggregated dashboard data from PocketBase."""
    async with httpx.AsyncClient() as client:
        # Fetch all units
        units_resp = await client.get(f"{settings.pocketbase_url}/api/collections/units/records",
                                       params={"perPage": "100"})
        units = units_resp.json()

        # Fetch all payments for current month
        now = datetime.now()
        month_start = now.replace(day=1).strftime("%Y-%m-%d")
        next_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1)
        payments_resp = await client.get(f"{settings.pocketbase_url}/api/collections/payments/records",
                                         params={"filter": f'date >= "{month_start}" && date < "{next_month.strftime("%Y-%m-%d")}"'})
        payments = payments_resp.json()

        # Fetch all expenses for current month
        expenses_resp = await client.get(f"{settings.pocketbase_url}/api/collections/expenses/records",
                                         params={"filter": f'date >= "{month_start}" && date < "{next_month.strftime("%Y-%m-%d")}"'})
        expenses = expenses_resp.json()

        # Fetch all leases
        leases_resp = await client.get(f"{settings.pocketbase_url}/api/collections/leases/records",
                                       params={"perPage": "100"})
        leases = leases_resp.json()

    # Compute aggregation
    unit_counts = {"total": len(units), "occupied": 0, "vacant": 0, "maintenance": 0, "under_renovation": 0}
    for u in units:
        if u["status"] == "occupied": unit_counts["occupied"] += 1
        elif u["status"] == "vacant": unit_counts["vacant"] += 1
        elif u["status"] == "maintenance": unit_counts["maintenance"] += 1
        elif u["status"] == "under_renovation": unit_counts["under_renovation"] += 1

    occupancy_rate = (unit_counts["occupied"] / unit_counts["total"] * 100) if unit_counts["total"] > 0 else 0

    monthly_revenue = {
        "expected": sum(l.get("monthlyRent", 0) for l in leases),
        "collected": sum(p.get("amount", 0) for p in payments if p.get("status") == "paid"),
    }

    expenses_by_category = {}
    for e in expenses:
        cat = e.get("category", "Other")
        expenses_by_category[cat] = expenses_by_category.get(cat, 0) + e.get("amount", 0)

    expenses_total = sum(e.get("amount", 0) for e in expenses)
    net_profit = monthly_revenue["collected"] - expenses_total

    # Upcoming expirations (within 60 days)
    expirations = []
    for l in leases:
        end_date = datetime.strptime(l["endDate"], "%Y-%m-%d")
        days_until = (end_date - now).days
        if 0 < days_until <= 60:
            expirations.append({
                "unit_number": "",  # Would need to expand unit record
                "tenant_name": "",  # Would need to expand tenant record
                "end_date": l["endDate"],
                "days_until_expiry": days_until,
            })

    return {
        "unit_counts": unit_counts,
        "occupancy_rate": round(occupancy_rate, 1),
        "monthly_revenue": monthly_revenue,
        "expenses": {"total": expenses_total, "net_profit": net_profit, "by_category": expenses_by_category},
        "recent_activities": [],  # Placeholder — would track recent changes
        "upcoming_expirations": expirations,
    }
```

This endpoint handles REQ-05 (dashboard aggregation) and REQ-11 (lease expiry alerts).
  </action>
  <verify>
    <automated>cd backend && python -c "from app.routers.dashboard import router; print('OK')" 2>&1</automated>
  </verify>
  <done>
    FastAPI dashboard aggregation endpoint working, returns unit counts, revenue, expenses, occupancy, expirations.
  </done>
</task>

<task type="auto">
  <name>Task 12: Implement FastAPI rent automation endpoints</name>
  <files>backend/app/routers/rent.py</files>
  <action>
Create `backend/app/routers/rent.py` — rent automation endpoints:

```python
from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from datetime import datetime, timedelta
from app.config import settings

router = APIRouter()

class GenerateRentRequest(BaseModel):
    month: int
    year: int

class MarkOverdueResponse(BaseModel):
    marked: int

@router.post("/api/fastapi/rent/generate")
async def generate_monthly_rent(req: GenerateRentRequest):
    """Create payment records for all active leases for the target month."""
    async with httpx.AsyncClient() as client:
        # Find all active leases
        leases_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/leases/records",
            params={"filter": "status == 'active'"}
        )
        leases = leases_resp.json()

        # Calculate target month date range
        month_start = f"{req.year}-{req.month:02d}-01"
        month_end = f"{req.year}-{req.month:02d}-31"

        # Check which payments already exist for this month
        existing_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/payments/records",
            params={"filter": f"date >= '{month_start}' && date <= '{month_end}'"}
        )
        existing = existing_resp.json()
        existing_dates = set((p.get("unit"), p.get("date")) for p in existing)

        created = []
        for lease in leases:
            target_date = f"{req.year}-{req.month:02d}-01"
            due_date = f"{req.year}-{req.month:02d}-05"

            if (lease.get("unit"), target_date) not in existing_dates:
                # Create payment
                payment_data = {
                    "unit": lease["unit"],
                    "tenant": lease["tenant"],
                    "lease": lease["id"],
                    "amount": lease.get("monthlyRent", 0),
                    "date": target_date,
                    "dueDate": due_date,
                    "status": "pending",
                }
                resp = await client.post(
                    f"{settings.pocketbase_url}/api/collections/payments/records",
                    json=payment_data,
                )
                if resp.status_code == 200:
                    created.append(resp.json())

        return created

@router.post("/api/fastapi/rent/mark-overdue", response_model=MarkOverdueResponse)
async def mark_overdue_payments():
    """Mark all pending payments past due date as overdue."""
    async with httpx.AsyncClient() as client:
        now = datetime.now().strftime("%Y-%m-%d")
        # Find all pending payments with dueDate < now
        payments_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/payments/records",
            params={"filter": "status == 'pending' && dueDate < '" + now + "'"}
        )
        payments = payments_resp.json()

        marked = 0
        for payment in payments:
            await client.patch(
                f"{settings.pocketbase_url}/api/collections/payments/records/{payment['id']}",
                json={"status": "overdue"},
            )
            marked += 1

        return {"marked": marked}
```

This handles REQ-09 (monthly rent generation) and REQ-10 (auto-mark overdue).
  </action>
  <verify>
    <automated>cd backend && python -c "from app.routers.rent import router; print('OK')" 2>&1</automated>
  </verify>
  <done>
    Rent generation and overdue marking endpoints working, creates payments for active leases, marks past-due payments.
  </done>
</task>

<task type="auto">
  <name>Task 13: Implement FastAPI expense reporting endpoint</name>
  <files>backend/app/routers/expenses.py</files>
  <action>
Create `backend/app/routers/expenses.py` — expense reporting endpoint:

```python
from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from app.config import settings

router = APIRouter()

class ExpenseReportResponse(BaseModel):
    total: float
    net_profit: float
    by_category: dict

@router.get("/api/fastapi/expenses/report")
async def expense_report(
    category: str = None,
    unit_id: str = None,
    month: int = None,
    year: int = None,
):
    """Expense report with category breakdown and net profit."""
    async with httpx.AsyncClient() as client:
        filter_parts = []
        if category:
            filter_parts.append(f'category == "{category}"')
        if month and year:
            month_start = f"{year}-{month:02d}-01"
            next_month = (datetime(year, month, 1) + timedelta(days=32)).replace(day=1)
            filter_parts.append(f'date >= "{month_start}" && date < "{next_month.strftime("%Y-%m-%d")}"')

        filter_str = " && ".join(filter_parts) if filter_parts else "1 == 1"

        expenses_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/expenses/records",
            params={"filter": filter_str}
        )
        expenses = expenses_resp.json()

        # Fetch revenue to calculate net profit
        payments_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/payments/records",
            params={"filter": "status == 'paid'"}
        )
        payments = payments_resp.json()
        revenue = sum(p.get("amount", 0) for p in payments)

        total = sum(e.get("amount", 0) for e in expenses)
        by_category = {}
        for e in expenses:
            cat = e.get("category", "Other")
            by_category[cat] = by_category.get(cat, 0) + e.get("amount", 0)

        return {
            "total": total,
            "net_profit": revenue - total,
            "by_category": by_category,
        }
```

This handles REQ-05 (expense reporting).
  </action>
  <verify>
    <automated>cd backend && python -c "from app.routers.expenses import router; print('OK')" 2>&1</automated>
  </verify>
  <done>
    Expense reporting endpoint working with category filtering and net profit calculation.
  </done>
</task>

<task type="auto">
  <name>Task 14: Implement FastAPI lease expiry detection</name>
  <files>backend/app/routers/leases.py</files>
  <action>
Create `backend/app/routers/leases.py` — lease expiry detection endpoint:

```python
from fastapi import APIRouter
import httpx
from datetime import datetime, timedelta
from app.config import settings

router = APIRouter()

@router.get("/api/fastapi/leases/expiring")
async def get_expiring_leases():
    """Return leases ending within 60 days with urgency levels."""
    async with httpx.AsyncClient() as client:
        leases_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/leases/records",
            params={"filter": "status == 'active'", "perPage": "100"}
        )
        leases = leases_resp.json()

    now = datetime.now()
    result = []

    for lease in leases:
        end_date = datetime.strptime(lease["endDate"], "%Y-%m-%d")
        days_until = (end_date - now).days

        if days_until <= 60:
            if days_until <= 15:
                urgency = "critical"
            elif days_until <= 30:
                urgency = "warning"
            else:
                urgency = "upcoming"

            result.append({
                "id": lease["id"],
                "unit_number": "",  # Would need unit expansion
                "tenant_name": "",  # Would need tenant expansion
                "end_date": lease["endDate"],
                "days_until_expiry": days_until,
                "urgency": urgency,
            })

    return sorted(result, key=lambda x: x["days_until_expiry"])
```

This handles REQ-11 (lease expiry alerts).
  </action>
  <verify>
    <automated>cd backend && python -c "from app.routers.leases import router; print('OK')" 2>&1</automated>
  </verify>
  <done>
    Lease expiry detection endpoint working, returns urgency levels (critical/warning/upcoming).
  </done>
</task>

<task type="auto">
  <name>Task 15: Update dashboard page to use FastAPI aggregation endpoint</name>
  <files>src/app/(dashboard)/page.tsx</files>
  <action>
Update the dashboard page to use the FastAPI aggregation endpoint instead of client-side PocketBase aggregation:

1. Create `src/lib/fastapi-client.ts` (or add to existing api.ts):
```typescript
const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000'

async function fetchFastApi<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`FastAPI error: ${res.status}`)
  return res.json()
}

export async function getDashboard(): Promise<Dashboard> {
  return fetchFastApi('/api/fastapi/dashboard')
}
```

2. Update `src/app/(dashboard)/page.tsx` to use this new `getDashboard()` instead of the PocketBase SDK aggregation
3. Keep the component rendering the same — only the data source changes
4. Remove the client-side aggregation logic from the page component (moved to FastAPI)
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -c 'page.tsx' || echo 0</automated>
  </verify>
  <done>
    Dashboard page uses FastAPI aggregation endpoint, client-side aggregation removed.
  </done>
</task>

<task type="auto">
  <name>Task 16: Build and verify — TypeScript, lint, build</name>
  <files>src/app/(dashboard)/page.tsx</files>
  <action>
Run full TypeScript type check and build:

```bash
npx tsc --noEmit
npm run build
```

Fix any type errors that arise from:
- Field name mismatches between PocketBase types and component expectations
- Missing exports from api.ts
- Import path issues
- Type mismatches from the rename from SQLAlchemy field names to PocketBase field names

Also verify:
- No references to `@prisma/client` remain (should already be cleaned)
- No references to `next-auth` remain (should already be cleaned)
- No references to `bcryptjs` remain
- No references to `/api/` routes (should already be cleaned)
- All page components import from `@/lib/api` not from raw fetch

Clean up any remaining stale files:
- Delete `prisma/` directory if it still exists
- Delete `backend/app/deps.py`
- Delete `backend/app/database.py`
- Delete `backend/app/setup_db.py`
- Delete `backend/app/routers/auth.py`
- Delete `backend/alembic/` directory
- Delete `backend/migrations/` directory
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 && echo "TSC OK" && npm run build 2>&1 && echo "BUILD OK"</automated>
  </verify>
  <done>
    Zero TypeScript errors, zero build errors, no legacy references remain.
  </done>
</task>

</tasks>

## Threat Model

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Client → PocketBase | Untrusted input crosses here; auth token required |
| Client → FastAPI | Aggregation/automation requests; no auth needed for read |
| FastAPI → PocketBase Admin API | Internal communication; requires admin token |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-3-01 | Integrity | PocketBase SDK auth | mitigate | All collection rules require `@request.auth.id != ''`; token validated by PocketBase |
| T-3-02 | Privilege Escalation | PocketBase Admin API | mitigate | FastAPI uses admin token; no client access to admin endpoint |
| T-3-03 | Information Disclosure | FastAPI aggregation | accept | Aggregation only returns computed summaries, not raw record data |
| T-3-04 | Denial of Service | Rent generation endpoint | mitigate | Only one payment per unit per month; bounded iteration over leases |

## Verification

- PocketBase running on localhost:8090 with all 7 collections
- Auth: Landlord can log in with email/password, sees dashboard
- Units: CRUD operations work (create → list → edit → delete)
- Tenants: CRUD operations work
- Leases: CRUD operations work, status filtering works
- Rent: Monthly view works, generate creates payments, mark-paid works
- Expenses: CRUD works, category filtering works
- Maintenance: Listing works, status/priority filtering works
- Dashboard: Unit counts, revenue, expenses, occupancy display correctly
- FastAPI: /health returns ok, /api/fastapi/dashboard returns aggregated data
- Build: `npm run build` succeeds with zero errors
- No legacy Prisma/NextAuth/Bcrypt references remain

## Success Criteria

- Dashboard loads with real PocketBase data (not mock/skeleton)
- All 6 domain pages display data from PocketBase
- All CRUD create/update/delete operations work through PocketBase SDK
- FastAPI health endpoint responds at localhost:8000/health
- FastAPI dashboard aggregation endpoint returns computed data
- Monthly rent generation creates payment records for active leases
- Overdue payment detection marks past-due payments correctly
- Lease expiry alerts display within 60-day window with urgency levels
- Expense reporting shows category breakdown and net profit
- `npx tsc --noEmit` passes with zero errors
- `npm run build` succeeds
- Zero references to Prisma, NextAuth, bcryptjs, or SQLAlchemy in codebase

## Output

After completion, create `.planning/phases/03/03-SUMMARY.md`
