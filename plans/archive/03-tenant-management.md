# Section 1.3 — Tenant Management

## Goal
Full CRUD for tenants with profile views and linked lease/payment history.

---

## Task 1.3.1 — Create `/tenants` Page (Tenant List)

**What:** A table listing all tenants with search and filter.

**Steps:**
1. Create `src/app/(dashboard)/tenants/page.tsx`
2. Fetch tenants from `GET /api/tenants` on page load
3. Render tenants in a responsive table:
   - Columns: Name, Email, Phone, Linked Unit, Lease Status, Actions
   - Action column: View (link), Edit (link), Delete (icon button with confirmation)
   - Clicking name or row → navigates to `/tenants/[id]`
4. Add header section:
   - Page title: "Tenants"
   - "Add Tenant" button → navigates to `/tenants/new`
5. Add search bar:
   - Search input: filter by name, email, or phone
   - Filters update URL query param (`?q=juan`)
6. Create `src/components/tenants/tenant-table.tsx` — the table component
7. Create `src/components/tenants/tenant-search.tsx` — search input component

**API Call:**
```
GET /api/tenants?q=juan
```

**Response Shape:**
```json
{
  "tenants": [
    {
      "id": "clxxx...",
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "email": "juan@example.com",
      "phone": "09171234567",
      "unit": { "unitNumber": "1A", "type": "1BR" },
      "activeLease": { "status": "ACTIVE", "endDate": "2026-12-31" }
    }
  ]
}
```

**Acceptance Criteria:**
- Table renders all tenants from database
- All columns display correctly
- Clicking a row navigates to tenant detail
- Search filters tenants by name/email/phone (client-side)
- "Add Tenant" button navigates to `/tenants/new`
- Delete button shows confirmation modal
- Empty state: "No tenants yet. Add your first tenant."
- Loading skeleton shows while fetching
- Table is responsive (horizontal scroll on mobile)

---

## Task 1.3.2 — Create `/tenants/new` Page

**What:** Form to add a new tenant.

**Steps:**
1. Create `src/app/(dashboard)/tenants/new/page.tsx`
2. Build form with these fields:
   - **First Name** — text input, required
   - **Last Name** — text input, required
   - **Email** — email input, required, unique (validated on submit)
   - **Phone** — text input, optional, format: 09XXXXXXXXX
   - **Emergency Contact** — text input, optional
3. Add validation with Zod schema:
   ```ts
   const tenantSchema = z.object({
     firstName: z.string().min(1, "First name is required"),
     lastName: z.string().min(1, "Last name is required"),
     email: z.string().email("Invalid email address"),
     phone: z.string().optional(),
     emergencyContact: z.string().optional(),
   });
   ```
4. On submit:
   - Call `POST /api/tenants` with form data
   - Show loading spinner on submit button
   - On success: show success toast, redirect to `/tenants/[id]` (detail page)
   - On error: show error message at top of form (e.g., duplicate email)
5. Add "Cancel" button → navigates back to `/tenants`
6. Create `src/components/tenants/tenant-form.tsx` — reusable form component

**API Call:**
```
POST /api/tenants
Body: { firstName, lastName, email, phone?, emergencyContact? }
```

**Acceptance Criteria:**
- Form renders with all fields and labels
- Required field validation shows inline errors
- Invalid email format shows error
- Submitting empty form shows all validation errors
- Successful submit shows toast and redirects to detail page
- Duplicate email shows error: "Email already exists"
- Cancel button navigates back to tenant list
- Phone field is optional (can be empty)
- Form is accessible (labels, keyboard navigation)

---

## Task 1.3.3 — Create `/tenants/[id]` Detail View

**What:** Single-page view of a tenant's full profile.

**Steps:**
1. Create `src/app/(dashboard)/tenants/[id]/page.tsx`
2. Fetch tenant data + related data (lease, payments) on mount
3. Layout:
   - **Top section:** Tenant profile card
     - Full name (large heading)
     - Email with mailto: link
     - Phone with tel: link
     - Emergency contact (if provided)
     - Created / Updated dates
     - Edit button (top right)
   - **Middle section:** Active Lease card
     - If has active lease: show unit, dates, rent amount, status
     - If no active lease: show "No active lease"
     - Link to `/leases/[leaseId]`
   - **Bottom section:** Payment History table
     - Columns: Date, Amount, Status, Method
     - Last 10 payments
     - Status badges (PAID/PENDING/OVERDUE)
     - Total paid sum at bottom
