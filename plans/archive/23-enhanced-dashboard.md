# Section 2.3 — Enhanced Dashboard (Expense Breakdown & Net Profit)

## Goal
Upgrade the dashboard from Phase 1 to include expense tracking, net profit calculation, and financial summaries.

---

## Task 2.3.1 — Add Expense Breakdown Card to Dashboard

**What:** Show a breakdown of expenses by category on the dashboard.

**Steps:**
1. Update `src/app/(dashboard)/page.tsx` — add new card to the grid layout
2. Create `src/components/dashboard/expense-breakdown.tsx`
3. Fetch expense data from `GET /api/dashboard` (updated endpoint, see 2.3.7)
4. Display:
   - Title: "Expenses This Month"
   - Total expenses (large number): "₱XX,XXX"
   - Breakdown by category (list with amounts):
     - 🛠️ Repairs: ₱X,XXX
     - 💧 Utilities: ₱X,XXX
     - 📋 Taxes: ₱X,XXX
     - 🛡️ Insurance: ₱X,XXX
     - 📦 Other: ₱X,XXX
   - Mini bar chart showing category proportions (optional, using recharts)
5. If no expenses: show "No expenses recorded this month"
6. Add "View all expenses" link → `/expenses`

**Data from API:**
```ts
{
  "expenses": {
    "total": "23700.00",
    "byCategory": {
      "Repairs": "3500.00",
      "Utilities": "8200.00",
      "Taxes": "12000.00",
      "Insurance": "0.00",
      "Other": "0.00"
    }
  }
}
```

**Acceptance Criteria:**
- Card displays total expenses for current month
- Category breakdown shows correct amounts
- Categories with ₱0 are hidden or shown as "—"
- "View all expenses" link navigates to /expenses
- Empty state shows when no expenses exist
- Loading skeleton shows while fetching

---

## Task 2.3.2 — Add Net Profit Card to Dashboard

**What:** Show net profit (revenue minus expenses) for the current month.

**Steps:**
1. Update `src/app/(dashboard)/page.tsx` — add new card to the grid layout
2. Create `src/components/dashboard/net-profit.tsx`
3. Calculate net profit from dashboard API data:
   ```ts
   const netProfit = collectedRevenue - totalExpenses;
   ```
4. Display:
   - Title: "Net Profit"
   - Subtitle: "[Month Year]"
   - Large number showing net profit:
     - Positive: green, e.g., "₱21,300"
     - Negative: red, e.g., "-₱3,200"
     - Zero: gray, e.g., "₱0"
   - Breakdown below:
     - Income: ₱XX,XXX (green)
     - Expenses: -₱XX,XXX (red)
     - Net: ₱XX,XXX (colored by sign)
   - Optional: profit margin percentage (net / expected revenue * 100)
5. If no data: show "No data yet"

**Acceptance Criteria:**
- Net profit calculated correctly (revenue - expenses)
- Positive profit shown in green
- Negative profit shown in red with minus sign
- Income and expense breakdown shown below
- Profit margin percentage shown if revenue > 0
- Empty state shows when no data exists
- Loading skeleton shows while fetching

---

## Task 2.3.3 — Add Monthly Trend Chart to Dashboard

**What:** Show revenue vs. expenses trend over the last 6 months.

**Steps:**
1. Update `src/app/(dashboard)/page.tsx` — add new card to the grid layout (span 2 columns on desktop)
2. Create `src/components/dashboard/trend-chart.tsx`
3. Fetch 6-month historical data from `GET /api/dashboard` (updated endpoint)
4. Use `recharts` to render a line/bar combo chart:
   - X-axis: months (last 6 months)
   - Y-axis: amount (₱)
   - Two lines:
     - Revenue: green line
     - Expenses: red line
   - Fill area under each line (semi-transparent)
   - Tooltip showing exact values on hover
5. Display:
   - Title: "6-Month Trend"
   - Legend: Revenue (green), Expenses (red)
   - Net profit line (optional, blue dashed)
