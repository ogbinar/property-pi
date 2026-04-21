# Architecture

**Analysis Date:** 2026-04-21

## Pattern Overview

**Overall:** Full-stack property management application with Next.js frontend and FastAPI backend

**Key Characteristics:**
- Client-side rendering with PocketBase as primary data store
- FastAPI backend provides automation/aggregation services only (not CRUD)
- Feature-based component organization matching routing structure
- Context-based authentication with React Context API

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Next.js)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  App Router (src/app)                                 │  │
│  │  ├── (dashboard) - Protected routes with sidebar      │  │
│  │  ├── login - Authentication entry point              │  │
│  │  └── tenant/portal - Tenant-facing portal            │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Components (src/components)                          │  │
│  │  ├── Feature-specific (units, tenants, leases, etc.) │  │
│  │  ├── Layout (sidebar, header)                        │  │
│  │  └── UI (reusable primitives)                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Services (src/lib)                                   │  │
│  │  ├── api.ts - PocketBase CRUD operations             │  │
│  │  ├── pocketbase.ts - SDK configuration               │  │
│  │  └── AuthProvider.tsx - Auth context                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (FastAPI)                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Routers (backend/app/routers)                        │  │
│  │  ├── dashboard.py - Aggregation from PocketBase      │  │
│  │  ├── rent.py - Payment generation/automation         │  │
│  │  ├── expenses.py - Expense processing                │  │
│  │  ├── leases.py - Lease operations                    │  │
│  │  └── health.py - Health check                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Store (PocketBase)                        │
│  Collections: units, tenants, leases, payments, expenses,   │
│              maintenance, users                             │
└─────────────────────────────────────────────────────────────┘
```

## Layers

**Presentation Layer:**
- Purpose: UI rendering and user interaction
- Location: `src/app`, `src/components`
- Contains: React components, page layouts, routing
- Depends on: Services layer (API calls), AuthProvider
- Used by: Browser/NEXT.js runtime

**Application Layer (Frontend):**
- Purpose: Business logic and data orchestration
- Location: `src/lib/api.ts`, `src/lib/AuthProvider.tsx`
- Contains: API functions, authentication logic, data transformation
- Depends on: PocketBase SDK
- Used by: React components

**Backend Service Layer:**
- Purpose: Automation and aggregation services
- Location: `backend/app/routers`
- Contains: FastAPI route handlers, business logic for automation
- Depends on: PocketBase HTTP API, httpx
- Used by: Frontend (via REST calls)

**Data Layer:**
- Purpose: Persistent storage and retrieval
- Location: PocketBase instance (external)
- Contains: Collections (units, tenants, leases, payments, expenses, maintenance)
- Depends on: None (self-contained)
- Used by: Both frontend (direct) and backend (via HTTP)

## Data Flow

**Dashboard Data Flow:**

1. User navigates to dashboard (`/`)
2. `DashboardPage` component mounts
3. `getDashboard()` called from `src/lib/api.ts`
4. Function fetches all collections from PocketBase directly:
   - Units, payments, expenses, leases
5. Client-side aggregation computes metrics
6. Data transformed to component format
7. UI renders with computed values

**Authentication Flow:**

1. User lands on `/` → redirects to `/login`
2. `LoginPage` uses `useAuth()` hook
3. User submits credentials
4. `signIn()` calls `pb.collection('users').authWithPassword()`
5. PocketBase SDK stores auth token in `authStore`
6. `AuthProvider` context updates `user` state
7. User redirected to dashboard
8. `AuthGuard` validates session on protected routes

**Rent Generation Flow:**

1. User triggers "Generate Rent" action
2. Frontend calls `POST /api/fastapi/rent/generate`
3. FastAPI router fetches active leases from PocketBase
4. For each lease, creates payment record via PocketBase API
5. Returns list of created payments

## Key Abstractions

**Collection Abstraction:**
- Purpose: Maps PocketBase collections to typed interfaces
- Examples: `src/types/pocketbase.ts`
- Pattern: TypeScript interfaces for each collection (UnitRecord, TenantRecord, etc.)

**API Service Abstraction:**
- Purpose: Encapsulates all data operations with consistent naming
- Examples: `src/lib/api.ts`
- Pattern: 
  - `getEntities()` - list all/fetch filtered
  - `getEntity(id)` - fetch single
  - `createEntity(data)` - create new
  - `updateEntity(id, data)` - update existing
  - `deleteEntity(id)` - remove
  - Raw functions (`getUnitsRaw()`) for direct SDK access

**Status Mapping:**
- Purpose: Translates PocketBase lowercase status values to legacy uppercase convention
- Examples: `src/lib/api.ts` → `getStatusMap()` function
- Pattern: Centralized mapping handles inconsistencies between old/new conventions

## Entry Points

**Application Entry:**
- Location: `src/app/page.tsx`
- Triggers: Root URL access
- Responsibilities: Redirects to `/login`

**Login Entry:**
- Location: `src/app/login/page.tsx`
- Triggers: Unauthenticated access or explicit navigation
- Responsibilities: Form handling, authentication via `useAuth()`

**Dashboard Entry:**
- Location: `src/app/(dashboard)/page.tsx`
- Triggers: Authenticated user navigation
- Responsibilities: Fetches dashboard data, renders metrics

**Backend Entry:**
- Location: `backend/app/main.py`
- Triggers: HTTP requests to FastAPI server
- Responsibilities: CORS setup, rate limiting, router registration

## Error Handling

**Strategy:** Client-side try/catch with user-facing error messages

**Patterns:**
- API functions throw errors via `throw new Error()`
- Components catch errors in try/catch blocks
- Error state stored in component state
- User-facing error display in UI
- Auth errors redirect to login

**Example (Dashboard):**
```typescript
try {
  const dashboardData = await getDashboard()
  setData(dashboardData)
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error')
}
```

## Cross-Cutting Concerns

**Logging:**
- Approach: None formalized (console errors only)

**Validation:**
- Approach: Client-side HTML5 validation on forms
- Type safety via TypeScript interfaces

**Authentication:**
- Approach: PocketBase JWT-based auth
- Implementation: 
  - `AuthProvider` manages auth state via context
  - `AuthGuard` component protects routes
  - Auth changes tracked via `pb.authStore.onChange()`

**Rate Limiting:**
- Approach: FastAPI backend uses `slowapi`
- Configuration: 100 requests/hour per IP (default)

## State Management

**Approach:** React Context API for global state

**Global State:**
- Authentication state (`AuthProvider`)
  - `user`: Current user object or null
  - `isLoading`: Authentication loading state

**Local State:**
- Component-level state via `useState`
- Server state via direct API calls on mount (`useEffect`)

**No:** Redux, Zustand, React Query, or other state management libraries

## Backend Architecture

**Router Pattern:**
- Location: `backend/app/routers/`
- Each router handles specific domain:
  - `dashboard.py`: Aggregation endpoint
  - `rent.py`: Payment automation
  - `expenses.py`: Expense processing
  - `leases.py`: Lease operations
  - `health.py`: Health check

**Backend Role:**
- Not a CRUD API (PocketBase handles CRUD)
- Provides automation/aggregation that requires:
  - Complex multi-collection queries
  - Scheduled/triggered operations
  - Cross-system coordination

---

*Architecture analysis: 2026-04-21*
