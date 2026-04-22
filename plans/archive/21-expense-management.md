# Section 2.1 — Expense Management

## Goal
Log and categorize property expenses with receipt attachments and unit-level tracking.

---

## Task 2.1.1 — Create `/expenses` Page (Expense List)

**What:** A table listing all expenses with filters, categories, and totals.

**Steps:**
1. Create `src/app/(dashboard)/expenses/page.tsx`
2. Fetch expenses from `GET /api/expenses` on page load
3. Render expenses in a responsive table:
   - Columns: Date, Unit, Category, Description, Amount, Receipt, Actions
   - Category badges with colors:
     - Repairs: orange
     - Utilities: blue
     - Taxes: purple
     - Insurance: green
     - Other: gray
   - Receipt column: shows 📎 icon if receiptUrl exists, "—" if not
   - Actions column: Edit (link), Delete (icon button with confirmation)
   - Clicking row → navigates to expense detail
4. Add header section:
   - Page title: "Expenses"
   - "Add Expense" button → navigates to `/expenses/new`
5. Add filter bar:
   - Month/year picker (default: current month)
   - Category filter dropdown: All / Repairs / Utilities / Taxes / Insurance / Other
   - Unit filter dropdown: All / [list of units]
6. Add summary bar at top:
   - Total this month: ₱XX,XXX
   - Total by category (small pill badges with amounts)

**API Call:**
```
GET /api/expenses?month=4&year=2026&category=Repairs&unitId=clxxx...
```

**Response Shape:**
```json
{
  "expenses": [
    {
      "id": "clxxx...",
      "amount": "3500.00",
      "category": "Repairs",
      "description": "Fixed leaking faucet",
      "date": "2026-04-10",
      "receiptUrl": "https://...",
      "unit": { "unitNumber": "1A" }
    }
  ],
  "summary": {
    "total": "23700.00",
    "byCategory": {
      "Repairs": "3500.00",
      "Utilities": "8200.00",
      "Taxes": "12000.00"
    }
  }
}
```

**Acceptance Criteria:**
- Table renders all expenses from database
- Category badges show correct colors
- Receipt column shows icon or dash
- Filters work: month/year, category, unit
- Summary bar shows correct totals
- "Add Expense" button navigates to `/expenses/new`
- Empty state: "No expenses recorded. Add your first expense."
- Loading skeleton shows while fetching

---

## Task 2.1.2 — Create `/expenses/new` Page

**What:** Form to add a new expense.