6. If less than 2 months of data: show "Not enough data for trends"

**Data from API:**
```ts
{
  "trends": [
    { month: "Nov 2025", revenue: 36000, expenses: 12000 },
    { month: "Dec 2025", revenue: 36000, expenses: 8500 },
    { month: "Jan 2026", revenue: 36000, expenses: 15000 },
    { month: "Feb 2026", revenue: 30000, expenses: 9200 },
    { month: "Mar 2026", revenue: 31000, expenses: 11000 },
    { month: "Apr 2026", revenue: 30000, expenses: 23700 },
  ]
}
```

**Acceptance Criteria:**
- Chart renders last 6 months of data
- Revenue line is green, expenses line is red
- Tooltip shows exact values on hover
- Legend is visible
- Chart is responsive (resizes with container)
- Shows "Not enough data" message if < 2 months of data
- Loading skeleton shows while fetching

---

## Task 2.3.4 — Add Per-Unit Profitability Card to Dashboard

**What:** Show revenue minus expenses per unit, ranked by profitability.

**Steps:**
1. Update `src/app/(dashboard)/page.tsx` — add new card to the grid layout
2. Create `src/components/dashboard/unit-profitability.tsx`
3. Fetch per-unit data from `GET /api/dashboard` (updated endpoint)
4. Display as a table:
   - Columns: Unit, Income, Expenses, Net Profit
   - Sort by net profit (highest first)
   - Net profit column colored: green if positive, red if negative
5. Summary at bottom:
   - Total portfolio net profit
   - Most profitable unit
   - Least profitable unit
6. Clicking a unit row → navigates to `/units/[id]`

**Data from API:**
```ts
{
  "unitProfitability": [
    {
      "unitNumber": "1A",
      "income": "12000",
      "expenses": "1500",
      "netProfit": "10500"
    },
    {
      "unitNumber": "1B",
      "income": "15000",
      "expenses": "0",
      "netProfit": "15000"
    },
    {
      "unitNumber": "2A",
      "income": "16000",
      "expenses": "3500",
      "netProfit": "12500"
    },
  ]
}
```

**Acceptance Criteria:**
- Table shows all units with income, expenses, and net profit
- Units sorted by net profit (highest first)
- Net profit column colored by sign
- Clicking a row navigates to unit detail
- Summary shows total portfolio net profit
- Loading skeleton shows while fetching

---

## Task 2.3.5 — Add Maintenance Costs Card to Dashboard

**What:** Show maintenance spending this month and open request count.

**Steps:**
1. Update `src/app/(dashboard)/page.tsx` — add new card to the grid layout
2. Create `src/components/dashboard/maintenance-summary.tsx`
3. Fetch maintenance data from `GET /api/dashboard` (updated endpoint)
4. Display:
   - Title: "Maintenance"
   - Open requests count: "3 open" (REPORTED + IN_PROGRESS)
   - Emergency count (if > 0): "🔴 1 emergency" (red badge)
   - Total maintenance cost this month: "₱XX,XXX"
   - List of open requests (up to 3):
     - Title, unit number, priority badge
5. "View all maintenance" link → `/maintenance`
6. If no open requests and no costs: show "All clear — no open maintenance requests"

**Acceptance Criteria:**
- Shows open request count correctly
- Emergency count shown in red if > 0
- Maintenance cost this month shown
- Up to 3 open requests listed with priority
- "View all maintenance" link navigates to /maintenance
- Empty state shows when everything is clear
- Loading skeleton shows while fetching

---

## Task 2.3.6 — Update Dashboard Layout for New Cards

**What:** Rearrange the dashboard grid to accommodate new Phase 2 cards.

