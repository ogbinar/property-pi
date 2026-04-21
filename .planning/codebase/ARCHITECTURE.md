# Architecture

**Analysis Date:** 2026-04-21

## Pattern Overview

**Overall:** Next.js 16 App Router with React 19 Client-Side SPA pattern

**Key Characteristics:**
- Next.js App Router with route groups (`(dashboard)`)
- Client-side rendering for all interactive pages (`'use client'`)
- PocketBase as backend database and authentication service
- Component-driven UI with shared design system
- TypeScript-first development with strict typing

## Layers

**Presentation Layer:**
- Purpose: User interface and user experience
- Location: `src/components/`, `src/app/`
- Contains: React components, page layouts, UI primitives
- Depends on: Type definitions from `src/types/`
- Used by: All user-facing routes

**Application Layer:**
- Purpose: Business logic and data orchestration
- Location: `src/lib/api.ts`, `src/lib/AuthProvider.tsx`
- Contains: API functions, authentication context, data mapping
- Depends on: PocketBase SDK (`src/lib/pocketbase.ts`)
- Used by: All page components

**Data Layer:**
- Purpose: Type definitions and data contracts
- Location: `src/types/pocketbase.ts`
- Contains: TypeScript interfaces for database records
- Depends on: None (pure type definitions)
- Used by: API layer and components

## Data Flow

**Page Load Flow:**

1. User navigates to route → Next.js App Router matches route
2. Layout components render (Sidebar, Header, AuthGuard)
3. AuthGuard checks PocketBase auth store validity
4. If unauthenticated → redirect to `/login`
5. Page component mounts with `'use client'` directive
6. `useEffect` triggers data fetch from PocketBase via `src/lib/api.ts`
7. API layer transforms PocketBase records to expected format
8. Component state updates → UI re-renders

**Authentication Flow:**

1. User enters credentials on `/login` page
2. `useAuth().signIn()` calls PocketBase `authWithPassword()`
3. PocketBase SDK stores token in `authStore`
4. `AuthProvider` listens to `authStore.onChange`
5. Context updates → protected routes re-render
6. `AuthGuard` allows access to protected pages

**State Management:**

- Global auth state: React Context via `AuthProvider`
- Page-level state: React `useState` hooks
- Server state: PocketBase database (no React Query/SWR)
- URL state: Search params via `useSearchParams()`

## Key Abstractions

**PocketBase Abstraction:**
- Purpose: Hide PocketBase SDK complexity behind typed API functions
- Examples: `src/lib/api.ts` (922 lines)
- Pattern: Repository pattern with data mapping layer
- All CRUD operations centralized in single file

**UI Component Abstraction:**
- Purpose: Provide consistent design system
- Examples: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`
- Pattern: Compound components with CVA (class-variance-authority)
- Tailwind CSS for styling

**Route Group Abstraction:**
- Purpose: Separate public vs authenticated routes
- Examples: `src/app/(dashboard)/`, `src/app/login/`
- Pattern: Next.js route groups with shared layout

## Entry Points

**Application Root:**
- Location: `src/app/layout.tsx`
- Triggers: Initial page load
- Responsibilities: Root HTML structure, font loading, global providers (AuthProvider, Toaster)

**Dashboard Layout:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Any authenticated route
- Responsibilities: Sidebar navigation, header, AuthGuard wrapper

**Login Page:**
- Location: `src/app/login/page.tsx`
- Triggers: Unauthenticated access or manual login
- Responsibilities: Credential form, redirect on success

**Feature Pages:**
- Location: `src/app/(dashboard)/*`
- Examples: `src/app/(dashboard)/units/page.tsx`, `src/app/(dashboard)/tenants/page.tsx`
- Triggers: Navigation to feature routes
- Responsibilities: Feature-specific data fetching and rendering

## Error Handling

**Strategy:** Try-catch in async functions with user-facing error states

**Patterns:**
- API functions throw errors → caught by page components
- Pages display error banners with retry buttons
- Loading states with skeleton placeholders during fetch
- Empty states when no data available

**Example Pattern (from `src/app/(dashboard)/units/page.tsx`):**
```typescript
try {
  const data = await getUnits(search || undefined)
  setUnits(data)
  setError(null)
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error')
}
```

## Cross-Cutting Concerns

**Logging:** Console only (no dedicated logging framework)

**Validation:** Form-level validation via HTML5 constraints (no Zod/Yup at form level)

**Authentication:** PocketBase auth store with React Context wrapper
- `AuthProvider` manages session state
- `AuthGuard` component protects routes
- `useAuth()` hook provides access to auth state

**Styling:** Tailwind CSS v4 with dark mode support
- Custom component classes via `class-variance-authority`
- Utility-first approach
- Dark mode via `dark:` prefix

**Routing:** Next.js App Router with file-based routing
- Route groups: `(dashboard)` for authenticated section
- Dynamic routes: `[id]` for resource detail pages
- Nested routes: `[id]/edit` for nested actions

## Data Mapping Strategy

**PocketBase to Frontend Mapping:**
- PocketBase uses camelCase (`firstName`, `startDate`)
- Frontend expects snake_case (`first_name`, `start_date`)
- `src/lib/api.ts` handles transformation in all CRUD functions
- `getStatusMap()` normalizes status values across collections

**Relations Handling:**
- PocketBase stores relation IDs (e.g., `unit: "abc123"`)
- Frontend expects nested objects (e.g., `unit: { id, unit_number }`)
- Current implementation: relations not pre-loaded (client-side only)
- `UnitWithRelations` interface defines expected shape but relations are `null`

---

*Architecture analysis: 2026-04-21*
