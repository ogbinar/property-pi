# Codebase Structure

**Analysis Date:** 2026-04-21

## Directory Layout

```
/projects/property-pi/
├── src/                          # Next.js application source
│   ├── app/                      # App router pages and layouts
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── layout.tsx        # Dashboard layout (sidebar + header)
│   │   │   ├── tenants/          # Tenant management
│   │   │   ├── units/            # Unit management
│   │   │   ├── leases/           # Lease management
│   │   │   ├── rent/             # Rent/payment operations
│   │   │   ├── expenses/         # Expense management
│   │   │   └── maintenance/      # Maintenance requests
│   │   ├── login/                # Authentication
│   │   │   └── page.tsx          # Login form
│   │   ├── tenant/               # Tenant portal
│   │   │   └── portal/           # Tenant-facing pages
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Root page (redirects to /login)
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── layout/               # Layout components
│   │   │   ├── sidebar.tsx       # Navigation sidebar
│   │   │   └── header.tsx        # Top header bar
│   │   ├── auth/                 # Authentication components
│   │   │   ├── AuthGuard.tsx     # Route protection wrapper
│   │   │   └── LogoutButton.tsx  # Logout action
│   │   ├── ui/                   # Reusable UI primitives
│   │   ├── dashboard/            # Dashboard widgets
│   │   ├── units/                # Unit-specific components
│   │   ├── tenants/              # Tenant-specific components
│   │   ├── leases/               # Lease-specific components
│   │   ├── rent/                 # Rent/payment components
│   │   ├── expenses/             # Expense components
│   │   └── maintenance/          # Maintenance components
│   ├── lib/                      # Utilities and services
│   │   ├── api.ts                # PocketBase API client (922 lines)
│   │   ├── pocketbase.ts         # PocketBase SDK configuration
│   │   └── AuthProvider.tsx      # Authentication context
│   └── types/                    # TypeScript type definitions
│       └── pocketbase.ts         # Collection type interfaces
├── backend/                      # FastAPI backend
│   └── app/
│       ├── main.py               # FastAPI application entry
│       ├── config.py             # Settings from environment
│       └── routers/              # API route handlers
│           ├── dashboard.py      # Dashboard aggregation
│           ├── rent.py           # Rent automation
│           ├── expenses.py       # Expense processing
│           ├── leases.py         # Lease operations
│           └── health.py         # Health check
├── .planning/                    # Project planning documents
│   ├── codebase/                 # Codebase analysis
│   ├── phases/                   # Implementation phases
│   └── intel/                    # Research and intelligence
├── package.json                  # Frontend dependencies
└── requirements.txt              # Backend dependencies
```

## Directory Purposes

**`src/app`:**
- Purpose: Next.js App Router pages and layouts
- Contains: Route definitions, page components, layout wrappers
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/(dashboard)/page.tsx`

**`src/app/(dashboard)`:**
- Purpose: Protected dashboard routes with shared layout
- Contains: Feature-specific route groups (tenants, units, leases, etc.)
- Key files: `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/page.tsx`

**`src/components`:**
- Purpose: Reusable React components organized by feature/domain
- Contains: Feature-specific and shared components
- Key files: `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx`

**`src/lib`:**
- Purpose: Application services, utilities, and shared logic
- Contains: API client, authentication provider, PocketBase configuration
- Key files: `src/lib/api.ts`, `src/lib/AuthProvider.tsx`

**`src/types`:**
- Purpose: TypeScript type definitions
- Contains: Collection interfaces matching PocketBase schema
- Key files: `src/types/pocketbase.ts`

**`backend/app`:**
- Purpose: FastAPI backend service
- Contains: Application entry, configuration, route handlers
- Key files: `backend/app/main.py`, `backend/app/config.py`

**`backend/app/routers`:**
- Purpose: API route handlers for automation/aggregation
- Contains: Domain-specific router modules
- Key files: `backend/app/routers/dashboard.py`, `backend/app/routers/rent.py`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx` - Root route (redirects to login)
- `src/app/login/page.tsx` - Login page
- `src/app/(dashboard)/page.tsx` - Dashboard home
- `backend/app/main.py` - FastAPI application entry

**Configuration:**
- `package.json` - Frontend dependencies and scripts
- `backend/requirements.txt` - Backend dependencies
- `backend/app/config.py` - Backend settings from environment
- `src/lib/pocketbase.ts` - PocketBase SDK configuration

**Core Logic:**
- `src/lib/api.ts` - All PocketBase CRUD operations and data transformations
- `src/lib/AuthProvider.tsx` - Authentication context and hooks
- `src/types/pocketbase.ts` - Type definitions for all collections

**Routing:**
- `src/app/(dashboard)/layout.tsx` - Dashboard layout with sidebar/header
- `src/components/layout/sidebar.tsx` - Navigation sidebar
- `src/components/layout/header.tsx` - Top header bar

**API Routers:**
- `backend/app/routers/dashboard.py` - Dashboard aggregation endpoint
- `backend/app/routers/rent.py` - Payment generation and overdue marking
- `backend/app/routers/expenses.py` - Expense processing
- `backend/app/routers/leases.py` - Lease operations
- `backend/app/routers/health.py` - Health check endpoint

## Feature Module Structure

**Units Module:**
- Routes: `/units`, `/units/new`, `/units/[id]`, `/units/[id]/edit`
- Components: `src/components/units/`
- API: `src/lib/api.ts` → `getUnits()`, `getUnit()`, `createUnit()`, `updateUnit()`, `deleteUnit()`

