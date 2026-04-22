# Section 1.5 — Rent Tracking

## Goal
Monthly rent generation, marking payments, and overdue tracking.

---

## Task 1.5.1 — Create `/rent` Page (Rent Overview)

**What:** Monthly rent table showing all units, tenants, amounts, and payment status.

**Steps:**
1. Create `src/app/(dashboard)/rent/page.tsx`
2. Default view: current month (use `date-fns` to get current month/year)
3. Fetch rent records from `GET /api/rent/[month]/[year]` on mount
4. Layout:
   - **Header:**
     - Page title: "Rent"
     - Month/year picker (dropdown or date picker) to navigate between months
     - "Generate Rent" button → bulk creates records for all occupied units
   - **Rent Table:**
     - Columns: Unit, Tenant, Rent Amount, Status, Due Date, Actions
     - Status badges: PAID (green), PENDING (yellow), OVERDUE (red), PARTIAL (orange)
     - Overdue indicator: "X days overdue" text in red
     - Actions column: "Mark Paid" button (for PENDING/OVERDUE records)
   - **Summary Footer:**
     - Total Expected: sum of all rent amounts
     - Total Collected: sum of PAID amounts
     - Total Outstanding: Expected - Collected
     - Display as: "₱XX,XXX / ₱XX,XXX collected"

5. Create `src/components/rent/rent-table.tsx` — the table component
6. Create `src/components/rent/rent-summary.tsx` — summary card component
7. Create `src/components/rent/month-picker.tsx` — month/year navigation

**API Call:**
```
GET /api/rent/4/2026
```

**Response Shape:**
```json
{
  "month": 4,
  "year": 2026,
  "payments": [
    {
      "id": "clxxx...",
      "amount": "15000.00",
      "date": "2026-04-02",
      "status": "PAID",
      "method": "Transfer",
      "dueDate": "2026-04-05",
      "unit": { "unitNumber": "1A", "type": "1BR" },
      "tenant": { "firstName": "Juan", "lastName": "Dela Cruz" }
    }
  ],
  "summary": {
    "totalExpected": "45000.00",
    "totalCollected": "30000.00",
    "totalOutstanding": "15000.00",
    "overdueCount": 1
  }
}
```

**Acceptance Criteria:**
- Table renders all rent records for selected month
- Status badges show correct colors
- Overdue payments show red badge + days overdue text
- Summary footer shows correct totals
- Month picker navigates between months
- "Generate Rent" button triggers bulk creation
- Clicking "Mark Paid" opens quick-pay modal
- Empty state: "No rent records for this month. Click 'Generate Rent' to create."
- Loading skeleton shows while fetching

---

## Task 1.5.2 — Create `POST /api/rent/[unitId]/mark-paid`

**What:** Quick action to mark a unit's rent as paid for the current month.

**Steps:**
1. Create `src/app/api/rent/[unitId]/mark-paid/route.ts`
2. Accept body:
   ```ts
   {
     amount?: number,        // defaults to unit's rentAmount
     method?: "Cash" | "Transfer" | "Check",
     date?: string,          // ISO date string, defaults to today
   }
   ```
3. Logic:
   - Find the unit
   - Find or create a Payment record for the current month
   - If payment exists: update status to PAID, set amount/method/date
   - If payment doesn't exist: create new payment with defaults
   - Set due date = 5th of current month
4. Return 200 with created/updated payment

**Acceptance Criteria:**
- Marking paid creates payment if none exists for the month
- Marking paid updates existing PENDING payment
- Amount defaults to unit's rentAmount if not provided
- Date defaults to today if not provided
- Method defaults to "Transfer" if not provided
- Returns 404 if unit not found
- Returns 400 if amount is 0 or negative
- All routes protected by auth

---

## Task 1.5.3 — Create `POST /api/rent/generate`

**What:** Bulk generate rent records for all occupied units for the current month.

**Steps:**
1. Create `src/app/api/rent/generate/route.ts`
2. Logic:
   - Find all units with status = OCCUPIED
   - For each occupied unit:
     - Check if a payment already exists for the current month
     - If no payment exists: create one with:
       - amount = unit's rentAmount
       - status = PENDING
       - date = today
       - dueDate = 5th of current month
       - method = "Transfer" (default)
   - Return list of created payments
