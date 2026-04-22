# Property-Pi — Phase 1 Sub-Plan

## Phase 1: MVP (Core Foundation)

---

### 1.1 Project Setup & Infrastructure

**Goal:** Get the project running with dependencies, database, and layout shell.

- [ ] **1.1.1** Install dependencies
  - `next-auth` (or `clerk`) — authentication
  - `date-fns` — date formatting & manipulation
  - `lucide-react` — icon library
  - `clsx` + `tailwind-merge` — conditional class merging
  - `zod` — form validation
  - `react-hook-form` + `@hookform/resolvers/zod` — form handling
  - `recharts` — dashboard charts (optional, for revenue visualization)

- [ ] **1.1.2** Initialize database
  - Run `npx prisma generate` to generate Prisma client
  - Run `npx prisma db push` to create tables in PostgreSQL
  - Verify all 6 models are created: Unit, Tenant, Lease, Payment, Expense, MaintenanceRequest

- [ ] **1.1.3** Add authentication
  - Create auth provider (NextAuth or Clerk)
  - Build `/login` page with email/password or magic link
  - Add middleware to protect all routes except `/login`
  - Create auth context/provider for client-side session access

- [ ] **1.1.4** Create layout shell
  - Build sidebar with navigation links: Dashboard, Units, Tenants, Leases, Rent
  - Build header with: app title, user avatar, logout button, dark mode toggle
  - Wrap all dashboard routes in a `(dashboard)` route group layout
  - Ensure responsive design (collapsible sidebar on mobile)

- [ ] **1.1.5** Create shared UI components
  - `Button` — variants: primary, secondary, outline, danger; sizes: sm, md, lg
  - `Card` — container with header, body, footer slots
  - `Badge` — status indicators (colors for each status enum)
  - `Input` — text input with label, placeholder, error state
  - `Select` — dropdown with label and error state
  - `Modal` — overlay dialog with title, content, actions
  - `Table` — responsive table with header, rows, and optional actions column
  - `EmptyState` — message + CTA when no data exists

---

### 1.2 Unit Management

**Goal:** Full CRUD for units with status tracking.

- [ ] **1.2.1** Create `/units` page
  - Display units in a responsive card grid (not table — more visual for property management)
  - Each card shows: unit number, type, status badge, current rent, current tenant name (if occupied)
  - Color-code cards by status: green (occupied), gray (vacant), orange (maintenance), blue (renovation)
  - Add "Add Unit" button in header
  - Add search/filter bar (filter by status, search by unit number)

- [ ] **1.2.2** Create `/units/new` page
  - Form fields: unit number (unique, required), type (select: Studio/1BR/2BR/3BR/Other), rent amount, security deposit
  - Client-side validation (Zod): unit number required, rent > 0, deposit >= 0
  - On submit: call `POST /api/units`, show success toast, redirect to `/units`
  - Loading state during submission

- [ ] **1.2.3** Create `/units/[id]/edit` page
  - Pre-populate form with existing unit data
  - Allow editing: type, rent amount, security deposit, status
  - Rent adjustment history: show past rent amounts with dates (read-only)
  - On submit: call `PATCH /api/units/[id]`, show success toast, redirect to unit detail

- [ ] **1.2.4** Create `/units/[id]` detail view
  - Unit info card: number, type, status, rent, deposit, created/updated dates
  - **Current Tenant section:** name, email, phone, lease start/end dates
  - **Active Lease section:** lease ID, dates, rent amount, status
  - **Recent Payments section:** last 5 payments with amounts and dates
  - Action buttons: Edit Unit, Assign Tenant, Create Lease

- [ ] **1.2.5** Create API routes for units
  - `POST /api/units` — create unit, validate with Zod, return created unit
  - `PATCH /api/units/[id]` — update unit, validate with Zod, return updated unit
  - `DELETE /api/units/[id]` — delete unit (only if no tenants/leases linked, or cascade)
  - `GET /api/units` — list all units (with optional status filter query param)
  - All routes protected by auth middleware

---

### 1.3 Tenant Management

**Goal:** Full CRUD for tenants with profile views.