**Tenants Module:**
- Routes: `/tenants`, `/tenants/new`, `/tenants/[id]`, `/tenants/[id]/edit`
- Components: `src/components/tenants/`, `src/components/tenant/`
- API: `src/lib/api.ts` → `getTenants()`, `getTenant()`, `createTenant()`, `updateTenant()`, `deleteTenant()`

**Leases Module:**
- Routes: `/leases`, `/leases/new`, `/leases/[id]`
- Components: `src/components/leases/`
- API: `src/lib/api.ts` → `getLeases()`, `getLease()`, `createLease()`, `updateLease()`, `deleteLease()`

**Rent/Payments Module:**
- Routes: `/rent`
- Components: `src/components/rent/`
- API: `src/lib/api.ts` → `getMonthRent()`, `generateRent()`, `markPaid()`

**Expenses Module:**
- Routes: `/expenses`, `/expenses/new`, `/expenses/[id]`, `/expenses/[id]/edit`
- Components: `src/components/expenses/`
- API: `src/lib/api.ts` → `getExpenses()`, `getExpense()`, `createExpense()`, `updateExpense()`, `deleteExpense()`

**Maintenance Module:**
- Routes: `/maintenance`, `/maintenance/new`, `/maintenance/[id]`, `/maintenance/[id]/edit`
- Components: `src/components/maintenance/`
- API: `src/lib/api.ts` → `getMaintenance()`, `getMaintenanceRequest()`, `createMaintenance()`, `updateMaintenance()`, `deleteMaintenance()`

## Naming Conventions

**Files:**
- PascalCase for React components: `AuthGuard.tsx`, `RevenueCard.tsx`
- lowercase for utilities/libraries: `api.ts`, `pocketbase.ts`, `utils.ts`
- lowercase with hyphens for routes: `page.tsx`, `layout.tsx`

**Directories:**
- lowercase with hyphens: `(dashboard)`, `tenant-portal`
- lowercase for feature modules: `components/units`, `components/tenants`

**Functions:**
- camelCase for API functions: `getUnits()`, `createUnit()`, `updateTenant()`
- PascalCase for React components: `DashboardPage()`, `Sidebar()`

**Variables:**
- camelCase for variables: `unit_counts`, `monthly_revenue` (API mapping)
- camelCase for React props: `unitNumber`, `tenantName`

## Import Organization

**Order:**
1. React imports (`import { useState } from 'react'`)
2. Third-party libraries (`import { useRouter } from 'next/navigation'`)
3. Local imports from `@/` path alias
4. Relative imports

**Path Aliases:**
- `@/lib/` - Service layer
- `@/components/` - Component library
- `@/types/` - Type definitions
- `@/app/` - App router pages

## Where to Add New Code

**New Feature Page:**
- Route: Add to `src/app/(dashboard)/<feature>/`
- Page: `src/app/(dashboard)/<feature>/page.tsx`
- Components: `src/components/<feature>/`
- API: Add to `src/lib/api.ts`

**New Component:**
- Feature-specific: `src/components/<feature>/<component>.tsx`
- Reusable UI: `src/components/ui/<component>.tsx`
- Layout: `src/components/layout/<component>.tsx`

**New Backend Router:**
- Route handler: `backend/app/routers/<feature>.py`
- Register in: `backend/app/main.py` → `app.include_router()`

**New Type:**
- Interface: `src/types/pocketbase.ts` (if PocketBase collection)
- Local types: Same file as component using them

## Special Directories

**`src/app/(dashboard)`:**
- Purpose: Route group with shared layout (parentheses exclude from URL)
- Generated: No
- Committed: Yes
- Note: All routes here require authentication via `AuthGuard`

**`src/components/ui`:**
- Purpose: Reusable UI primitives (buttons, cards, inputs, etc.)
- Generated: No
- Committed: Yes
- Note: Contains base components used across features

**`backend/app/routers`:**
- Purpose: FastAPI route handlers
- Generated: No
- Committed: Yes
- Note: Only automation/aggregation logic (not CRUD)

**`.planning/`:**
- Purpose: Project planning and documentation
- Generated: Yes (by GSD commands)
- Committed: Yes
- Note: Contains codebase analysis, implementation phases, research

## API Endpoint Structure

**Frontend API (`src/lib/api.ts`):**
- All functions are async
- Return typed interfaces (not raw PocketBase records)
- Handle status mapping and data transformation
- Use PocketBase SDK directly (not via FastAPI)

**Backend API (FastAPI):**
- Prefix: `/api/fastapi/`
- Endpoints:
  - `GET /api/fastapi/dashboard` - Aggregated dashboard data
  - `POST /api/fastapi/rent/generate` - Generate monthly payments
  - `POST /api/fastapi/rent/mark-overdue` - Mark overdue payments
  - `GET /api/fastapi/expenses/*` - Expense processing
  - `GET /api/fastapi/leases/*` - Lease operations
  - `GET /health` - Health check

## Module Dependencies

**Frontend → PocketBase:**
- Direct SDK usage via `src/lib/pocketbase.ts`
- All CRUD operations go through PocketBase

**Frontend → FastAPI:**
- Only for automation/aggregation
- Called via `fetch()` (not typed client)

**Backend → PocketBase:**
- HTTP client (`httpx`) calls PocketBase API
- Uses admin token for authenticated requests

**Component Dependencies:**
- Dashboard components depend on `src/lib/api.ts`
- All feature components depend on `src/lib/api.ts`
- Auth components depend on `src/lib/AuthProvider.tsx`

---

*Structure analysis: 2026-04-21*
