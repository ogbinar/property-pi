# Architecture Research — PocketBase + Next.js Rental Property Management

**Domain:** Lightweight rental property management (≤5 units)
**Researched:** 2026-04-21
**Confidence:** HIGH

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐│
│  │  Dashboard   │  │  Unit Detail │  │  Tenant / Lease /     ││
│  │  (landing)   │  │  & Forms     │  │  Expense Pages         ││
│  └──────┬───────┘  └──────┬───────┘  └──────────┬─────────────┘│
│         │                │                      │              │
│  ┌──────┴────────────────┴──────────────────────┴──────────┐  │
│  │  PocketBase JS SDK client (src/lib/pocketbase.ts)        │  │
│  │  - authStore (token + record session)                     │  │
│  │  - typed collection wrappers                              │  │
│  └─────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              POCKETBASE BACKEND (fly.io)                   │ │
│  │                                                           │ │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────┐ │ │
│  │  │  Auth    │  │  Collections│ │  Storage │  │ JSVM    │ │ │
│  │  │  (users) │  │  (base)    │  │  (files) │  │ Hooks   │ │ │
│  │  └──────────┘  └───────────┘  └──────────┘  └─────────┘ │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  SQLite Database (embedded)                          │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              POCKETBASE ADMIN PANEL                        │ │
│  │  (accessible at /admin on the PocketBase host)             │ │
│  │  Landlord uses this for data management, not the Next.js   │ │
│  │  UI — acts as a powerful CRUD admin + data inspector.      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### PocketBase Collection Structure (Mapping from Prisma Schema)

The Prisma schema has **9 models**. PocketBase maps to **6 base collections** + **1 auth collection** = **7 collections**. `RentAdjustment` and `ContactLog` become embedded JSON fields (see "Why" below).

| Prisma Model | PocketBase Collection | Type | Field Mapping Notes |
|--------------|----------------------|------|---------------------|
| **User** | `users` | auth | Built-in auth collection. `email` (identity), `password` (hashed), `name` (text), `role` (select: LANDLORD/MANAGER). PocketBase auto-provides `id`, `created`, `updated`. |
| **Unit** | `units` | base | `unitNumber` (text, unique), `type` (text), `status` (select: OCCUPIED/VACANT/MAINTENANCE/UNDER_RENOVATION), `rentAmount` (number), `securityDeposit` (number) |
| **Tenant** | `tenants` | base | `firstName`, `lastName` (text), `email` (email, unique), `phone` (text), `emergencyContact` (text), `unitId` (relation → units) |
| **Lease** | `leases` | base | `startDate`, `endDate` (date), `rentAmount` (number), `status` (select), `tenantId` (relation → tenants), `unitId` (relation → units), `documents` (**replaces `String[]` with file field**) |
| **Payment** | `payments` | base | `amount` (number), `date` (date), `method` (text), `status` (select), `dueDate` (date), `unitId` (relation → units), `leaseId` (relation → leases, nullable) |
| **Expense** | `expenses` | base | `amount` (number), `category` (text), `description` (text), `date` (date), `receiptUrl` (**replaced with file field**), `unitId` (relation → units, nullable) |
| **MaintenanceRequest** | `maintenance` | base | `title` (text), `description` (editor), `priority` (select: LOW/MEDIUM/HIGH/EMERGENCY), `status` (select: REPORTED/IN_PROGRESS/COMPLETED), `cost` (number, nullable), `unitId` (relation → units) |
| **RentAdjustment** | → **embedded in `units` as `rentHistory`** | — | JSON field on `units`. Array of `{ oldRentAmount, newRentAmount, reason, effectiveDate }`. No separate collection needed for ≤5 units. |
| **ContactLog** | → **embedded in `tenants` as `contactLog`** | — | JSON field on `tenants`. Array of `{ type, subject, notes, date }`. No separate collection needed for ≤5 units. |
| **Notice** | `notices` | base | `type` (select), `title` (text), `content` (editor), `sentAt` (date, nullable), `deliveredAt` (date, nullable), `unitId` (relation → units) |

#### Key Schema Changes from Prisma → PocketBase

