# Codebase Structure

**Analysis Date:** 2026-04-21

## Directory Layout

```
/projects/property-pi/
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── (dashboard)/          # Route group: authenticated pages
│   │   │   ├── layout.tsx        # Shared dashboard layout
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── units/            # Units management
│   │   │   ├── tenants/          # Tenants management
│   │   │   ├── leases/           # Leases management
│   │   │   ├── rent/             # Rent collection
│   │   │   ├── expenses/         # Expenses tracking
│   │   │   └── maintenance/      # Maintenance requests
│   │   ├── login/                # Public: authentication
│   │   ├── tenant/               # Tenant portal (partial)
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── components/               # React components
│   │   ├── ui/                   # Primitive UI components
│   │   ├── layout/               # Layout components
│   │   ├── auth/                 # Authentication components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   ├── units/                # Units feature components
│   │   ├── tenants/              # Tenants feature components
│   │   ├── leases/               # Leases feature components
│   │   ├── expenses/             # Expenses feature components
│   │   ├── maintenance/          # Maintenance feature components
│   │   └── rent/                 # Rent feature components
│   ├── lib/                      # Utility libraries
│   │   ├── api.ts                # PocketBase API client (922 lines)
│   │   ├── pocketbase.ts         # PocketBase SDK initialization
│   │   ├── AuthProvider.tsx      # Authentication context
│   │   ├── tenant-api.ts         # Tenant portal API
│   │   └── utils.ts              # Utility functions
│   └── types/                    # TypeScript type definitions
│       └── pocketbase.ts         # Database record interfaces
├── .planning/                    # Planning documents
│   ├── codebase/                 # Codebase analysis
│   ├── phases/                   # Implementation phases
│   └── intel/                    # Research notes
├── .env                          # Environment variables
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router file-based routing
- Contains: Page components, layouts, route groups
- Key files: `layout.tsx` (root), `(dashboard)/layout.tsx` (authenticated)

**`src/app/(dashboard)/`:**
- Purpose: Protected routes requiring authentication
- Contains: Feature pages for property management
- Route structure: `/units`, `/tenants`, `/leases`, `/expenses`, `/maintenance`, `/rent`
- All pages use `'use client'` directive for client-side rendering

**`src/app/login/`:**
- Purpose: Public authentication route
- Contains: Login page only
- No AuthGuard wrapper

**`src/components/ui/`:**
- Purpose: Reusable primitive components (design system)
- Contains: `button.tsx`, `input.tsx`, `select.tsx`, `card.tsx`, `table.tsx`, `modal.tsx`, `badge.tsx`, `empty-state.tsx`, `textarea.tsx`
- All use Tailwind CSS with CVA for variants

**`src/components/layout/`:**
- Purpose: Application-level layout components
- Contains: `sidebar.tsx` (navigation), `header.tsx` (top bar)
- Used by dashboard layout wrapper

**`src/components/auth/`:**
- Purpose: Authentication-related components
- Contains: `AuthGuard.tsx` (route protection)
- Used by dashboard layout to enforce authentication

**`src/components/*` (feature folders):**
- Purpose: Feature-specific components
- Examples: `src/components/units/unit-card.tsx`, `src/components/units/unit-form.tsx`
- Naming: `<feature>-<purpose>.tsx` (kebab-case)

**`src/lib/`:**
- Purpose: Business logic and external service integration
- Contains: API client, authentication provider, utilities
- Key file: `api.ts` (centralized data access layer)

**`src/types/`:**
- Purpose: TypeScript type definitions
- Contains: `pocketbase.ts` (database record interfaces)
- Pure type definitions, no runtime code

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with providers
- `src/app/page.tsx`: Landing page (redirects to dashboard or login)
- `src/app/login/page.tsx`: Authentication form

**Configuration:**
- `next.config.ts`: Next.js 16 configuration
- `tsconfig.json`: TypeScript 5 with `@/*` path alias to `src/`
- `package.json`: Dependencies (Next.js 16, React 19, PocketBase)

**Core Logic:**
- `src/lib/api.ts`: All data operations (CRUD for units, tenants, leases, payments, expenses, maintenance)
- `src/lib/AuthProvider.tsx`: Authentication context and hooks
- `src/lib/pocketbase.ts`: PocketBase client initialization

**Feature Pages:**
- `src/app/(dashboard)/units/page.tsx`: Units listing with search/filter
- `src/app/(dashboard)/units/new/`: Unit creation form
- `src/app/(dashboard)/units/[id]/page.tsx`: Unit detail view
- `src/app/(dashboard)/units/[id]/edit/`: Unit edit form

**Pattern across features:**
```
src/app/(dashboard)/<feature>/
├── page.tsx              # List view
├── new/
│   └── page.tsx          # Create form
└── [id]/
    ├── page.tsx          # Detail view
    └── edit/
        └── page.tsx      # Edit form
```

## Naming Conventions

**Files:**
- Components: kebab-case (`unit-card.tsx`, `auth-guard.tsx`)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- Utilities: camelCase (`utils.ts`, `api.ts`)
- Types: kebab-case (`pocketbase.ts`)

**Directories:**
- Feature folders: kebab-case (`user-profile`, `payment-processing`)
- Route groups: parentheses (`(dashboard)`)
- Dynamic routes: brackets (`[id]`, `[tenantId]`)

**Components:**
- PascalCase for component exports (`UnitCard`, `Sidebar`)
- Named exports only (no default exports in components)

## Where to Add New Code

**New Feature Page:**
- Primary code: `src/app/(dashboard)/<feature>/page.tsx`
- Tests: `<feature>.test.tsx` (co-located or `__tests__/` subfolder)

**New Component:**
- UI primitive: `src/components/ui/<component>.tsx`
- Feature component: `src/components/<feature>/<component>.tsx`
- Layout component: `src/components/layout/<component>.tsx`

**New API Function:**
- Add to `src/lib/api.ts` (centralized)
- Add type to `src/types/pocketbase.ts` if new record type

**New Route:**
- Public route: `src/app/<route>/page.tsx`
- Protected route: `src/app/(dashboard)/<route>/page.tsx`

## Special Directories

**`(dashboard)` Route Group:**
- Purpose: Share layout and auth requirement across authenticated routes
- Generated: No
- Committed: Yes
- Note: Folder name in parentheses doesn't appear in URL

**`[id]` Dynamic Routes:**
- Purpose: Resource detail pages with URL parameter
- Example: `/units/abc123` → `src/app/(dashboard)/units/[id]/page.tsx`
- Access parameter via `useParams()` hook

**`.planning/`:**
- Purpose: GSD workflow documents
- Generated: Yes (by agents)
- Committed: Yes (for phase continuity)
- Subfolders: `codebase/`, `phases/`, `intel/`

**`src/components/ui/`:**
- Purpose: Shared design system primitives
- Generated: No
- Committed: Yes
- Note: Should be framework-agnostic, reusable across features

## Module Boundaries

**Strict Boundaries:**
- `src/types/` → Pure types, no imports from other modules
- `src/lib/pocketbase.ts` → Only PocketBase SDK initialization
- `src/lib/api.ts` → Only data access, no React components
- `src/lib/AuthProvider.tsx` → Only auth context, imports from `lib/`

**Flexible Boundaries:**
- `src/components/` → Can import from `lib/`, `types/`, other components
- `src/app/` → Can import from `components/`, `lib/`, `types/`

**Import Path Convention:**
- Use path alias: `@/lib/api`, `@/components/ui/button`
- Relative imports only within same folder

## Component Hierarchy

**Dashboard Page Structure:**
```
DashboardLayout (src/app/(dashboard)/layout.tsx)
├── Sidebar (src/components/layout/sidebar.tsx)
└── Main Content
    ├── Header (src/components/layout/header.tsx)
    └── Page Component (e.g., src/app/(dashboard)/units/page.tsx)
        ├── Feature Component (e.g., UnitCard)
        └── UI Primitives (Button, Input, Table, etc.)
```

**Authentication Flow:**
```
RootLayout (src/app/layout.tsx)
└── AuthProvider (src/lib/AuthProvider.tsx)
    └── AuthGuard (src/components/auth/AuthGuard.tsx)
        └── Dashboard Content
```

---

*Structure analysis: 2026-04-21*
