# Technology Stack

**Project:** Property-Pi
**Researched:** 2026-04-21
**Confidence:** HIGH

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.4 | Frontend framework (App Router) | Already installed; App Router with `'use client'`/`'use server'` directives is the project's established pattern. Preserves existing UI. |
| React | 19.2.4 | UI library | Already installed; drives the existing component hierarchy. |
| PocketBase | 0.37.2 | Backend (auth + database + storage) | Official latest release. Replaces Prisma + PostgreSQL + NextAuth with a single binary. Built-in admin panel, email/password auth, SQLite DB, file storage. |

### PocketBase Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| pocketbase (JS SDK) | 0.26.8 | TypeScript client for PocketBase API | Official SDK. Works in browser and Node.js. Provides `authWithPassword`, `getList`, `create`, `update`, `files` API. |

### Styling & UI (existing, preserved)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first CSS | Already built; uses `@tailwindcss/postcss` plugin. Preserved as-is. |
| class-variance-authority | ^0.7.1 | Component variants | Already built. |
| clsx | ^2.1.1 | Conditional class merging | Already built. |
| tailwind-merge | ^3.5.0 | Resolve class conflicts | Already built. |
| lucide-react | ^1.8.0 | Icons | Already built; used in sidebar. |
| sonner | ^2.0.7 | Toast notifications | Already built. |
| recharts | ^3.8.1 | Charting | Already built; not heavily used yet. |

### Form & Validation (existing, preserved)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-hook-form | ^7.72.1 | Form state | Already built; drives all form components. |
| @hookform/resolvers | ^5.2.1 | Schema validation bridge | Already built; connects Zod → react-hook-form. |
| zod | ^4.3.6 | Schema validation | Already built; used in API routes for validation. |
| date-fns | ^4.1.0 | Date manipulation | Already built; used for month calculations. |

### Runtime & Tooling (existing, preserved)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TypeScript | ^5 | Type safety | Already configured; strict mode, `@/*` path alias. |
| esbuild | (bundled) | Build | Already bundled with Next.js. |
| tsx | ^4.21.0 | TS execution | Used for seed script. |
| eslint | ^9 | Linting | Already configured with `eslint-config-next`. |

---

## What to Remove

These are being stripped as part of the PocketBase migration:

| Package | Reason |
|---------|--------|
| `next-auth` | Replaced by PocketBase auth |
| `@prisma/client` | Replaced by PocketBase JS SDK |
| `@prisma/adapter-pg` | Replaced — no more PostgreSQL |
| `prisma` | Replaced by PocketBase schema |
| `pg` | Replaced — no more PostgreSQL driver |
| `bcryptjs` | Replaced by PocketBase's built-in password hashing |
| `backend/` directory | Entire Python FastAPI backend removed from v1 |

---

## PocketBase Integration Pattern

### Critical Architecture Decision: Client-Side Auth, Not SSR

PocketBase's official documentation **explicitly discourages SSR integration** with JS frameworks. The documented approach for Next.js is:

**Do NOT use PocketBase on the server.** Instead:

1. Create a single `PocketBase` instance in a React context provider
2. Store it in `localStorage` cookie (via `authStore.exportToCookie` / `loadFromCookie`)
3. All PocketBase calls happen from client components or Server Actions

This means:
- No `pb` instance in `middleware.ts` or `layout.tsx`
- No `authStore.loadFromCookie()` in server context
- Auth state lives in browser cookies (`pb_auth`)
- Server Actions use the browser-authenticated client via `fetch` or revalidate cache

### Auth Flow

```typescript
// src/lib/pocketbase.ts — singleton client
import PocketBase from 'pocketbase'

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!)

export default pb

// src/providers/pocketbase-provider.tsx — context + cookie sync
'use client'
import { createContext, useEffect } from 'react'
import pb from '@/lib/pocketbase'

const PocketBaseContext = createContext(pb)

export function PocketBaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sync PocketBase auth store on mount
    pb.authStore.loadFromCookie(document.cookie)
  }, [])

  return (
    <PocketBaseContext.Provider value={pb}>
      {children}
    </PocketBaseContext.Provider>
  )
}
```

