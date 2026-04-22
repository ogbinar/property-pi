# Section 1.2 — Unit Management

## Goal
Full CRUD for units with visual status tracking and detail views.

---

## Task 1.2.1 — Create `/units` Page (Unit List)

**What:** A visual card grid showing all units with status badges.

**Steps:**
1. Create `src/app/(dashboard)/units/page.tsx`
2. Fetch units from `GET /api/units` on page load (use `useEffect` or server component with `fetch`)
3. Render units in a responsive grid:
   - Desktop: 3-column grid
   - Tablet: 2-column grid
   - Mobile: 1-column stack
4. Each **UnitCard** shows:
   - Unit number (large, bold)
   - Type (e.g., "1BR")
   - Status badge (color-coded)
   - Monthly rent (₱XX,XXX)
   - Current tenant name (if occupied), or "Vacant" text
   - Clickable → navigates to `/units/[id]`
5. Add header section:
   - Page title: "Units"
   - "Add Unit" button → navigates to `/units/new`
6. Add filter bar:
   - Search input: filter by unit number
   - Status filter dropdown: All / Occupied / Vacant / Maintenance / Under Renovation
   - Filters update URL query params (`?status=occupied&q=2A`)
7. Create `src/components/units/unit-card.tsx` — the card component
8. Create `src/components/units/unit-grid.tsx` — grid wrapper with filters

**API Call:**
```
GET /api/units?status=occupied&q=2A
```

**Response Shape:**
```json
{
  "units": [
    {
      "id": "clxxx...",
      "unitNumber": "1A",
      "type": "1BR",
      "status": "OCCUPIED",
      "rentAmount": "15000.00",
      "securityDeposit": "30000.00",
      "currentTenant": { "firstName": "Juan", "lastName": "Dela Cruz" },
      "activeLease": { "endDate": "2026-12-31" }
    }
  ]
}
```

**Acceptance Criteria:**
- Grid renders all units from database
- Status badges show correct colors
- Clicking a card navigates to `/units/[id]`
- Search filters units by unit number (client-side)
- Status filter dropdown filters units (client-side)
- "Add Unit" button navigates to `/units/new`
- Empty state shows when no units exist: "No units yet. Add your first unit."
- Loading skeleton shows while fetching

---

## Task 1.2.2 — Create `/units/new` Page

**What:** Form to add a new unit.

**Steps:**
1. Create `src/app/(dashboard)/units/new/page.tsx`
2. Build form with these fields:
   - **Unit Number** — text input, required, unique (validated on submit)
   - **Type** — select dropdown: Studio / 1BR / 2BR / 3BR / Other
   - **Monthly Rent** — number input, required, min 1
   - **Security Deposit** — number input, required, min 0
3. Add validation with Zod schema:
   ```ts
   const unitSchema = z.object({
     unitNumber: z.string().min(1, "Unit number is required"),
     type: z.string().min(1, "Type is required"),
     rentAmount: z.coerce.number().positive("Rent must be greater than 0"),
     securityDeposit: z.coerce.number().min(0, "Deposit cannot be negative"),
   });
   ```
4. On submit:
   - Call `POST /api/units` with form data
   - Show loading spinner on submit button
   - On success: show success toast, redirect to `/units`
   - On error: show error message at top of form
5. Add "Cancel" button → navigates back to `/units`
6. Create `src/components/units/unit-form.tsx` — reusable form component

**API Call:**
```
POST /api/units
Body: { unitNumber, type, rentAmount, securityDeposit }
```

**Acceptance Criteria:**
- Form renders with all fields and labels
- Required field validation shows inline errors
- Submitting empty form shows all validation errors
- Successful submit shows toast and redirects to `/units`
- Duplicate unit number shows error: "Unit number already exists"
- Cancel button navigates back to unit list
- Form is accessible (labels, keyboard navigation)

---

## Task 1.2.3 — Create `/units/[id]/edit` Page

**What:** Form to edit an existing unit.

**Steps:**
1. Create `src/app/(dashboard)/units/[id]/edit/page.tsx`
2. Fetch unit data on mount using `params.id`
3. Pre-populate form with existing values
4. Same fields as new unit form, but:
   - Unit number is **disabled** (cannot change after creation)
   - Show a note: "Unit number cannot be changed"
5. On submit:
   - Call `PATCH /api/units/[id]` with updated values
   - On success: show toast, redirect to `/units/[id]` (detail view)
6. Add "Cancel" button → navigates back to `/units/[id]`
7. Add "Delete Unit" button (danger variant) at bottom:
   - Opens confirmation modal
   - On confirm: call `DELETE /api/units/[id]`
   - Only allow delete if unit has no tenants or leases (or show warning if cascade allowed)

**API Call:**
```
PATCH /api/units/[id]
Body: { type?, rentAmount?, securityDeposit? }
```