3. Return 200 with:
   ```json
   {
     "created": 3,
     "skipped": 1,
     "payments": [...]
   }
   ```

**Acceptance Criteria:**
- Generates payments for all OCCUPIED units
- Skips units that already have a payment for the month
- Skipped count reflects units with existing payments
- Created payments have correct amount, status PENDING, due date = 5th
- Returns count of created and skipped
- Returns 200 even if 0 units are occupied (empty array)
- All routes protected by auth

---

## Task 1.5.4 — Overdue Indicators

**What:** Automatically detect and display overdue payments.

**Steps:**
1. In `GET /api/rent/[month]/[year]` route:
   - For each payment with status PENDING:
     - Compare current date with due date
     - If current date > due date: set status to OVERDUE and update in DB
   - Calculate days overdue: `differenceInDays(now, dueDate)`
   - Include `daysOverdue` field in response

2. In the rent table UI (`src/components/rent/rent-table.tsx`):
   - If payment is OVERDUE:
     - Show red badge: "OVERDUE"
     - Show red text: "X days overdue"
   - If payment is PENDING and due date is within 3 days:
     - Show yellow warning: "Due in X days"
   - If payment is PAID:
     - Show green badge: "PAID" + date paid

3. Create a utility function `src/lib/utils.ts`:
   ```ts
   export function getPaymentStatusInfo(payment: Payment) {
     if (payment.status === "PAID") return { variant: "success", label: "PAID" };
     if (payment.status === "OVERDUE") return { variant: "error", label: "OVERDUE", days: daysOverdue };
     if (payment.status === "PARTIAL") return { variant: "info", label: "PARTIAL" };
     const daysUntilDue = differenceInDays(payment.dueDate, new Date());
     if (daysUntilDue <= 3) return { variant: "warning", label: "Due Soon", days: daysUntilDue };
     return { variant: "default", label: "PENDING" };
   }
   ```

**Acceptance Criteria:**
- PENDING payments past due date are auto-updated to OVERDUE on API call
- Overdue payments show red badge + days overdue text
- Payments due within 3 days show "Due Soon" warning
- PAID payments show green badge + date paid
- Overdue status persists across page refreshes (stored in DB)
- `npm run lint` passes

---

## Task 1.5.5 — Create `GET /api/rent/[month]/[year]`

**What:** Fetch all payment records for a given month/year.

**Steps:**
1. Create `src/app/api/rent/[month]/[year]/route.ts`
2. Parse month and year from URL params
3. Build date range:
   - Start: first day of month at 00:00:00
   - End: last day of month at 23:59:59
4. Query payments within date range:
   ```ts
   const payments = await prisma.payment.findMany({
     where: {
       date: {
         gte: startDate,
         lte: endDate,
       },
     },
     include: {
       unit: { select: { unitNumber: true, type: true } },
     },
     orderBy: { date: "desc" },
   });
   ```
5. For each payment, calculate:
   - `dueDate`: 5th of the month (if not set, use 5th)
   - `daysOverdue`: if PENDING and past dueDate, calculate days
   - `tenant`: join through unit to get tenant info
6. Calculate summary:
   - `totalExpected`: sum of all payment amounts
   - `totalCollected`: sum of PAID payment amounts
   - `totalOutstanding`: totalExpected - totalCollected
   - `overdueCount`: count of OVERDUE payments
7. Return response with payments array and summary

**Acceptance Criteria:**
- Returns payments for the specified month/year
- Payments include unit and tenant info
- Due dates calculated correctly (5th of month)
- Overdue detection works (PENDING + past due = OVERDUE)
- Summary totals are accurate
- Returns 400 if month/year is invalid
- Returns empty array (not error) if no payments for the month
- All routes protected by auth

---

## Summary Checklist

- [x] Task 1.5.1 — Rent page with monthly table, summary, month picker
- [x] Task 1.5.2 — Mark-paid API endpoint (quick action)
- [x] Task 1.5.3 — Generate rent API endpoint (bulk creation)
- [x] Task 1.5.4 — Overdue detection + UI indicators
- [x] Task 1.5.5 — Rent by month/year API endpoint