1. **`String[] documents` → `file` field**: PocketBase doesn't have a native "string array" type. Lease documents and expense receipts become actual file uploads stored in PocketBase's file storage.
2. **`RentAdjustment` & `ContactLog` → JSON fields**: These are append-only logs tied to single parent records. For a ≤5 unit portfolio, separate collections add complexity without benefit. They become JSON arrays on their parent records (`units.rentHistory`, `tenants.contactLog`).
3. **`decimal` → PocketBase `number`**: PocketBase stores numbers as 64-bit IEEE 754 floats. For currency, this means **storing as centavos (integers)** rather than decimal values to avoid floating-point rounding issues.
4. **`enum` types → PocketBase `select` fields**: PocketBase select fields accept single values or multiple values (via `multiple: true`). All Prisma enums map directly.
5. **`@default(now())` → `autodate`**: PocketBase's `autodate` field type auto-manages `created` and `updated` timestamps.

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **PocketBase Auth (`users`)** | Email/password authentication, session tokens | Next.js frontend (via SDK) |
| **`units` collection** | Unit master data, rent tracking, embedded rent history | Dashboard, unit detail pages |
| **`tenants` collection** | Tenant records, embedded contact logs | Tenant pages, lease forms |
| **`leases` collection** | Lease records, tenant/unit relationships, documents | Lease pages, tenant portal |
| **`payments` collection** | Rent payment records, status tracking | Rent dashboard, unit detail |
| **`expenses` collection** | Expense records, file receipts | Expense pages, dashboard |
| **`maintenance` collection** | Maintenance requests, priority/status | Maintenance pages, unit detail |
| **`notices` collection** | Notice records (maintenance, rent increase, etc.) | Notice pages, tenant portal |
| **PocketBase File Storage** | Lease documents, expense receipts | Lease pages, expense pages |
| **PocketBase Admin Panel** | Data inspection, record CRUD, analytics | Landlord (supplementary tool) |

---

## Data Flow

### Authentication Flow

```
User enters email/password
        ↓
Next.js Client → pb.collection('users').authWithPassword(email, password)
        ↓
PocketBase validates credentials, returns { token, record }
        ↓
pb.authStore.token saved to localStorage
        ↓
Next.js App Router layout checks pb.authStore.isValid
        ↓
Dashboard renders → all API calls include pb.authStore.token
```

**Key difference from NextAuth:** PocketBase token is stored in localStorage (not cookies). Every subsequent request to PocketBase includes the token automatically via the SDK's `setAuthCookieName`/`authStore` mechanism. No middleware needed on the frontend — the SDK attaches `Authorization: PocketBase <token>` headers.

### Dashboard Data Fetch (Server-Safe Pattern)

```
Next.js page component (client-side)
        ↓
useEffect → pb.collection('units').getFullList({ expand: 'tenants' })
        ↓
PocketBase SDK attaches auth token → POST /api/collections/units/records
        ↓
PocketBase evaluates listRule, returns JSON
        ↓
React state → component renders unit cards
```

**Critical:** Since PocketBase is a separate service (fly.io), all data fetches happen client-side via the JS SDK. This means:
- No Next.js `params`/`searchParams` server fetches for PocketBase data
- Auth-protected routes check `pb.authStore.isValid` in client-side effects
- Dashboard aggregates (rent collected, occupancy rate) computed client-side or via PocketBase JSVM hooks

### Form Submission Flow

```
User submits unit form (react-hook-form + Zod)
        ↓
Client validates with Zod schema
        ↓
pb.collection('units').update(id, { unitNumber: '1A', ... })
        ↓
PocketBase validates → listRule → saves to SQLite
        ↓
Returns updated record
        ↓
Client revalidates → toast success → refresh list
```

### Tenant Portal Flow (Shared Link)

```
Landlord creates notice/link → PocketBase generates token
        ↓
Tenant opens URL: /tenant/portal?token=xxx
        ↓
Next.js page validates token → pb.collection('leases').getFirstListItem(...)
        ↓
Displays lease info + maintenance request form
        ↓
Tenant submits → pb.collection('maintenance').create(...)
```

**No tenant accounts needed.** The shared link is the access mechanism. Token stored in URL query param, validated client-side.

---

## Build Order (Phase Dependencies)

