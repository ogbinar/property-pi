# Section 1.4 — Lease Management

## Goal
Create and track leases with lifecycle status management.

---

## Task 1.4.1 — Create `/leases` Page (Lease List)

**What:** A table listing all leases with status badges and filters.

**Steps:**
1. Create `src/app/(dashboard)/leases/page.tsx`
2. Fetch leases from `GET /api/leases` on page load
3. Render leases in a responsive table:
   - Columns: Tenant, Unit, Start Date, End Date, Status, Actions
   - Status badges: ACTIVE (green), EXPIRED (gray), TERMINATED (red), RENEWAL_PENDING (yellow)
   - Action column: View (link), Renew (link), Terminate (link with confirmation)
   - Clicking row → navigates to `/leases/[id]`
4. Add header section:
   - Page title: "Leases"
   - "Create Lease" button → navigates to `/leases/new`
5. Add filter bar:
   - Status filter dropdown: All / Active / Expired / Renewal Pending / Terminated
   - Updates URL query param (`?status=active`)
6. Create `src/components/leases/lease-table.tsx` — the table component
7. Create `src/components/leases/lease-filters.tsx` — filter component

**API Call:**
```
GET /api/leases?status=active
```

**Response Shape:**
```json
{
  "leases": [
    {
      "id": "clxxx...",
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "rentAmount": "15000.00",
      "status": "ACTIVE",
      "tenant": { "firstName": "Juan", "lastName": "Dela Cruz" },
      "unit": { "unitNumber": "1A", "type": "1BR" }
    }
  ]
}
```

**Acceptance Criteria:**
- Table renders all leases from database
- Status badges show correct colors
- Clicking a row navigates to lease detail
- Status filter dropdown filters leases (client-side)
- "Create Lease" button navigates to `/leases/new`
- Empty state: "No leases yet. Create your first lease."
- Loading skeleton shows while fetching
- Table is responsive (horizontal scroll on mobile)

---

## Task 1.4.2 — Create `/leases/new` Page

**What:** Form to create a new lease linking a tenant and unit.

**Steps:**
1. Create `src/app/(dashboard)/leases/new/page.tsx`
2. Build form with these sections:

   **Step 1: Select Tenant**
   - Select dropdown: list all tenants
   - Shows: "Juan Dela Cruz — 09171234567"
   - Required, with search/filter

   **Step 2: Select Unit**
   - Select dropdown: list all units
   - Shows: "Unit 1A — 1BR — ₱15,000/mo"
   - Required
   - Auto-populates rent amount from unit's current rentAmount

   **Step 3: Lease Details**
   - Start Date — date input, required, default: today
   - End Date — date input, required, default: 1 year from start
   - Rent Amount — number input, pre-filled from unit's rent, editable
   - Notes — textarea, optional

3. Add validation with Zod schema:
   ```ts
   const leaseSchema = z.object({
     tenantId: z.string().min(1, "Please select a tenant"),
     unitId: z.string().min(1, "Please select a unit"),
     startDate: z.date({ required_error: "Start date is required" }),
     endDate: z.date({ required_error: "End date is required" }),
     rentAmount: z.coerce.number().positive("Rent must be greater than 0"),
     notes: z.string().optional(),
   });
   ```

4. Business logic validation:
   - End date must be after start date
   - Unit must be vacant OR have an expiring lease (end date within 30 days)
   - If unit already has an active lease, show warning before allowing creation
   - Rent amount should match unit's current rent (allow override with confirmation)

5. On submit:
   - Call `POST /api/leases` with form data
   - On success: update unit status to OCCUPIED, show success toast, redirect to `/leases/[id]`
   - On error: show error message at top of form

6. Add "Cancel" button → navigates back to `/leases`
7. Create `src/components/leases/lease-form.tsx` — reusable form component

**API Call:**
```
POST /api/leases
Body: { tenantId, unitId, startDate, endDate, rentAmount }
```

**Acceptance Criteria:**
- Form renders with all 3 steps/sections
- Tenant dropdown populated from database
- Unit dropdown populated from database
- Rent amount auto-populates from selected unit
- Validation prevents end date before start date
- Warning shown if unit already has active lease
- Successful create updates unit status to OCCUPIED
- Success toast + redirect to lease detail
- Cancel button navigates back to lease list
- Form is accessible (labels, keyboard navigation)