**Acceptance Criteria:**
- Form pre-populates with existing unit data
- Unit number field is disabled with note
- Validation works the same as new form
- Successful edit shows toast and redirects to detail view
- Delete button shows confirmation modal
- Delete fails gracefully if unit has linked tenants/leases
- Cancel navigates back to detail view

---

## Task 1.2.4 — Create `/units/[id]` Detail View

**What:** Single-page view of a unit's full information.

**Steps:**
1. Create `src/app/(dashboard)/units/[id]/page.tsx`
2. Fetch unit data + related data (tenant, lease, payments) on mount
3. Layout:
   - **Top section:** Unit info card
     - Unit number (large heading)
     - Type badge
     - Status badge (editable via dropdown)
     - Monthly rent
     - Security deposit
     - Created / Updated dates
     - Edit button (top right)
   - **Middle section:** Current Tenant card
     - If occupied: show tenant name, email, phone, lease dates
     - If vacant: show "No tenant" with "Assign Tenant" button
   - **Bottom section:** Active Lease card
     - Lease ID, start date, end date, rent amount at signing, status
     - Link to `/leases/[leaseId]`
4. Action buttons at top:
   - "Edit Unit" → `/units/[id]/edit`
   - "Create Lease" → `/leases/new` (pre-selects this unit)
   - "Back to Units" → `/units`

**Data Fetching:**
```ts
// Fetch unit with relations
const unit = await prisma.unit.findUnique({
  where: { id },
  include: {
    tenants: { where: { unitId: id } },
    leases: { where: { status: "ACTIVE" }, orderBy: { startDate: "desc" } },
    payments: { orderBy: { date: "desc" }, take: 5 },
  },
});
```

**Acceptance Criteria:**
- All unit info displays correctly
- Status badge is clickable (opens dropdown to change status)
- Tenant section shows data if occupied, "Vacant" message if not
- Lease section shows active lease or "No active lease"
- Payment section shows last 5 payments with amount and date
- Edit button navigates to edit page
- Create Lease button navigates to lease creation with unit pre-selected
- Loading skeleton shows while fetching

---

## Task 1.2.5 — Create API Routes for Units

**What:** RESTful API endpoints for unit CRUD operations.

**Steps:**

### `POST /api/units` — Create Unit
1. Create `src/app/api/units/route.ts`
2. Validate body with Zod schema
3. Check if unit number already exists
4. Create unit in database
5. Return 201 with created unit

### `GET /api/units` — List Units
1. Create `src/app/api/units/route.ts` (add GET handler)
2. Read query params: `status`, `q` (search)
3. Build Prisma query with filters:
   - `status` filter if provided
   - `unitNumber` contains search if provided
4. Return array of units with `currentTenant` and `activeLease` computed

### `PATCH /api/units/[id]` — Update Unit
1. Create `src/app/api/units/[id]/route.ts`
2. Validate body with Zod schema (all fields optional)
3. Find unit by ID, return 404 if not found
4. Update unit with provided fields
5. Return updated unit

### `DELETE /api/units/[id]` — Delete Unit
1. Create `src/app/api/units/[id]/route.ts` (add DELETE handler)
2. Check if unit has any tenants or leases
3. If linked records exist → return 409 with message: "Cannot delete unit with active tenants or leases"
4. If no links → delete unit
5. Return 200 with success message

**Acceptance Criteria:**
- `POST /api/units` returns 201 on success, 409 on duplicate unit number
- `GET /api/units` returns all units, respects `status` and `q` query params
- `PATCH /api/units/[id]` updates only provided fields, returns 404 if not found
- `DELETE /api/units/[id]` returns 409 if unit has tenants/leases, 200 on success
- All routes protected by auth (middleware checks session)
- All responses are valid JSON with consistent shape
- `npm run lint` passes

---

## Execution Notes

- **API routes:** All 4 endpoints implemented with auth protection, Zod validation, and consistent error handling
- **Rent adjustments:** PATCH route automatically creates `RentAdjustment` records when rent changes
- **Delete protection:** Units with active tenants or leases cannot be deleted (409 conflict)
- **Unit card:** Shows status badge, rent, tenant info, and lease end date
- **Detail view:** Displays unit info, current tenant, active lease, and last 5 payments
- **Edit page:** Includes inline edit form, status dropdown, and danger zone with delete modal
- **Toast notifications:** Sonner Toaster integrated in root layout
- **TypeScript:** Zero errors, zero lint warnings

## Summary Checklist

- [x] Task 1.2.1 — Unit list page with card grid, filters, search
- [x] Task 1.2.2 — New unit form with validation
- [x] Task 1.2.3 — Edit unit form with delete option
- [x] Task 1.2.4 — Unit detail view with tenant/lease/payment info
- [x] Task 1.2.5 — All 4 API routes (POST, GET, PATCH, DELETE)