- [ ] **1.3.1** Create `/tenants` page
  - Display tenants in a table: name, email, phone, linked unit, lease status
  - Search bar: filter by name, email, or phone
  - "Add Tenant" button in header
  - Click row → navigate to tenant detail page

- [ ] **1.3.2** Create `/tenants/new` page
  - Form fields: first name, last name, email (unique), phone (optional), emergency contact (optional)
  - Validation: required fields, valid email format
  - On submit: call `POST /api/tenants`, redirect to tenant detail

- [ ] **1.3.3** Create `/tenants/[id]` detail view
  - Tenant profile card: name, email, phone, emergency contact
  - **Linked Lease section:** active lease details, unit info, dates, status
  - **Payment History section:** table of all payments for this tenant's unit(s)
  - Action buttons: Edit Tenant, Create Lease, View Unit

- [ ] **1.3.4** Create `/tenants/[id]/edit` page
  - Pre-populate form with existing tenant data
  - Allow editing: name, email, phone, emergency contact
  - On submit: call `PATCH /api/tenants/[id]`, redirect to tenant detail

- [ ] **1.3.5** Create API routes for tenants
  - `POST /api/tenants` — create tenant, validate with Zod, return created tenant
  - `PATCH /api/tenants/[id]` — update tenant, validate with Zod
  - `DELETE /api/tenants/[id]` — delete tenant (only if no active leases, or handle cascade)
  - `GET /api/tenants` — list all tenants (with optional search query param)

---

### 1.4 Lease Management

**Goal:** Create and track leases with lifecycle status.

- [ ] **1.4.1** Create `/leases` page
  - Display leases in a table: tenant name, unit number, start date, end date, status
  - Status badges: ACTIVE (green), EXPIRED (gray), TERMINATED (red), RENEWAL_PENDING (yellow)
  - "Create Lease" button in header
  - Filter by status
  - Click row → navigate to lease detail

- [ ] **1.4.2** Create `/leases/new` page
  - Step 1: Select tenant (dropdown with search)
  - Step 2: Select unit (dropdown, auto-populates current rent)
  - Step 3: Enter lease dates (start, end) and rent amount
  - Validation: end date > start date, rent > 0, unit must be vacant or have expiring lease
  - On submit: call `POST /api/leases`, update unit status to OCCUPIED, redirect to lease detail

- [ ] **1.4.3** Create `/leases/[id]` detail view
  - Lease info card: tenant, unit, start/end dates, rent amount, status
  - Document links section (placeholder for Phase 3)
  - Status change buttons: Renew, Terminate (with confirmation modal)
  - Show related payments and unit info

- [ ] **1.4.4** Create API routes for leases
  - `POST /api/leases` — create lease, validate, update unit status, return lease
  - `PATCH /api/leases/[id]` — update lease status (renew/terminate), return updated lease
  - `GET /api/leases` — list all leases (with optional status filter)

---

### 1.5 Rent Tracking

**Goal:** Monthly rent generation, marking payments, and overdue tracking.

- [ ] **1.5.1** Create `/rent` page
  - Monthly rent table: unit, tenant, rent amount, status badge, due date, actions
  - Status badges: PAID (green), PENDING (yellow), OVERDUE (red), PARTIAL (orange)
  - Default view: current month
  - Month/year picker to navigate between months
  - "Generate Rent" button — bulk creates records for all occupied units
  - Total row: total expected, total collected, total outstanding

- [ ] **1.5.2** Create `POST /api/rent/[unitId]/mark-paid`
  - Accepts: amount, payment method (Cash/Transfer/Check), optional date
  - Creates Payment record, updates status to PAID
  - Returns success + updated payment

- [ ] **1.5.3** Create `POST /api/rent/generate`
  - Creates Payment records for all OCCUPIED units for the current month
  - Uses each unit's current rentAmount
  - Sets status to PENDING, due date = 5th of the month
  - Skips units that already have a payment for the month
  - Returns list of created payments

- [ ] **1.5.4** Overdue indicators
  - Automatically mark payments as OVERDUE if current date > due date and status is PENDING
  - Show red badge + "X days overdue" text on the rent page
  - Logic: check on rent page load and on API calls