### Server Actions Pattern

```typescript
// src/app/api/units/route.ts → replaced by Server Actions
'use server'

import pb from '@/lib/pocketbase'
import { revalidatePath } from 'next/cache'

export async function createUnit(data: FormData) {
  // Auth comes from browser cookies automatically
  // Server actions run with the authenticated user's cookie
  const result = await pb.collection('units').create(data)
  revalidatePath('/dashboard')
  return result
}
```

---

## Deployment Stack

| Service | Platform | Cost | Why |
|---------|----------|------|-----|
| Next.js | Vercel | Free tier | Zero-config Next.js deployment. Preserves existing build pipeline. |
| PocketBase | fly.io or Railway | ~$5/mo | Single binary, SQLite-backed. fly.io has a free tier with $5 credits. Railway has free tier with generous limits. |
| File Storage | PocketBase local filesystem | Included | PocketBase stores files on local disk. No S3 needed for 5-unit scale. |

---

## PocketBase Schema Mapping

The existing Prisma schema (9 models) maps to PocketBase collections:

| Prisma Model | PocketBase Collection | Field Type Notes |
|--------------|----------------------|-----------------|
| User | `users` (built-in) | Email/password, use `authWithPassword` |
| Unit | `units` | text, number, relation → User |
| Tenant | `tenants` | text, email, phone, relation → User |
| Lease | `leases` | date, json, relation → Unit, Tenant |
| Payment | `payments` | date, number, relation → Tenant, Lease |
| Expense | `expenses` | date, number, text, relation → Unit |
| MaintenanceRequest | `maintenance_requests` | text, json, relation → Unit |
| RentAdjustment | `rent_adjustments` | date, number, relation → Unit |
| ContactLog | `contact_logs` | date, text, json, relation → Tenant |
| Notice | `notices` | date, text, relation → Tenant |

PocketBase auto-generates `pb_created` and `pb_updated` timestamp fields. The `_superusers` collection handles landlord admin auth.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| PocketBase SDK | pocketbase 0.26.8 | @pocketbase/sdk | pocketbase is the official SDK; same thing. |
| PocketBase backend | PocketBase 0.37.2 | Supabase | Supabase adds complexity (Postgres, separate hosting) for what PocketBase handles natively. |
| PocketBase backend | PocketBase 0.37.2 | Custom Next.js API routes | Next.js API routes would require building auth, DB, file storage from scratch. PocketBase provides all three. |
| Auth | PocketBase auth via browser cookies | Server-side PocketBase instance in middleware | PocketBase docs explicitly warn against SSR integration; browser cookie approach is the supported pattern. |
| Auth | PocketBase auth via browser cookies | NextAuth v4 (existing) | NextAuth requires Prisma provider; PocketBase has no NextAuth adapter. Browser cookie auth is cleaner for this architecture. |
| DB | PocketBase SQLite | PostgreSQL (existing) | PocketBase uses SQLite natively. Switching would require maintaining a separate DB + migration. |

---

## Installation

```bash
# PocketBase JS SDK
npm install pocketbase@0.26.8

# Remove old stack
npm uninstall next-auth @prisma/client @prisma/adapter-pg prisma pg bcryptjs

# Dev dependencies (unchanged)
npm install -D typescript @types/node eslint eslint-config-next
```

### Environment Variables

```env
# .env
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090

# Production
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase.fly.dev
```

---

## Sources

- **PocketBase JS SDK** — https://github.com/pocketbase/js-sdk (Context7, v0.26.8)
- **PocketBase latest release** — v0.37.2 (GitHub releases, verified 2026-04-21)
- **PocketBase SSR guidance** — Official docs explicitly discourage SSR integration with JS frameworks (Context7, pocketbase.io)
- **PocketBase auth cookie pattern** — `authStore.loadFromCookie()` / `exportToCookie()` documented in SDK README
- **Next.js 16.2.4** — confirmed latest stable release (GitHub releases, verified 2026-04-21)
- **Next.js App Router patterns** — Context7 official docs, server actions with `refresh()` cache invalidation
