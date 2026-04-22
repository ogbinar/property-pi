# Section 0 — Schema & Infrastructure Refactoring

> **Purpose:** Fix schema gaps and install missing dependencies **before** any feature implementation begins.
> This prevents costly rework mid-build (e.g., building the rent page only to discover `Payment.dueDate` doesn't exist).

**Execution Order:** 0.1 → 0.2 → 0.3 → (then proceed to Phase 1 plans)

---

## Task 0.1 — Add `dueDate` to Payment Model

**Why:** The entire rent tracking system (1.5) depends on due dates — overdue detection, "due in X days" warnings, and bulk generation with "due date = 5th of month." The schema currently has no `dueDate` field.

**Change:**

```diff
 model Payment {
   id            String   @id @default(cuid())
   amount        Decimal
   date          DateTime
   method        String   // Cash, Transfer, Check
   status        PaymentStatus @default(PENDING)
+  dueDate       DateTime // Default: 5th of the month

   unitId        String
   unit          Unit     @relation(fields: [unitId], references: [id])

   createdAt     DateTime @default(now())
 }
```

**Impact:**
- Task 1.5.1 (Rent page) — overdue indicators depend on this
- Task 1.5.3 (Generate rent) — sets `dueDate = 5th of month`
- Task 1.5.4 (Overdue detection) — compares `dueDate` with current date
- No other models affected

---

## Task 0.2 — Add `RentAdjustment` Model

**Why:** SPEC §3.2 explicitly calls out "Rent Adjustment History: Tracking changes in rent amounts over time (crucial for renewals)." The current schema only has `Unit.rentAmount` with no audit trail. When a lease is renewed with a rent increase, there's no record of what the previous rent was.

**Change:**

```prisma
model RentAdjustment {
  id            String   @id @default(cuid())
  oldRentAmount Decimal
  newRentAmount Decimal
  reason        String?  // "Lease renewal", "Market adjustment", etc.
  effectiveDate DateTime
  createdAt     DateTime @default(now())

  unitId        String
  unit          Unit     @relation(fields: [unitId], references: [id])

  @@index([unitId, effectiveDate])
}
```

**Impact:**
- Task 1.2.3 (Edit unit) — "Rent adjustment history: show past rent amounts with dates (read-only)"
- Task 1.4.2 (New lease) — "Rent amount should match unit's current rent (allow override with confirmation)" — needs history to show what changed
- No other models affected
- Add to `Unit` model: `adjustments RentAdjustment[]`

**Migration note:** Since using `db push` (not migrations), this is a one-command change. No data loss risk since it's a new table.

---

## Task 0.3 — Make `Tenant.unitId` Optional

**Why:** Currently `Tenant.unitId` is a required FK. This causes two problems:
1. **No former tenants** — when a tenant moves out, their `unitId` becomes stale. Their lease history lives in `Lease`, but the tenant record itself has no way to exist without a current unit.
2. **Tenant re-hiring** — if the same person rents a different unit later, you'd have to create a duplicate tenant record instead of reusing the existing one.

**Change:**

```diff
 model Tenant {
   id            String   @id @default(cuid())
   firstName     String
   lastName      String
   email         String   @unique
   phone         String?
   emergencyContact String?

-  unitId        String
-  unit          Unit     @relation(fields: [unitId], references: [id])
+  unitId        String?  // Current unit (optional — tenant may be between units)
+  unit          Unit?    @relation(fields: [unitId], references: [id])

   leases        Lease[]

   createdAt     DateTime @default(now())
   updatedAt     DateTime @updatedAt
 }
```

**Impact:**
- Task 1.3.1 (Tenant list) — "Linked Unit" column may show "—" for former tenants
- Task 1.3.3 (Tenant detail) — "Linked Lease section" already handles "no active lease" — this complements it
- Task 1.4.2 (New lease) — creating a lease for a tenant without a current unit is now valid (they're getting a new one)
- **No data loss** — existing tenants will just have `unitId = null` after `db push`. The seed script (1.7) will set them correctly.

---

## Task 0.4 — Add `ContactLog` Model (Optional, Phase 2)

**Why:** SPEC §3.4 mentions "Contact Log: Quick log of interactions with tenants." This is a Phase 2 feature but the schema should be ready.

**Change:**

```prisma
model ContactLog {
  id            String   @id @default(cuid())
  type          ContactType
  subject       String   // Brief subject line
  notes         String   // Detailed notes about the interaction
  date          DateTime @default(now())

  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  createdAt     DateTime @default(now())
}

enum ContactType {
  PHONE_CALL
  EMAIL
  IN_PERSON
  TEXT
  OTHER
}
```

**Impact:**
- Future feature — no current tasks depend on this
- Add to `Tenant` model: `contactLogs ContactLog[]`
- Can be deferred to Phase 2 without schema changes

---

## Task 0.5 — Add `Notice` Model (Optional, Phase 2)

**Why:** SPEC §3.4 mentions "Tenant Notice System: Send simple digital notices (e.g., 'Maintenance scheduled for Tuesday')."

**Change:**

```prisma
model Notice {
  id            String   @id @default(cuid())
  type          NoticeType
  title         String
  content       String
  sentAt        DateTime?
  deliveredAt   DateTime?

  unitId        String
  unit          Unit     @relation(fields: [unitId], references: [id])

  createdAt     DateTime @default(now())
}

enum NoticeType {
  MAINTENANCE
  RENT_INCREASE
  RULE_CHANGE
  GENERAL
  OTHER
}
```

**Impact:**
- Future feature — no current tasks depend on this
- Can be deferred to Phase 2 without schema changes

---

## Task 0.6 — Install Missing Dependencies

**Why:** The plans reference libraries that aren't in `package.json`. Installing them now prevents "install mid-task" context switching.

**New dependencies:**

```bash
npm install next-auth date-fns lucide-react clsx tailwind-merge zod react-hook-form @hookform/resolvers/zod recharts sonner
```

**New dev dependencies:**

```bash
npm install -D @types/node tsx
```

**Summary of all new packages:**

| Package | Purpose | Used In |
|---|---|---|
| `next-auth` | Authentication (credentials provider) | 1.1.3 |
| `date-fns` | Date formatting/manipulation | 1.5 (rent), 1.6 (dashboard) |
| `lucide-react` | Icon library | Layout, status badges, actions |
| `clsx` + `tailwind-merge` | Conditional class merging | All UI components |
| `zod` | Schema validation | All forms + API routes |
| `react-hook-form` | Form state management | All forms |
| `@hookform/resolvers/zod` | Hook + Zod integration | All forms |
| `recharts` | Dashboard charts (trends) | 2.3.3 |
| `sonner` | Toast notifications | All form submits (20+ places) |
| `tsx` | Run TypeScript seed scripts | 1.7.2 |

---

## Task 0.7 — Update `package.json` Seed Script

**Change:**

```diff
 {
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "eslint",
+    "db:seed": "tsx prisma/seed.ts"
   },
+  "prisma": {
+    "seed": "tsx prisma/seed.ts"
+  }
 }
```

---

## Task 0.8 — Run Prisma Generate + DB Push

**Steps:**
1. `npx prisma generate` — regenerate Prisma Client with new models
2. `npx prisma db push` — push schema changes to PostgreSQL
3. Verify tables: `Unit`, `Tenant`, `Lease`, `Payment`, `Expense`, `MaintenanceRequest`, `RentAdjustment`, `ContactLog`, `Notice` (9 tables total)
4. Verify `npx prisma studio` opens and shows all tables

**Acceptance Criteria:**
- No errors from `prisma generate` or `prisma db push`
- All 9 tables visible in Prisma Studio
- `src/lib/prisma.ts` has no TypeScript errors
- `npm run lint` passes

---

## Summary Checklist

- [x] Task 0.1 — Add `dueDate` to Payment
- [x] Task 0.2 — Add `RentAdjustment` model + `adjustments[]` to Unit
- [x] Task 0.3 — Make `Tenant.unitId` optional
- [x] Task 0.4 — Add `ContactLog` model (deferred to Phase 2)
- [x] Task 0.5 — Add `Notice` model (deferred to Phase 2)
- [x] Task 0.6 — Install all missing dependencies
- [x] Task 0.7 — Update `package.json` with seed script
- [x] Task 0.8 — Generate client + push to DB
- [x] Task 1.1 — Project Setup & Infrastructure (auth, layout, 8 UI components)
- [x] Task 1.2 — Unit Management (full CRUD: list, new, edit, detail + 4 API routes)
- [x] Task 1.6 — Dashboard (home page with 5 components + aggregation API)
- [x] Task 1.3 — Tenant Management (full CRUD: list, new, edit, detail + 4 API routes)
- [x] Task 1.4 — Lease Management (full CRUD: list, new, edit, detail + 4 API routes)
- [x] Task 1.5 — Rent Tracking (monthly table, summary, month picker, mark-paid, bulk generate, overdue detection)

## Execution Notes

- **Prisma 7 compatibility:** Removed `url` from `schema.prisma` datasource block — Prisma 7 moved connection URLs to `prisma.config.ts`
- **Database:** Started PostgreSQL 16 via Docker container (`property-pi-db`) on port 5432
- **DATABASE_URL:** Updated `.env` to use direct PostgreSQL connection string
- **All 9 tables verified:** Unit, Tenant, Lease, Payment, Expense, MaintenanceRequest, RentAdjustment, ContactLog, Notice
- **TypeScript compilation:** `tsc --noEmit` passes with zero errors
- **Prisma Studio:** Running at http://localhost:5555 (verify all tables visible)

## Next: Proceed to Phase 1

Completed: **1.1 Infrastructure, 1.2 Units, 1.6 Dashboard, 1.3 Tenants, 1.4 Leases, 1.5 Rent**
Next: **1.7 Seed**

---

## Post-Refactoring Execution Order

After completing Section 0, proceed with Phase 1 in this order:

```
1.1 Infrastructure → 1.2 Units → 1.6 Dashboard → 1.3 Tenants → 1.4 Leases → 1.5 Rent → 1.7 Seed
```

**Note:** The original plan said `1.6 before 1.2`, but an empty dashboard isn't motivating. Build units first, then the dashboard immediately shows real data.
