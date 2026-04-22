# Section 2.2 — Maintenance Tracking

## Goal
Log and track maintenance requests with priority levels, status workflow, and cost tracking.

---

## Task 2.2.1 — Create `/maintenance` Page (Maintenance List)

**What:** A board/table view of all maintenance requests with status and priority filters.

**Steps:**
1. Create `src/app/(dashboard)/maintenance/page.tsx`
2. Fetch maintenance requests from `GET /api/maintenance` on page load
3. Render maintenance requests in a responsive table:
   - Columns: Priority, Title, Unit, Status, Cost, Date Reported, Actions
   - Priority badges:
     - EMERGENCY: red background, white text
     - HIGH: red text, light red background
     - MEDIUM: yellow text, light yellow background
     - LOW: gray text, light gray background
   - Status badges:
     - REPORTED: blue
     - IN_PROGRESS: orange
     - COMPLETED: green
   - Cost column: shows ₱XX,XXX if cost is set, "—" if not
   - Actions column: View (link), Edit Status (dropdown), Delete (icon button)
   - Clicking row → navigates to maintenance detail
4. Add header section:
   - Page title: "Maintenance"
   - "New Request" button → navigates to `/maintenance/new`
5. Add filter bar:
   - Status filter: All / Reported / In Progress / Completed
   - Priority filter: All / Emergency / High / Medium / Low
   - Unit filter: All / [list of units]
6. Add summary cards at top:
   - Open requests count (REPORTED + IN_PROGRESS)
   - Emergency count
   - Total maintenance cost this month

**API Call:**
```
GET /api/maintenance?status=reported&priority=high&unitId=clxxx...
```

**Response Shape:**
```json
{
  "maintenance": [
    {
      "id": "clxxx...",
      "title": "Broken window latch",
      "description": "Living room window cannot close",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "cost": null,
      "createdAt": "2026-04-15T10:00:00Z",
      "unit": { "unitNumber": "2A", "type": "1BR" }
    }
  ],
  "summary": {
    "openCount": 3,
    "emergencyCount": 1,
    "totalCostThisMonth": "15000.00"
  }
}
```

**Acceptance Criteria:**
- Table renders all maintenance requests from database
- Priority badges show correct colors (EMERGENCY=red, HIGH=red-text, MEDIUM=yellow, LOW=gray)
- Status badges show correct colors
- Cost column shows amount or dash
- Filters work: status, priority, unit
- Summary cards show correct counts and totals
- "New Request" button navigates to `/maintenance/new`
- Empty state: "No maintenance requests. Create one."
- Loading skeleton shows while fetching

---

## Task 2.2.2 — Create `/maintenance/new` Page

**What:** Form to create a new maintenance request.

**Steps:**
1. Create `src/app/(dashboard)/maintenance/new/page.tsx`
2. Build form with these fields:
   - **Unit** — select dropdown, required, list all units
   - **Title** — text input, required, placeholder: "Brief description of the issue"
   - **Priority** — select dropdown, required: Emergency / High / Medium / Low
   - **Description** — textarea, required, placeholder: "Detailed description of the issue, including when it was first noticed"
3. Add validation with Zod schema:
   ```ts
   const maintenanceSchema = z.object({
     unitId: z.string().min(1, "Please select a unit"),
     title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
     priority: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"], {
       required_error: "Priority is required",
     }),
     description: z.string().min(1, "Description is required").max(1000, "Description must be under 1000 characters"),
   });
   ```
4. On submit:
   - Call `POST /api/maintenance` with form data
   - Show loading spinner on submit button
   - On success: show success toast, redirect to `/maintenance/[id]`
   - On error: show error message at top of form
5. Add "Cancel" button → navigates back to `/maintenance`
6. Create `src/components/maintenance/maintenance-form.tsx` — reusable form component
7. Add priority warning for EMERGENCY:
   - Red banner: "⚠️ Emergency requests should be used for urgent issues that affect safety or habitability (e.g., gas leaks, flooding, no heat)."

**API Call:**
```
POST /api/maintenance
Body: { unitId, title, priority, description }
```

**Acceptance Criteria:**
- Form renders with all fields and labels
- Unit dropdown populated from database
- Priority dropdown has all 4 levels
- Emergency priority shows warning banner
- Title has 100 character limit
- Description has 1000 character limit with counter
- Validation shows inline errors for all required fields
- Successful submit shows toast and redirects to maintenance detail
- Cancel button navigates back to maintenance list
- Form is accessible (labels, keyboard navigation)

---

## Task 2.2.3 — Create `/maintenance/[id]` Detail View

**What:** Single-page view of a maintenance request's full information.

**Steps:**
1. Create `src/app/(dashboard)/maintenance/[id]/page.tsx`
2. Fetch maintenance request data + related unit data on mount
3. Layout:
   - **Top section:** Request info card
     - Priority badge (large, colored)
     - Title (large heading)
     - Status badge (editable via dropdown)
     - Unit (clickable link to unit detail)
     - Description
     - Cost (editable inline, see below)
     - Date reported
     - Date completed (if status is COMPLETED)
   - **Status workflow section:**
     - Visual timeline: Reported → In Progress → Completed
     - Current step highlighted
     - Buttons to advance status (only if allowed):
       - "Start Work" (REPORTED → IN_PROGRESS)
       - "Mark Complete" (IN_PROGRESS → COMPLETED)
   - **Cost tracking section:**
     - If cost is null: "Cost not yet recorded" + "Add Cost" button
     - If cost is set: shows amount + "Edit Cost" button
     - "Add Cost" opens inline form: cost amount + notes
   - **Action buttons:**
     - "Edit Request" → `/maintenance/[id]/edit`
     - "Delete Request" (danger) → confirmation modal
     - "View Unit" → `/units/[unitId]`
     - "Back to Maintenance" → `/maintenance`
