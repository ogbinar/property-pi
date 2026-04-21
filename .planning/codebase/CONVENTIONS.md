# Coding Conventions

**Analysis Date:** 2026-04-21

## Naming Patterns

**Files:**
- **kebab-case** for component files: `tenant-table.tsx`, `lease-form.tsx`, `expense-search.tsx`
- **Route files** follow Next.js App Router convention: `page.tsx`, `layout.tsx`, `[id]/page.tsx`, `new/page.tsx`, `edit/page.tsx`
- **UI components** in `src/components/ui/`: `button.tsx`, `input.tsx`, `card.tsx`, `modal.tsx`, `badge.tsx`, `select.tsx`, `textarea.tsx`, `table.tsx`, `empty-state.tsx`
- **Feature components** organized by domain: `src/components/tenants/`, `src/components/leases/`, `src/components/units/`, `src/components/expenses/`, `src/components/maintenance/`, `src/components/rent/`, `src/components/dashboard/`, `src/components/auth/`, `src/components/layout/`
- **Library files** in `src/lib/`: `api.ts`, `pocketbase.ts`, `utils.ts`, `AuthProvider.tsx`
- **Type definitions** in `src/types/`: `pocketbase.ts`

**Functions:**
- camelCase for functions: `getUnits`, `getTenants`, `createUnit`, `updateTenant`, `getStatusMap`, `mapUnit`, `mapTenant`
- Named exports for components: `export function Sidebar()`, `export function TenantTable()`, `export const Button = forwardRef(...)`
- API functions return typed data: `Promise<UnitWithRelations[]>`, `Promise<Tenant>`

**Variables:**
- camelCase for variables: `pathname`, `isOpen`, `deleteId`, `unitCounts`, `occupancyRate`
- Interface names use PascalCase: `Unit`, `Tenant`, `Lease`, `Payment`, `Expense`, `MaintenanceRequest`, `Dashboard`
- Record types from PocketBase: `UnitRecord`, `TenantRecord`, `LeaseRecord`, `PaymentRecord`, `ExpenseRecord`, `MaintenanceRecord`

**Types:**
- Interface preferred over type for data contracts
- Type alias used for Zod inference (not present - no Zod in current codebase)
- Generic types: `Record<string, number>`, `Promise<T>`, `React.ReactNode`

## Code Style

**Formatting:**
- No Prettier configuration — formatting handled by ESLint and/or editor preferences
- **2-space indentation** used consistently across all files
- **Semicolons omitted** — trailing commas used for multi-line statements
- **Single quotes** for strings: `'use client'`, `'http://localhost:8090'`, `'occupied'`, `'PAID'`
- **Double quotes** avoided in source code

**Linting:**
- **ESLint** configured via `eslint.config.mjs`
- Uses `eslint-config-next` presets:
  - `nextVitals` — Core Web Vitals optimization rules
  - `nextTs` — TypeScript-specific rules
- Default ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- No custom rules beyond Next.js defaults

**Component Style:**
- `'use client'` directive at top of client components
- All components use **named exports**: `export function ComponentName()`
- **forwardRef** pattern for UI components with `displayName` set:
  ```typescript
  export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => { ... }
  )
  Button.displayName = 'Button'
  ```

## Import Organization

**Order:**
1. React/Next.js framework imports: `import { useState } from 'react'`, `import Link from 'next/link'`
2. Third-party library imports: `import { cva } from 'class-variance-authority'`, `import PocketBase from 'pocketbase'`
3. Local component imports: `import { Badge } from '@/components/ui/badge'`
4. Utility/library imports: `import { cn } from '@/lib/utils'`, `import pb from '@/lib/pocketbase'`

**Path Aliases:**
- `@/` → `src/` configured in Next.js
- Examples: `@/lib/utils`, `@/components/ui/button`, `@/types/pocketbase`

**Import Patterns:**
- Named imports preferred: `import { useState, useEffect } from 'react'`
- Default imports for libraries: `import PocketBase from 'pocketbase'`
- Type imports: `import type { UnitRecord } from '@/types/pocketbase'`

## Error Handling

**Patterns:**
- **console.error** for client-side errors (no error logging library):
  ```typescript
  console.error('Failed to fetch units:', error)
  ```
