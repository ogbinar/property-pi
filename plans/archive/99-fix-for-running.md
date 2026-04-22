# Fix Plan: Get Property-Pi Running

> **Goal:** Identify and fix the major gaps preventing the project from running, prioritized by the Pareto principle (20% of fixes → 80% of value).

---

## Gap Analysis Summary

After thorough analysis, here are all identified gaps ranked by impact:

| # | Gap | Impact | Effort | Pareto Priority |
|---|-----|--------|--------|-----------------|
| G1 | Missing `.env` / `DATABASE_URL` | **BLOCKER** — app cannot connect to DB | Low | **P0** |
| G2 | Missing `POST /api/rent/generate` route | **BLOCKER** — rent page crashes on load | Low | **P0** |
| G3 | Missing `POST /api/rent/[unitId]/mark-paid` route | **BLOCKER** — rent page broken | Low | **P0** |
| G4 | Schema: `Payment.dueDate` exists but no default — seed data will fail | Medium | Low | **P1** |
| G5 | Schema: `Tenant.email` is unique — prevents re-hiring | Medium | Medium | **P2** |
| G6 | No demo data seeding | Medium | Medium | **P2** |
| G7 | README is generic boilerplate | Low | Low | **P3** |
| G8 | No expense/maintenance pages (planned for Phase 2) | Low | High | **P3** |

---

## Pareto Analysis

**The 20% of fixes that unlock 80% of functionality:**

### P0 — Critical Blockers (Fix First)

These 3 gaps prevent the app from running at all. Fixing them unlocks the entire core feature set (dashboard, units, tenants, leases, rent).

1. **G1: Missing `.env` / `DATABASE_URL`**
2. **G2: Missing `POST /api/rent/generate` route**
3. **G3: Missing `POST /api/rent/[unitId]/mark-paid` route**

### P1 — Important (Fix Second)

These prevent full functionality but the app will still run.

4. **G4: Schema `Payment.dueDate` default**
5. **G6: Demo data seeding**

### P2 — Nice to Have (Fix Later)

6. **G5: Tenant email uniqueness**
7. **G7: README update**

### P3 — Out of Scope for This Plan

8. **G8: Expense/maintenance pages** — These are Phase 2 features, not blockers.

---

## Detailed Fix Plan

---

### Fix 1: Create `.env` File (G1)

**Why:** The app cannot connect to PostgreSQL without `DATABASE_URL`. This is the single most important configuration.

**What to do:**