4. Create `src/components/maintenance/status-timeline.tsx`:
   - Visual 3-step progress indicator
   - Each step: circle with number + label
   - Current and past steps filled/highlighted
   - Future steps grayed out
5. Create `src/components/maintenance/cost-editor.tsx`:
   - Inline form for adding/editing cost
   - Shows current cost if exists
   - Amount input + optional notes
   - Save/Cancel buttons

**Data Fetching:**
```ts
const maintenance = await prisma.maintenanceRequest.findUnique({
  where: { id },
  include: {
    unit: true,
  },
});
```

**Acceptance Criteria:**
- All request info displays correctly
- Priority badge is colored appropriately
- Status badge is clickable (dropdown to change status)
- Status timeline shows current step correctly
- Status progression buttons only show valid transitions:
  - REPORTED → IN_PROGRESS (button: "Start Work")
  - IN_PROGRESS → COMPLETED (button: "Mark Complete")
  - No button shown if already COMPLETED
- Cost editor shows "Add Cost" if null, "Edit Cost" if set
- Cost updates save to database
- Edit button navigates to edit page
- Delete button shows confirmation modal
- Loading skeleton shows while fetching

---

## Task 2.2.4 — Create `/maintenance/[id]/edit` Page

**What:** Form to edit an existing maintenance request.

**Steps:**
1. Create `src/app/(dashboard)/maintenance/[id]/edit/page.tsx`
2. Fetch maintenance data on mount using `params.id`
3. Pre-populate form with existing values
4. Same fields as new maintenance form
5. On submit:
   - Call `PATCH /api/maintenance/[id]` with updated values
   - On success: show toast, redirect to `/maintenance/[id]` (detail view)
6. Add "Cancel" button → navigates back to `/maintenance/[id]`

**API Call:**
```
PATCH /api/maintenance/[id]
Body: { unitId?, title?, priority?, description? }
```

**Acceptance Criteria:**
- Form pre-populates with existing maintenance data
- All fields editable
- Validation works the same as new form
- Successful edit shows toast and redirects to detail view
- Cancel navigates back to detail view

---

## Task 2.2.5 — Create API Routes for Maintenance

**What:** RESTful API endpoints for maintenance CRUD and status updates.

**Steps:**

### `POST /api/maintenance` — Create Maintenance Request
1. Create `src/app/api/maintenance/route.ts`
2. Validate body with Zod schema
3. Create maintenance request in database with unit relation
4. Return 201 with created request

### `GET /api/maintenance` — List Maintenance Requests
1. Create `src/app/api/maintenance/route.ts` (add GET handler)
2. Read query params: `status`, `priority`, `unitId`
3. Build Prisma query with filters
4. Calculate summary: openCount, emergencyCount, totalCostThisMonth
5. Return requests array + summary

### `PATCH /api/maintenance/[id]` — Update Maintenance Request
1. Create `src/app/api/maintenance/[id]/route.ts`
2. Accept body: `{ status?, cost?, title?, priority?, description? }`
3. Find request by ID, return 404 if not found
4. Update fields:
   - If `status` changes to COMPLETED: set completion timestamp
   - If `cost` is provided: update cost field
   - If other fields: update normally
5. Return updated request

**Status Transition Validation:**
```ts
// Allowed transitions:
// REPORTED → IN_PROGRESS
// IN_PROGRESS → COMPLETED
// No reverse transitions allowed
const validTransitions: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  REPORTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [], // terminal state
};
```

### `DELETE /api/maintenance/[id]` — Delete Maintenance Request
1. Create `src/app/api/maintenance/[id]/route.ts` (add DELETE handler)
2. Find request by ID, return 404 if not found
3. Delete request
4. Return 200 with success message

**Acceptance Criteria:**
- `POST /api/maintenance` returns 201 on success
- `GET /api/maintenance` returns filtered requests with summary
- `PATCH /api/maintenance/[id]` updates status with validation:
  - REPORTED → IN_PROGRESS: allowed
  - IN_PROGRESS → COMPLETED: allowed
  - COMPLETED → anything: rejected with 400
  - REPORTED → COMPLETED (skip): rejected with 400
- `DELETE /api/maintenance/[id]` returns 200 on success, 404 if not found
- All routes protected by auth
- All responses are valid JSON with consistent shape
- `npm run lint` passes

---

## Summary Checklist

- [ ] Task 2.2.1 — Maintenance list page with table, priority/status filters, summary
- [ ] Task 2.2.2 — New maintenance request form with priority warning
- [ ] Task 2.2.3 — Maintenance detail with status timeline, cost tracking
- [ ] Task 2.2.4 — Edit maintenance form
- [ ] Task 2.2.5 — All 4 API routes (POST, GET, PATCH, DELETE) with status validation