```
Phase 1: PocketBase Setup
  ├── Create collections in PocketBase (via Admin UI or migration script)
  ├── Configure API rules (list/view/create/update/delete)
  └── Set up file storage for documents/receipts

Phase 2: Auth Integration
  ├── Initialize PocketBase SDK in Next.js (src/lib/pocketbase.ts)
  ├── Replace NextAuth with pb.authStore
  ├── Create auth context provider
  └── Protect dashboard routes

Phase 3: Core Data Layer Swap
  ├── Replace Prisma calls → PocketBase SDK calls
  │   ├── Units (CRUD)
  │   ├── Tenants (CRUD)
  │   ├── Leases (CRUD + expand relations)
  │   ├── Payments (CRUD)
  │   ├── Expenses (CRUD + file upload)
  │   └── Maintenance (CRUD)
  └── Wire existing UI pages to PocketBase endpoints

Phase 4: Tenant Portal
  ├── Shared link validation pattern
  ├── Lease view page
  └── Maintenance request submission

Phase 5: Polish & Deploy
  ├── PocketBase hosted (fly.io/Railway)
  ├── Next.js on Vercel
  ├── Admin panel access for landlord
  └── File storage configuration
```

**Dependency rationale:** Auth must come before data layer because every PocketBase operation requires authentication. Core collections (units, tenants, leases) should be swapped first because other pages (expenses, maintenance, rent) depend on them for expand queries.

---

## API Rules Strategy

PocketBase collections each have 5 CRUD rules. For this project:

| Collection | listRule | viewRule | createRule | updateRule | deleteRule |
|------------|----------|----------|------------|------------|------------|
| `users` | `@request.auth.id != ''` | `@request.auth.id != '' && id = @request.auth.id` | `@request.auth.id != ''` | `@request.auth.id != '' && id = @request.auth.id` | `@request.auth.id != '' && id = @request.auth.id` |
| `units` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` |
| `tenants` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` |
| `leases` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` |
| `payments` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` |
| `expenses` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` |
| `maintenance` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` |
| `notices` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` | `@request.auth.id != ''` |

**Rationale:** All landlord-facing operations require auth. Tenant portal bypasses auth via shared link tokens (handled client-side, not via PocketBase rules). The `users` collection restricts view/update/delete to the authenticated user only.

---

## Architectural Patterns

### Pattern 1: PocketBase SDK Singleton

**What:** Single initialized PocketBase instance shared across the app.

**When to use:** Every Next.js page/component needs PocketBase access.

**Trade-offs:** Singleton is simple but makes testing harder. For v1 (single dev), this is fine.

```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase'
import type { BaseRecord, TypedSchema } from 'pocketbase'

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090')

export default pb
```

### Pattern 2: Auth Context Provider

**What:** React context wrapping `pb.authStore` with loading state.

**When to use:** Any component needs to check auth state or access logged-in record.

```typescript
// src/lib/AuthProvider.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import pb from './pocketbase'

interface AuthContextType {
  isAuthenticated: boolean
  user: BaseRecord | null
  loading: boolean
  signOut: () => void
}

// Wrap pb.authStore.onChange to trigger React re-renders
```

### Pattern 3: PocketBase Record Types

**What:** TypeScript type definitions matching PocketBase collections.

**When to use:** Replace Prisma-generated types.

```typescript
// src/types/pocketbase.ts
interface UnitRecord extends BaseRecord {
  id: string
  unitNumber: string
  type: string
  status: 'OCCUPIED' | 'VACANT' | 'MAINTENANCE' | 'UNDER_RENOVATION'
  rentAmount: number
  securityDeposit: number
  created: string
  updated: string
}

interface LeaseRecord extends BaseRecord {
  id: string
  startDate: string
  endDate: string
  rentAmount: number
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWAL_PENDING'
  tenantId: string
  unitId: string
  documents: string[]  // PocketBase file field returns URLs
  created: string
  updated: string
}
```

### Pattern 4: Client-Side Query with Expand

**What:** Fetch related records using PocketBase's `expand` parameter.

**When to use:** Dashboard page needs unit → tenant relationships, payment → lease data.

```typescript
// Fetch units with tenant data in one query
const units = await pb.collection('units').getFullList({
  expand: 'tenants',
})
// Result: each unit has an `expand.tenants` array
```

### Pattern 5: File Upload with FormData

**What:** PocketBase file fields require `multipart/form-data`, not JSON bodies.

**When to use:** Uploading lease documents or expense receipts.

```typescript
const formData = new FormData()
formData.append('amount', '5000')
formData.append('category', 'REPAIR')
formData.append('receipt', receiptFile)  // Blob or File