- **Try/catch** blocks in async functions
- **Error state** in components: `const [error, setError] = useState<string | null>(null)`
- **Throw errors** for critical failures: `throw new Error('Unit not found')`
- **Optional chaining** for nullable values: `u.type || ''`, `t.phone || null`

**Missing Patterns:**
- No global error boundary component
- No error logging service (Sentry, LogRocket, etc.)
- No structured error types or custom error classes
- API error responses not standardized (no API routes in current implementation)

## Logging

**Framework:** `console` only — no logging library

**Patterns:**
- `console.error()` used for error debugging in data fetching
- No `console.log()` in production code
- No logging for user actions or system events
- No structured logging format

**Locations:**
- `src/components/dashboard/unit-status-grid.tsx:57` — fetch errors
- `src/app/(dashboard)/tenants/[id]/page.tsx:90` — load errors
- `src/app/(dashboard)/rent/page.tsx` — form submission errors

## Comments

**When to Comment:**
- Minimal comments found in codebase
- No inline comments explaining complex logic
- No JSDoc comments on functions or components

**JSDoc/TSDoc:**
- Not used — types serve as documentation
- Interface definitions provide self-documenting API contracts
- No `/** */` block comments found

## Function Design

**Size:**
- Functions vary widely in size
- **Small helper functions**: `getStatusMap()` — 15 lines
- **Large API functions**: `getDashboard()` — 100+ lines (fetches and computes multiple data sources)
- **Component functions**: 30-100 lines typically

**Parameters:**
- Function parameters use destructuring where appropriate
- Optional parameters with default values: `filters?: { category?: string }`
- Interface-based parameters for complex data: `createUnit(data: CreateUnitData)`

**Return Values:**
- Consistent return types: `Promise<T>` for async functions
- Early returns for edge cases: `if (!u) throw new Error(...)`
- Mapped data patterns: PocketBase records mapped to interface types

## Module Design

**Exports:**
- Named exports only — no default exports in library files
- Example: `export async function getUnits()`, `export interface Unit`, `export type UnitWithRelations`

**Barrel Files:**
- **No index.ts barrel files** — imports use direct paths
- Example: `import { Button } from '@/components/ui/button'` not `import { Button } from '@/components/ui'`

**Data Access Layer:**
- `src/lib/api.ts` — central API client with all data operations
- `src/lib/pocketbase.ts` — PocketBase SDK singleton
- All data fetching goes through `api.ts` functions
- Consistent mapping from PocketBase records to domain types

**State Management:**
- React Context for auth state: `AuthProvider.tsx`
- Local component state with `useState`
- No global state management library (Redux, Zustand, Jotai)
- No server state caching library (React Query, SWR)

## UI Component Patterns

**Component Libraries:**
- **lucide-react** — icon library: `import { Building2, Users, Menu } from 'lucide-react'`
- **class-variance-authority** — variant management: `buttonVariants = cva(...)`
- **clsx + tailwind-merge** — conditional classes: `cn(...inputs)`
- **sonner** — toast notifications: `<Toaster position="top-right" />`

**Styling:**
- **Tailwind CSS v4** — utility-first CSS framework
- **Dark mode** supported via `dark:` prefix throughout
- No CSS modules or styled-components
- No custom CSS files except `globals.css` for base styles

**Form Handling:**
- **react-hook-form** — form state management (imported but usage not seen in analyzed files)
- **zod** — schema validation (imported but no schema definitions found in current codebase)
- Forms use controlled components with `useState`

## Data Conventions

**Status Values:**
- PocketBase stores **lowercase**: `'occupied'`, `'active'`, `'pending'`
- UI displays **uppercase** convention: `'OCCUPIED'`, `'ACTIVE'`, `'PENDING'`
- `getStatusMap()` function handles conversion in `src/lib/api.ts`

**Date Handling:**
- ISO string format: `YYYY-MM-DD` for dates
- `createdAt`, `updatedAt` from PocketBase
- Client-side date manipulation with native `Date` object

**Null vs Empty:**
- `null` for optional/missing values: `phone: string | null`
- Empty string `''` for required but empty fields
- Consistent fallbacks: `u.type || ''`, `t.phone || null`

---

*Convention analysis: 2026-04-21*