**Steps:**
1. Create `src/app/(dashboard)/expenses/new/page.tsx`
2. Build form with these fields:
   - **Unit** — select dropdown, required, list all units
   - **Category** — select dropdown, required: Repairs / Utilities / Taxes / Insurance / Other
   - **Amount** — number input, required, min 0.01
   - **Date** — date input, required, default: today
   - **Description** — text input, required, placeholder: "What was this expense for?"
   - **Receipt** — file upload input, optional
     - Accept: image/*, application/pdf
     - Max size: 5MB
     - Shows file name after selection
     - Preview thumbnail for images
3. Add validation with Zod schema:
   ```ts
   const expenseSchema = z.object({
     unitId: z.string().min(1, "Please select a unit"),
     category: z.string().min(1, "Category is required"),
     amount: z.coerce.number().positive("Amount must be greater than 0"),
     date: z.date({ required_error: "Date is required" }),
     description: z.string().min(1, "Description is required"),
     receipt: z.instanceof(File).optional(),
   });
   ```
4. On submit:
   - If receipt file exists: upload to storage first (see Task 2.4), get URL
   - Call `POST /api/expenses` with form data + receipt URL
   - Show loading spinner on submit button
   - On success: show success toast, redirect to `/expenses`
   - On error: show error message at top of form
5. Add "Cancel" button → navigates back to `/expenses`
6. Create `src/components/expenses/expense-form.tsx` — reusable form component

**API Call:**
```
POST /api/expenses
Body: { unitId, category, amount, date, description, receiptUrl? }
```

**Acceptance Criteria:**
- Form renders with all fields and labels
- Unit dropdown populated from database
- Category dropdown has all 5 categories + Other
- Amount field accepts decimals (e.g., 1250.50)
- Date defaults to today
- Receipt upload accepts images and PDFs up to 5MB
- File preview shows for selected images
- Validation shows inline errors for all required fields
- Successful submit shows toast and redirects to expense list
- Cancel button navigates back to expense list
- Form is accessible (labels, keyboard navigation)

---

## Task 2.1.3 — Create `/expenses/[id]` Detail View

**What:** Single-page view of an expense's full information.

**Steps:**
1. Create `src/app/(dashboard)/expenses/[id]/page.tsx`
2. Fetch expense data + related unit data on mount
3. Layout:
   - **Top section:** Expense info card
     - Category badge (large, colored)
     - Amount (large, bold, e.g., "₱3,500")
     - Date
     - Unit (clickable link to unit detail)
     - Description
     - Receipt (clickable link, opens in new tab)
     - Created date
   - **Action buttons:**
     - "Edit Expense" → `/expenses/[id]/edit`
     - "Delete Expense" (danger) → confirmation modal
     - "View Unit" → `/units/[unitId]`
     - "Back to Expenses" → `/expenses`
4. Create `src/components/expenses/receipt-viewer.tsx`:
   - If receiptUrl is an image: render in `<Image>` component
   - If receiptUrl is a PDF: embed with `<iframe>` or link to download
   - Show "Download Receipt" button
5. Create `src/components/expenses/expense-card.tsx` — info card component

**Acceptance Criteria:**
- All expense info displays correctly
- Category badge is colored appropriately
- Amount is formatted in Philippine Peso
- Unit name is a clickable link to unit detail
- Receipt opens in new tab (or previews inline for images)
- Delete button shows confirmation modal
- Cancel navigates back to expense list
- Loading skeleton shows while fetching

---

## Task 2.1.4 — Create `/expenses/[id]/edit` Page

**What:** Form to edit an existing expense.

**Steps:**
1. Create `src/app/(dashboard)/expenses/[id]/edit/page.tsx`
2. Fetch expense data on mount using `params.id`
3. Pre-populate form with existing values
4. Same fields as new expense form
5. On submit:
   - Call `PATCH /api/expenses/[id]` with updated values
   - If new receipt uploaded: upload to storage, replace old URL
   - On success: show toast, redirect to `/expenses/[id]` (detail view)
6. Add "Cancel" button → navigates back to `/expenses/[id]`

**API Call:**
```
PATCH /api/expenses/[id]
Body: { unitId?, category?, amount?, date?, description?, receiptUrl? }
```

**Acceptance Criteria:**
- Form pre-populates with existing expense data
- All fields editable
- New receipt upload replaces old receipt URL
- Validation works the same as new form
- Successful edit shows toast and redirects to detail view
- Cancel navigates back to detail view

---

## Task 2.1.5 — Create API Routes for Expenses

**What:** RESTful API endpoints for expense CRUD operations.

**Steps:**

### `POST /api/expenses` — Create Expense
1. Create `src/app/api/expenses/route.ts`
2. Validate body with Zod schema
3. Create expense in database with unit relation
4. Return 201 with created expense

### `GET /api/expenses` — List Expenses
1. Create `src/app/api/expenses/route.ts` (add GET handler)
2. Read query params: `month`, `year`, `category`, `unitId`
3. Build Prisma query with filters:
   - `date` range filter (month/year)
   - `category` exact match
   - `unitId` exact match
4. Calculate summary: total + byCategory
5. Return expenses array + summary

### `PATCH /api/expenses/[id]` — Update Expense
1. Create `src/app/api/expenses/[id]/route.ts`
2. Validate body with Zod schema (all fields optional)
3. Find expense by ID, return 404 if not found
4. Update expense with provided fields
5. Return updated expense

### `DELETE /api/expenses/[id]` — Delete Expense
1. Create `src/app/api/expenses/[id]/route.ts` (add DELETE handler)
2. Find expense by ID, return 404 if not found
3. Delete expense
4. Return 200 with success message

**Acceptance Criteria:**
- `POST /api/expenses` returns 201 on success
- `GET /api/expenses` returns filtered expenses with summary totals
- `PATCH /api/expenses/[id]` updates only provided fields, returns 404 if not found
- `DELETE /api/expenses/[id]` returns 200 on success, 404 if not found
- All routes protected by auth
- All responses are valid JSON with consistent shape
- `npm run lint` passes

---

## Summary Checklist

- [ ] Task 2.1.1 — Expense list page with table, filters, summary
- [ ] Task 2.1.2 — New expense form with receipt upload
- [ ] Task 2.1.3 — Expense detail view with receipt preview
- [ ] Task 2.1.4 — Edit expense form
- [ ] Task 2.1.5 — All 4 API routes (POST, GET, PATCH, DELETE)