Create `.env` file in project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/property_pi"
```

**Steps:**
1. Create `.env` with placeholder values
2. User must update with their actual PostgreSQL credentials
3. Verify with `npx prisma generate` and `npx prisma db push`

**Impact:** Without this, nothing runs.

---

### Fix 2: Create `POST /api/rent/generate` Route (G2)

**Why:** The rent page (`src/app/(dashboard)/rent/page.tsx`) calls this endpoint to generate monthly rent records. Without it, the rent page will fail with 404.

**What to do:**

Create `src/app/api/rent/generate/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const generateSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { month, year } = generateSchema.parse(body)

    // Find all occupied units
    const units = await prisma.unit.findMany({
      where: { status: 'OCCUPIED' },
      include: {
        tenants: {
          where: { unitId: undefined },
          select: { id: true },
        },
      },
    })

    // Generate payment records for each occupied unit
    const payments = await Promise.all(
      units.map((unit) =>
        prisma.payment.create({
          data: {
            amount: unit.rentAmount,
            date: new Date(year, month - 1, 1),
            dueDate: new Date(year, month - 1, 5),
            status: 'PENDING',
            method: 'PENDING',
            unitId: unit.id,
          },
        })
      )
    )

    return NextResponse.json(
      {
        message: `Generated ${payments.length} rent records`,
        count: payments.length,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to generate rent records' },
      { status: 500 }
    )
  }
}
```

**Impact:** Rent page becomes functional. Users can generate monthly rent records.

---

### Fix 3: Create `POST /api/rent/[unitId]/mark-paid` Route (G3)

**Why:** The rent page needs this endpoint to mark individual payments as paid. Without it, the "Mark Paid" button will fail with 404.

**What to do:**

Create `src/app/api/rent/[unitId]/mark-paid/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ unitId: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { unitId } = await params

  try {
    const payment = await prisma.payment.updateMany({
      where: { unitId },
      data: {
        status: 'PAID',
        date: new Date(),
      },
    })

    if (payment.count === 0) {
      return NextResponse.json(
        { error: 'No pending payment found for this unit' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Payment marked as paid',
      updated: payment.count,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark payment as paid' },
      { status: 500 }
    )
  }
}
```

**Impact:** Rent page "Mark Paid" functionality works. Users can track payments.

---

### Fix 4: Add Default Value to `Payment.dueDate` (G4)

**Why:** The schema already has `dueDate DateTime` on the Payment model (confirmed at [`prisma/schema.prisma:82`](prisma/schema.prisma:82)), but there is no default. When seeding data or creating payments without explicitly setting `dueDate`, the database will reject NULL values.

**What to do:**

The schema already has `dueDate` as a required field (no `?` modifier). The fix is to ensure the rent generation route (Fix 2) sets `dueDate` correctly, which it does. No schema change needed — this is addressed by Fix 2.

**Impact:** Prevents database errors when creating payments.

---

### Fix 5: Create Demo Data Seed Script (G6)

**Why:** Without demo data, the app will show empty states everywhere, making it look broken. The current [`prisma/seed.ts`](prisma/seed.ts:1) only creates the admin user.

**What to do:**

Expand `prisma/seed.ts` to create realistic demo data:

```ts
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { Decimal } from '@prisma/client/runtime/library'

const { Pool } = pg
const adapter = new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL }))
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Create admin user
  const email = 'admin@propertypi.local'
  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Landlord',
      password: hashedPassword,
      role: 'LANDLORD',
    },
  })

  // 2. Create 5 units
  const units = await Promise.all([
    prisma.unit.create({ data: { unitNumber: '1A', type: 'Studio', status: 'OCCUPIED', rentAmount: new Decimal('12000'), securityDeposit: new Decimal('24000') } }),
    prisma.unit.create({ data: { unitNumber: '1B', type: '1BR', status: 'OCCUPIED', rentAmount: new Decimal('15000'), securityDeposit: new Decimal('30000') } }),
    prisma.unit.create({ data: { unitNumber: '2A', type: '1BR', status: 'OCCUPIED', rentAmount: new Decimal('16000'), securityDeposit: new Decimal('32000') } }),
    prisma.unit.create({ data: { unitNumber: '2B', type: '2BR', status: 'VACANT', rentAmount: new Decimal('22000'), securityDeposit: new Decimal('44000') } }),
    prisma.unit.create({ data: { unitNumber: '3A', type: '2BR', status: 'UNDER_RENOVATION', rentAmount: new Decimal('25000'), securityDeposit: new Decimal('50000') } }),
  ])

  // 3. Create tenants
  const tenants = await Promise.all([
    prisma.tenant.create({ data: { firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan@email.com', phone: '09171234567', emergencyContact: '09189876543', unitId: units[0].id } }),
    prisma.tenant.create({ data: { firstName: 'Maria', lastName: 'Santos', email: 'maria@email.com', phone: '09181234567', emergencyContact: '09199876543', unitId: units[1].id } }),
    prisma.tenant.create({ data: { firstName: 'Pedro', lastName: 'Reyes', email: 'pedro@email.com', phone: '09191234567', emergencyContact: null, unitId: units[2].id } }),
  ])

  // 4. Create leases
  await Promise.all([
    prisma.lease.create({ data: { tenantId: tenants[0].id, unitId: units[0].id, startDate: new Date('2025-01-01'), endDate: new Date('2026-12-31'), rentAmount: new Decimal('12000'), status: 'ACTIVE' } }),
    prisma.lease.create({ data: { tenantId: tenants[1].id, unitId: units[1].id, startDate: new Date('2025-06-01'), endDate: new Date('2027-05-31'), rentAmount: new Decimal('15000'), status: 'ACTIVE' } }),
    prisma.lease.create({ data: { tenantId: tenants[2].id, unitId: units[2].id, startDate: new Date('2025-03-01'), endDate: new Date('2026-08-31'), rentAmount: new Decimal('16000'), status: 'ACTIVE' } }),
  ])

  // 5. Create payments for current month
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  await Promise.all([
    prisma.payment.create({ data: { amount: new Decimal('12000'), date: new Date(currentYear, currentMonth, 2), dueDate: new Date(currentYear, currentMonth, 5), status: 'PAID', method: 'Transfer', unitId: units[0].id } }),
    prisma.payment.create({ data: { amount: new Decimal('15000'), date: new Date(currentYear, currentMonth, 1), dueDate: new Date(currentYear, currentMonth, 5), status: 'PAID', method: 'Cash', unitId: units[1].id } }),
    prisma.payment.create({ data: { amount: new Decimal('16000'), date: new Date(), dueDate: new Date(currentYear, currentMonth, 5), status: 'PENDING', method: 'PENDING', unitId: units[2].id } }),
  ])

  console.log('✅ Seed complete: 5 units, 3 tenants, 3 leases, 3 payments')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
```

**Steps:**
1. Add `@prisma/client/runtime/library` to dependencies (for Decimal)
2. Replace `prisma/seed.ts` with expanded version
3. Run `npx prisma db push` to sync schema
4. Run `npm run db:seed` to populate data

**Impact:** Dashboard shows real data immediately. All pages display meaningful content instead of empty states.

---

### Fix 6: Update README (G7)

**Why:** The current README is generic `create-next-app` boilerplate. It should have project-specific setup instructions.

**What to do:**

Replace `README.md` with:

```markdown
# Property-Pi

Lightweight property management application for small-scale landlords (5-unit portfolio).

## Tech Stack

- **Frontend:** Next.js 16.2.4 (App Router), React 19
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v4 (JWT, credentials)
- **Styling:** Tailwind CSS v4

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up `.env` file:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` with your PostgreSQL connection string.

3. Initialize database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Seed demo data:
   ```bash
   npm run db:seed
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

## Default Login

- **Email:** admin@propertypi.local
- **Password:** admin123

## Project Structure

See [`SPEC.md`](SPEC.md) for full specification.
See [`plans/`](plans/) for implementation roadmap.
```

**Impact:** Clear onboarding instructions for new developers.

---

## Execution Order

```mermaid
graph TD
    A[Fix 1: .env file] --> B[Fix 2: rent/generate API]
    A --> C[Fix 3: mark-paid API]
    B --> D[Fix 5: seed script]
    C --> D
    D --> E[Fix 6: README]
    E --> F[Verify app runs]
```

1. **Fix 1** → Must be first (no DB = nothing works)
2. **Fix 2 + Fix 3** → Can be done in parallel (both are missing API routes)
3. **Fix 5** → Depends on Fix 1 (needs DB to seed)
4. **Fix 6** → Can be done anytime after Fix 1
5. **Verification** → Run `npm run dev` and test all pages

---

## What's NOT in This Plan (Out of Scope)

These are Phase 2 features from the original plans and are not blockers:

- **Expense management pages** (`/expenses`) — planned for Section 2.1
- **Maintenance tracking pages** (`/maintenance`) — planned for Section 2.2
- **Enhanced dashboard** with expense breakdown — planned for Section 2.3
- **File upload integration** (Supabase) — planned for Section 2.4
- **Tenant email uniqueness fix** (G5) — low priority, can be addressed later

---

## Verification Checklist

After applying all fixes:

- [ ] `npm install` succeeds
- [ ] `npx prisma generate` succeeds
- [ ] `npx prisma db push` succeeds
- [ ] `npm run db:seed` succeeds (creates admin + demo data)
- [ ] `npm run dev` starts without errors
- [ ] `/login` page loads and accepts credentials
- [ ] `/` (dashboard) loads with unit status, revenue, occupancy data
- [ ] `/units` page shows 5 units with status badges
- [ ] `/tenants` page shows 3 tenants
- [ ] `/leases` page shows 3 leases
- [ ] `/rent` page shows monthly rent with generate and mark-paid working
- [ ] `npm run lint` passes