- [ ] **1.5.5** Create `GET /api/rent/[month]/[year]`
  - Returns all payment records for a given month/year
  - Includes: unit info, tenant info, payment status, amount, date
  - Used by the rent page for month navigation

---

### 1.6 Dashboard (Home Page)

**Goal:** Single-page overview of everything important.

- [ ] **1.6.1** Replace `src/app/page.tsx` with dashboard layout
  - Header: "Welcome back, [Name]" + current month/year
  - Grid layout: 2-column on desktop, 1-column on mobile

- [ ] **1.6.2** Unit Status Overview card
  - Visual grid of all units (max 5, but flexible)
  - Each unit shown as a colored card with: unit number, type, status badge
  - Click card → navigate to unit detail
  - Color coding: green (occupied), gray (vacant), orange (maintenance), blue (renovation)

- [ ] **1.6.3** Monthly Revenue card
  - Two numbers: "Collected: ₱XX,XXX" and "Expected: ₱XX,XXX"
  - Progress bar showing collection rate
  - Small text: "for [Month Year]"

- [ ] **1.6.4** Occupancy Rate card
  - Large percentage number (e.g., "80%")
  - Subtitle: "4 of 5 units occupied"
  - Color-coded: green (≥80%), yellow (50-79%), red (<50%)

- [ ] **1.6.5** Recent Activity feed
  - Last 5 activities across all models:
    - "John Doe paid ₱15,000 rent" (Payment)
    - "Unit 2B lease renewed" (Lease)
    - "New maintenance request: leak in Unit 3A" (Maintenance)
  - Each item clickable → navigate to related detail page
  - Timestamp: "2 hours ago", "3 days ago"

- [ ] **1.6.6** Upcoming Expirations card
  - List leases expiring in next 60 days
  - Grouped by urgency: 0-15 days (red), 16-30 days (yellow), 31-60 days (blue)
  - Each item: unit number, tenant name, days remaining
  - "View all leases" link → navigate to /leases

- [ ] **1.6.7** Create `GET /api/dashboard`
  - Single endpoint that aggregates all dashboard data:
    - Unit counts by status
    - Monthly revenue (collected + expected)
    - Occupancy rate
    - Recent activities (join payments, leases, maintenance)
    - Upcoming lease expirations
  - Response shape: `{ units: { occupied, vacant, maintenance, underRenovation }, revenue: { collected, expected, rate }, occupancy: { rate, occupied, total }, activities: [...], expirations: [...] }`
  - Optimized with Prisma includes to minimize queries

---

### 1.7 Data Seeding

**Goal:** Populate database with realistic demo data.

- [ ] **1.7.1** Create `prisma/seed.ts`
  - 5 units: mix of Studio, 1BR, 2BR
  - Status distribution: 3 occupied, 1 vacant, 1 under renovation
  - 3 tenants with profiles and contact info
  - 3 active leases linked to occupied units
  - 6-10 past payment records (some paid, some pending)
  - 2-3 expense records
  - 1-2 maintenance requests

- [ ] **1.7.2** Add seed script to `package.json`
  - `"seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"`
  - Or use Prisma's built-in seed: `"prisma": { "seed": "ts-node prisma/seed.ts" }`
  - Run with: `npx prisma db seed`

---

## Testing & Validation

- [ ] **T.1** Verify all pages load without errors
- [ ] **T.2** Test CRUD for each entity (create, read, update, delete)
- [ ] **T.3** Test auth flow (login, protected routes, logout)
- [ ] **T.4** Test rent generation and mark-paid workflow
- [ ] **T.5** Verify dashboard shows accurate data
- [ ] **T.6** Test responsive layout on mobile viewport
- [ ] **T.7** Test edge cases: delete unit with tenants, create duplicate unit number, invalid form submissions

## Success Criteria (per SPEC.md)

- [ ] ✅ Can see status of all units in under 5 seconds (dashboard loads instantly)
- [ ] ✅ Zero confusion on which tenant owes rent for the current month (rent page is clear)
- [ ] ✅ Clear visibility into monthly net profit (dashboard shows collected vs expected)
