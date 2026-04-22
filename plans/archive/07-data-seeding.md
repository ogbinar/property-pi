# Section 1.7 — Data Seeding

## Goal
Populate the database with realistic demo data for testing and demonstration.

---

## Task 1.7.1 — Create Seed Script

**What:** Write `prisma/seed.ts` with sample data.

**Steps:**
1. Create `prisma/seed.ts`
2. Import PrismaClient from `@prisma/client`
3. Define sample data as constants
4. Clear existing data (optional, for clean re-seed):
   - Delete payments, leases, tenants, maintenance, expenses, units (in reverse dependency order)
   - Or use `prisma.$executeRaw` for faster truncation
5. Create data in dependency order:
   - Units first
   - Tenants second
   - Leases third
   - Payments fourth
   - Expenses fifth
   - Maintenance last
6. Use `prisma.$transaction` for atomic seeding
7. Log creation summary at the end

**Sample Data:**

### Units (5 total)
```ts
const units = [
  {
    unitNumber: "1A",
    type: "Studio",
    status: "OCCUPIED",
    rentAmount: new Decimal("12000"),
    securityDeposit: new Decimal("24000"),
  },
  {
    unitNumber: "1B",
    type: "1BR",
    status: "OCCUPIED",
    rentAmount: new Decimal("15000"),
    securityDeposit: new Decimal("30000"),
  },
  {
    unitNumber: "2A",
    type: "1BR",
    status: "OCCUPIED",
    rentAmount: new Decimal("16000"),
    securityDeposit: new Decimal("32000"),
  },
  {
    unitNumber: "2B",
    type: "2BR",
    status: "VACANT",
    rentAmount: new Decimal("22000"),
    securityDeposit: new Decimal("44000"),
  },
  {
    unitNumber: "3A",
    type: "2BR",
    status: "UNDER_RENOVATION",
    rentAmount: new Decimal("25000"),
    securityDeposit: new Decimal("50000"),
  },
];
```

### Tenants (3 total)
```ts
const tenants = [
  {
    firstName: "Juan",
    lastName: "Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "09171234567",
    emergencyContact: "09189876543",
  },
  {
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@email.com",
    phone: "09281112233",
    emergencyContact: null,
  },
  {
    firstName: "Pedro",
    lastName: "Reyes",
    email: "pedro.reyes@email.com",
    phone: "09394445566",
    emergencyContact: "09407778899",
  },
];
```

### Leases (3 active, linked to occupied units)
```ts
const leases = [
  {
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    rentAmount: new Decimal("12000"),
    status: "ACTIVE",
    // Unit 1A → Tenant 1
  },
  {
    startDate: new Date("2025-06-01"),
    endDate: new Date("2026-05-31"),
    rentAmount: new Decimal("15000"),
    status: "ACTIVE",
    // Unit 1B → Tenant 2
  },
  {
    startDate: new Date("2025-03-01"),
    endDate: new Date("2026-02-28"),
    rentAmount: new Decimal("16000"),
    status: "ACTIVE",
    // Unit 2A → Tenant 3
  },
];
```

### Payments (8 total — mix of paid, pending, overdue)
```ts
const payments = [
  // Juan — Unit 1A
  { amount: new Decimal("12000"), date: new Date("2025-10-03"), method: "Transfer", status: "PAID" },
  { amount: new Decimal("12000"), date: new Date("2025-11-02"), method: "Transfer", status: "PAID" },
  { amount: new Decimal("12000"), date: new Date("2025-12-04"), method: "Cash", status: "PAID" },
  { amount: new Decimal("12000"), date: new Date("2026-01-03"), method: "Transfer", status: "PAID" },

  // Maria — Unit 1B
  { amount: new Decimal("15000"), date: new Date("2026-02-05"), method: "Transfer", status: "PAID" },
  { amount: new Decimal("15000"), date: new Date("2026-03-04"), method: "Transfer", status: "PAID" },

  // Pedro — Unit 2A
  { amount: new Decimal("16000"), date: new Date("2026-03-06"), method: "Check", status: "PAID" },
  { amount: new Decimal("16000"), date: new Date(), status: "PENDING" }, // Current month, not yet paid
];
```