await pb.collection('expenses').create(formData)
```

---

## Anti-Patterns

### Anti-Pattern 1: Using Prisma Client After Swap

**What people do:** Leave `@prisma/client` imports in the codebase.

**Why it's wrong:** PocketBase uses a completely different API paradigm (REST-ish via HTTP, not ORM queries). Prisma generates types at compile time; PocketBase SDK is runtime.

**Do this instead:** Remove all `@prisma/client` imports. Replace with `pocketbase` SDK calls. Use TypeScript interfaces (`src/types/pocketbase.ts`) for type safety.

### Anti-Pattern 2: Server-Side Data Fetching with PocketBase

**What people do:** Use Next.js `params`/`searchParams` or `fetch()` server-side for PocketBase data.

**Why it's wrong:** PocketBase is on a separate domain (fly.io). Server-side fetches would expose the PocketBase URL to the client or require a proxy. The JS SDK is designed for client-side use.

**Do this instead:** Fetch data in client components using `useEffect` + PocketBase SDK. Use the authStore token for authenticated requests. For server-side rendering, use Next.js middleware to proxy PocketBase calls (but this adds complexity; client-side is simpler for v1).

### Anti-Pattern 3: Over-Engineering with Separate Services

**What people do:** Build separate API routes in Next.js as a proxy to PocketBase.

**Why it's wrong:** The PocketBase JS SDK handles auth, error handling, and HTTP directly from the frontend. Adding a Next.js API layer as a proxy adds maintenance burden with no real benefit for a ≤5 unit app.

**Do this instead:** Call PocketBase directly from React components. Only create Next.js API routes if you need server-side computation (e.g., generating PDF lease documents).

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **≤5 units (v1 target)** | Single PocketBase instance, SQLite, client-side SDK calls. Perfect fit. |
| **10-50 units** | PocketBase handles this fine. Consider: add indexes on frequently queried fields, use `getFirstListItem` instead of `getFullList` for single-record lookups. |
| **50+ units** | PocketBase SQLite may bottleneck on concurrent writes. Consider: PocketBase with PostgreSQL (requires custom Go build), or migrate to dedicated DB. |

### Scaling Priorities

1. **First bottleneck: PocketBase single instance** — SQLite handles millions of rows fine for reads, but concurrent writes from multiple landlords would need file locking. Mitigation: single-landlord design (v1 constraint) avoids this entirely.
2. **Second bottleneck: Client-side pagination** — `getFullList()` fetches all records. For >50 units, switch to `getList(page, perPage, { filter: ... })` for paginated results.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **PocketBase (fly.io)** | JS SDK (`pocketbase` npm package) | Primary backend. All data operations flow through it. |
| **Vercel (Next.js host)** | Standard Next.js deployment | Zero configuration needed. Environment vars point to PocketBase URL. |
| **File Storage (PocketBase)** | Built-in, file field uploads | Lease documents and expense receipts stored in PocketBase's `uploads/` directory. No external storage needed. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Next.js ↔ PocketBase** | HTTP REST API via JS SDK | Auth via bearer token, data via collection CRUD |
| **Next.js ↔ PocketBase Admin** | None (separate UI) | Landlord accesses admin panel separately at `/admin`. Not integrated with Next.js UI. |
| **Tenant Portal ↔ PocketBase** | HTTP (no auth required) | Shared link token validates access client-side. No PocketBase auth collection interaction. |

---

## Sources

- PocketBase documentation: https://pocketbase.io/docs/
  - Collections and fields: https://pocketbase.io/docs/go-collections
  - API rules and filters: https://pocketbase.io/docs/api-rules-and-filters
  - Authentication: https://pocketbase.io/docs/authentication
  - File handling: https://pocketbase.io/docs/files-handling
  - JSVM hooks: https://pocketbase.io/docs/js-event-hooks
- PocketBase JS SDK: https://pocketbase.io/docs/js-records
- Context7: /websites/pocketbase_io (1271 code snippets, benchmark 81.75)
- Context7: /pocketbase/pocketbase (207 code snippets)
- Context7: /pocketbase/js-sdk (181 code snippets, benchmark 84.64)

---

*Architecture research for: Property-Pi (PocketBase + Next.js rental property management)*
*Researched: 2026-04-21*