---

## Task 1.4.3 — Create `/leases/[id]` Detail View

**What:** Single-page view of a lease's full information.

**Steps:**
1. Create `src/app/(dashboard)/leases/[id]/page.tsx`
2. Fetch lease data + related data (tenant, unit, payments) on mount
3. Layout:
   - **Top section:** Lease info card
     - Tenant name + Unit number (large heading)
     - Status badge (editable via dropdown)
     - Start date → End date (date range)
     - Monthly rent amount
     - Duration: "12 months" (calculated)
     - Created / Updated dates
     - Action buttons row
   - **Middle section:** Payment History table
     - Columns: Date, Amount, Status, Method
     - All payments linked to this lease's unit
     - Status badges
     - Total collected sum
   - **Bottom section:** Documents (placeholder for Phase 3)
     - "No documents uploaded yet" message
     - "Upload" button (disabled, Phase 3 feature)
4. Action buttons:
   - "Renew" → opens renewal modal (see below)
   - "Terminate" → opens confirmation modal
   - "View Tenant" → `/tenants/[tenantId]`
   - "View Unit" → `/units/[unitId]`
   - "Back to Leases" → `/leases`

5. **Renewal Modal** (`src/components/leases/renewal-modal.tsx`):
   - Title: "Renew Lease"
   - New Start Date (default: day after current end date)
   - New End Date (default: 1 year from new start)
   - New Rent Amount (editable, default: current rent)
   - Confirm button → PATCH status to RENEWAL_PENDING, then to ACTIVE

**Data Fetching:**
```ts
const lease = await prisma.lease.findUnique({
  where: { id },
  include: {
    tenant: true,
    unit: true,
    payments: {
      orderBy: { date: "desc" },
    },
  },
});
```

**Acceptance Criteria:**
- All lease info displays correctly
- Status badge is clickable (dropdown to change status)
- Payment history shows all payments with status badges
- Total collected amount calculated and displayed
- Renewal opens modal with pre-filled dates
- Terminate opens confirmation modal
- View Tenant/Unit navigates to respective pages
- Loading skeleton shows while fetching

---

## Task 1.4.4 — Create API Routes for Leases

**What:** RESTful API endpoints for lease CRUD operations.

**Steps:**

### `POST /api/leases` — Create Lease
1. Create `src/app/api/leases/route.ts`
2. Validate body with Zod schema
3. Check unit availability:
   - If unit has active lease, verify it's expiring within 30 days or get explicit override
4. Create lease in database with tenantId, unitId, dates, rentAmount
5. Update unit status to OCCUPIED
6. Return 201 with created lease

### `GET /api/leases` — List Leases
1. Create `src/app/api/leases/route.ts` (add GET handler)
2. Read query param: `status`
3. Build Prisma query with status filter
4. Include tenant and unit data
5. Return array of leases

### `PATCH /api/leases/[id]` — Update Lease
1. Create `src/app/api/leases/[id]/route.ts`
2. Accept body: `{ status?, endDate?, rentAmount? }`
3. Find lease by ID, return 404 if not found
4. Update lease fields
5. If status changes to EXPIRED or TERMINATED:
   - Check if this is the only active lease for the unit
   - If yes, update unit status to VACANT
6. If status changes to RENEWAL_PENDING:
   - Keep unit status as OCCUPIED
7. Return updated lease

**Acceptance Criteria:**
- `POST /api/leases` returns 201 on success, creates lease + updates unit status
- `GET /api/leases` returns all leases, respects `status` query param
- `PATCH /api/leases/[id]` updates status/fields, manages unit status accordingly
- Creating lease with occupied unit shows warning but allows with override
- Terminating lease auto-vacates the unit if no other active lease
- All routes protected by auth
- All responses are valid JSON with consistent shape
- `npm run lint` passes

---

## Summary Checklist

- [ ] Task 1.4.1 — Lease list page with table, status badges, filters
- [ ] Task 1.4.2 — New lease form with tenant/unit selection, validation
- [ ] Task 1.4.3 — Lease detail view with payment history, renewal/terminate actions
- [ ] Task 1.4.4 — All 3 API routes (POST, GET, PATCH)