4. Action buttons at top:
   - "Edit Tenant" → `/tenants/[id]/edit`
   - "Create Lease" → `/leases/new` (pre-selects this tenant)
   - "View Unit" → `/units/[unitId]` (if has active lease)
   - "Back to Tenants" → `/tenants`

**Data Fetching:**
```ts
const tenant = await prisma.tenant.findUnique({
  where: { id },
  include: {
    unit: true,
    leases: {
      where: { status: "ACTIVE" },
      include: { unit: true },
    },
    payments: {
      include: { unit: true },
      orderBy: { date: "desc" },
      take: 10,
    },
  },
});
```

**Acceptance Criteria:**
- All tenant info displays correctly
- Email and phone are clickable links
- Lease section shows active lease or "No active lease"
- Payment history shows last 10 payments with status badges
- Total paid amount calculated and displayed
- Edit button navigates to edit page
- Create Lease button pre-selects this tenant
- View Unit navigates to linked unit (if exists)
- Loading skeleton shows while fetching

---

## Task 1.3.4 — Create `/tenants/[id]/edit` Page

**What:** Form to edit an existing tenant.

**Steps:**
1. Create `src/app/(dashboard)/tenants/[id]/edit/page.tsx`
2. Fetch tenant data on mount using `params.id`
3. Pre-populate form with existing values
4. Same fields as new tenant form
5. On submit:
   - Call `PATCH /api/tenants/[id]` with updated values
   - On success: show toast, redirect to `/tenants/[id]` (detail view)
6. Add "Cancel" button → navigates back to `/tenants/[id]`
7. Add "Delete Tenant" button (danger variant) at bottom:
   - Opens confirmation modal
   - On confirm: call `DELETE /api/tenants/[id]`
   - Only allow delete if no active leases exist

**API Call:**
```
PATCH /api/tenants/[id]
Body: { firstName?, lastName?, email?, phone?, emergencyContact? }
```

**Acceptance Criteria:**
- Form pre-populates with existing tenant data
- All fields editable
- Validation works the same as new form
- Successful edit shows toast and redirects to detail view
- Delete button shows confirmation modal
- Delete fails gracefully if tenant has active leases
- Cancel navigates back to detail view

---

## Task 1.3.5 — Create API Routes for Tenants

**What:** RESTful API endpoints for tenant CRUD operations.

**Steps:**

### `POST /api/tenants` — Create Tenant
1. Create `src/app/api/tenants/route.ts`
2. Validate body with Zod schema
3. Check if email already exists
4. Create tenant in database
5. Return 201 with created tenant

### `GET /api/tenants` — List Tenants
1. Create `src/app/api/tenants/route.ts` (add GET handler)
2. Read query param: `q` (search)
3. Build Prisma query:
   - `OR` search: `firstName`, `lastName`, `email`, `phone` contain search string
4. Return array of tenants with `unit` and `activeLease`

### `PATCH /api/tenants/[id]` — Update Tenant
1. Create `src/app/api/tenants/[id]/route.ts`
2. Validate body with Zod schema (all fields optional)
3. Find tenant by ID, return 404 if not found
4. Update tenant with provided fields
5. Return updated tenant

### `DELETE /api/tenants/[id]` — Delete Tenant
1. Create `src/app/api/tenants/[id]/route.ts` (add DELETE handler)
2. Check if tenant has any active leases
3. If active leases exist → return 409: "Cannot delete tenant with active leases"
4. If no active leases → delete tenant
5. Return 200 with success message

**Acceptance Criteria:**
- `POST /api/tenants` returns 201 on success, 409 on duplicate email
- `GET /api/tenants` returns all tenants, respects `q` search param
- `PATCH /api/tenants/[id]` updates only provided fields, returns 404 if not found
- `DELETE /api/tenants/[id]` returns 409 if tenant has active leases, 200 on success
- All routes protected by auth (middleware checks session)
- All responses are valid JSON with consistent shape
- `npm run lint` passes

---

## Summary Checklist

- [x] Task 1.3.1 — Tenant list page with table, search
- [x] Task 1.3.2 — New tenant form with validation
- [x] Task 1.3.3 — Tenant detail view with lease + payment history
- [x] Task 1.3.4 — Edit tenant form with delete option
- [x] Task 1.3.5 — All 4 API routes (POST, GET, PATCH, DELETE)