**Steps:**
1. Update `src/app/(dashboard)/page.tsx` layout
2. New grid structure:
   ```
   Row 1 (metrics):     [Revenue] [Occupancy] [Net Profit] [Maintenance]
   Row 2 (wide):        [Unit Status Overview] (full width)
   Row 3 (wide):        [6-Month Trend Chart] (full width)
   Row 4 (split):       [Expense Breakdown] | [Unit Profitability]
   Row 5 (split):       [Recent Activity] | [Upcoming Expirations]
   ```
3. Responsive behavior:
   - Desktop (≥1024px): 4-column grid for Row 1, 2-column for Rows 4-5
   - Tablet (768-1023px): 2-column grid for Row 1, full width for most cards
   - Mobile (<768px): 1-column stack for everything
4. Each card maintains consistent sizing and padding

**Acceptance Criteria:**
- Grid layout renders correctly at all breakpoints
- All 10 dashboard cards visible and properly sized
- Cards don't overflow or overlap
- Responsive layout works at 320px, 768px, 1024px, 1440px
- `npm run lint` passes

---

## Task 2.3.7 — Update `GET /api/dashboard` Endpoint

**What:** Extend the dashboard API to include expense, trend, and profitability data.

**Steps:**
1. Update `src/app/api/dashboard/route.ts`
2. Add new queries using `Promise.all` for parallel execution:

   **Expense breakdown:**
   ```ts
   const expenses = await prisma.expense.findMany({
     where: { date: { gte: startDate, lte: endDate } },
     select: { amount: true, category: true },
   });
   const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
   const byCategory = expenses.reduce((acc, e) => {
     acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
     return acc;
   }, {} as Record<string, number>);
   ```

   **6-month trends:**
   ```ts
   const sixMonthsAgo = subMonths(new Date(), 6);
   const monthlyData = await prisma.$queryRaw`
     SELECT
       DATE_TRUNC('month', date)::date as month,
       SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) as revenue,
       (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', e.date)) as expenses
     FROM payments p
     WHERE date >= ${sixMonthsAgo}
     GROUP BY DATE_TRUNC('month', date)
     ORDER BY month
   `;
   ```

   **Per-unit profitability:**
   ```ts
   const units = await prisma.unit.findMany({
     include: {
       payments: {
         where: { date: { gte: startDate, lte: endDate } },
         select: { amount: true, status: true },
       },
       expenses: {
         where: { date: { gte: startDate, lte: endDate } },
         select: { amount: true },
       },
     },
   });
   const unitProfitability = units.map(unit => {
     const income = unit.payments
       .filter(p => p.status === "PAID")
       .reduce((sum, p) => sum + Number(p.amount), 0);
     const expenses = unit.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
     return {
       unitNumber: unit.unitNumber,
       income: income.toString(),
       expenses: expenses.toString(),
       netProfit: (income - expenses).toString(),
     };
   });
   ```

3. Update response shape to include:
   ```ts
   return json({
     // ... existing Phase 1 data ...
     expenses: { total, byCategory },
     trends: monthlyData,
     unitProfitability,
     maintenance: { openCount, emergencyCount, totalCost, openRequests },
   });
   ```

4. Use `Promise.all` for all parallel queries

**Acceptance Criteria:**
- API returns all Phase 1 data + new Phase 2 data
- Expense breakdown is accurate for current month
- 6-month trends include at least 2 months of data (or empty array)
- Per-unit profitability calculated correctly (income - expenses)
- Maintenance summary includes open count, emergency count, costs
- Response time under 300ms (uses `Promise.all` for parallel queries)
- All routes protected by auth
- Returns 200 with valid JSON

---

## Summary Checklist

- [ ] Task 2.3.1 — Expense breakdown card
- [ ] Task 2.3.2 — Net profit card
- [ ] Task 2.3.3 — 6-month trend chart (recharts)
- [ ] Task 2.3.4 — Per-unit profitability table
- [ ] Task 2.3.5 — Maintenance summary card
- [ ] Task 2.3.6 — Updated dashboard grid layout
- [ ] Task 2.3.7 — Extended dashboard API endpoint