### Expenses (3 total)
```ts
const expenses = [
  {
    amount: new Decimal("3500"),
    category: "Repairs",
    description: "Fixed leaking faucet in Unit 1A",
    date: new Date("2026-03-10"),
  },
  {
    amount: new Decimal("8200"),
    category: "Utilities",
    description: "Water bill Q1 2026",
    date: new Date("2026-03-15"),
  },
  {
    amount: new Decimal("12000"),
    category: "Taxes",
    description: "Real property tax installment 1",
    date: new Date("2026-02-01"),
  },
];
```

### Maintenance Requests (2 total)
```ts
const maintenance = [
  {
    title: "Leaking faucet",
    description: "Kitchen faucet dripping, needs washer replacement",
    priority: "LOW",
    status: "COMPLETED",
    cost: new Decimal("3500"),
    // Unit 1A
  },
  {
    title: "Broken window latch",
    description: "Living room window latch broken, cannot close properly",
    priority: "HIGH",
    status: "IN_PROGRESS",
    cost: null,
    // Unit 2A
  },
];
```

**Seed Script Structure:**
```ts
import { PrismaClient, UnitStatus, LeaseStatus, PaymentStatus, MaintenanceStatus, Priority } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.unit.deleteMany();

  // Create units
  const createdUnits = await Promise.all(
    units.map(u => prisma.unit.create({ data: u }))
  );
  console.log(`✅ Created ${createdUnits.length} units`);

  // Create tenants
  const createdTenants = await Promise.all(
    tenants.map(t => prisma.tenant.create({ data: t }))
  );
  console.log(`✅ Created ${createdTenants.length} tenants`);

  // Create leases (link to units and tenants)
  // ...

  // Create payments, expenses, maintenance
  // ...

  console.log("🎉 Seed complete!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
```

**Acceptance Criteria:**
- Seed script runs without errors
- 5 units created with correct status distribution
- 3 tenants created with contact info
- 3 active leases linking tenants to units
- 8 payments (6 paid, 1 pending, 1 overdue)
- 3 expenses across different categories
- 2 maintenance requests (1 completed, 1 in progress)
- All foreign key relationships valid
- Re-running seed produces clean state (no duplicates)

---

## Task 1.7.2 — Add Seed Script to Package.json

**What:** Configure npm script and Prisma seed configuration.

**Steps:**
1. Update `package.json`:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "eslint",
       "db:seed": "tsx prisma/seed.ts"
     },
     "prisma": {
       "seed": "tsx prisma/seed.ts"
     }
   }
   ```
2. Install `tsx` as dev dependency:
   ```bash
   npm install -D tsx
   ```
3. Update `tsconfig.json` if needed (ensure `moduleResolution` is set correctly for Prisma)

**Commands:**
```bash
# Using Prisma's built-in seed
npx prisma db seed

# Or using npm script directly
npm run db:seed
```

**Acceptance Criteria:**
- `npm run db:seed` runs the seed script
- `npx prisma db seed` runs the seed script
- Both produce identical results
- Seed completes in under 5 seconds
- No TypeScript errors during seed execution

---

## Summary Checklist

- [ ] Task 1.7.1 — Seed script with realistic demo data
- [ ] Task 1.7.2 — Seed configured in package.json + tsx installed

---

## Data Distribution Summary

| Model | Count | Details |
|---|---|---|
| **Units** | 5 | 3 occupied, 1 vacant, 1 under renovation |
| **Tenants** | 3 | All with contact info, 2 with emergency contacts |
| **Leases** | 3 | All active, linked to occupied units |
| **Payments** | 8 | 6 paid, 1 pending, 1 overdue (across 3 units) |
| **Expenses** | 3 | Repairs, Utilities, Taxes |
| **Maintenance** | 2 | 1 completed, 1 in progress |

This gives a realistic snapshot of a small 5-unit building with ~80% occupancy.
