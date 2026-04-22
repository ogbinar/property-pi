# Section 1.6 — Dashboard (Home Page)

## Goal
Single-page overview showing all important property management data at a glance.

---

## Task 1.6.1 — Replace Default Page with Dashboard

**What:** Replace the boilerplate `page.tsx` with a real dashboard layout.

**Steps:**
1. Replace `src/app/(dashboard)/page.tsx`
2. Create new layout:
   - Welcome header: "Welcome back, [User Name]" + current month/year
   - Grid layout:
     - Top row: 4 metric cards (2x2 grid on desktop, 1 column on mobile)
     - Middle row: Unit Status Overview (full width)
     - Bottom row: Recent Activity + Upcoming Expirations (side by side)
3. Use CSS Grid for responsive layout:
   - Desktop: `grid-cols-4` for metrics, `grid-cols-2` for bottom row
   - Mobile: `grid-cols-1` for everything
4. Fetch all dashboard data from `GET /api/dashboard` on mount

**Acceptance Criteria:**
- Page renders without errors
- Grid layout is responsive (desktop 2-col, mobile 1-col)
- All data cards show loading skeletons while fetching
- All data cards show empty states if no data exists
- Welcome message shows logged-in user's name
- `npm run lint` passes

---

## Task 1.6.2 — Unit Status Overview Card

**What:** Visual grid showing all units with color-coded status.

**Steps:**
1. Create `src/components/dashboard/unit-status-grid.tsx`
2. Fetch units from `GET /api/dashboard` (returns unit counts + unit list)
3. Render a grid of unit cards:
   - Each card shows:
     - Unit number (large, bold)
     - Type (small text below)
     - Status badge (color-coded)
   - Clickable → navigates to `/units/[id]`
4. Color coding:
   - OCCUPIED: green border/background tint
   - VACANT: gray border/background tint
   - MAINTENANCE: orange border/background tint
   - UNDER_RENOVATION: blue border/background tint
5. If no units exist: show "No units configured" message with "Add Unit" button
6. If more than 5 units: show first 5 with "View all units" link

**Acceptance Criteria:**
- Grid shows all units (up to 5 for the 5-unit focus)
- Each card is color-coded by status
- Cards are clickable and navigate to unit detail
- Status badge text matches the enum value
- Empty state shows when no units exist
- Loading skeleton shows while fetching

---

## Task 1.6.3 — Monthly Revenue Card

**What:** Show collected vs. expected rent for the current month.

**Steps:**
1. Create `src/components/dashboard/revenue-card.tsx`
2. Data from `GET /api/dashboard`:
   ```ts
   {
     "collected": "30000.00",
     "expected": "45000.00",
     "rate": 0.67  // 67%
   }
   ```
3. Display:
   - Title: "Monthly Revenue"
   - Subtitle: "[Month Year]" (e.g., "April 2026")
   - Two large numbers:
     - "Collected: ₱30,000"
     - "Expected: ₱45,000"
   - Progress bar: green fill at 67%
   - Small text below progress bar: "67% collected"
4. Format currency with `Intl.NumberFormat`:
   ```ts
   const formatPeso = (amount: string | number) => {
     return new Intl.NumberFormat("fil-PH", {
       style: "currency",
       currency: "PHP",
       minimumFractionDigits: 0,
     }).format(Number(amount));
   };
   // Result: "₱30,000"
   ```
5. If no data: show "No revenue recorded yet"

**Acceptance Criteria:**
- Shows collected and expected amounts in Philippine Peso format
- Progress bar fills proportionally to collection rate
- Percentage text shown below progress bar
- Month/year subtitle matches current month
- Empty state shows when no payments exist
- Loading skeleton shows while fetching

---

## Task 1.6.4 — Occupancy Rate Card

**What:** Show current occupancy percentage and unit count.

**Steps:**
1. Create `src/components/dashboard/occupancy-card.tsx`
2. Data from `GET /api/dashboard`:
   ```ts
   {
     "rate": 0.80,    // 80%
     "occupied": 4,
     "total": 5
   }
   ```
3. Display:
   - Title: "Occupancy Rate"
   - Large percentage number: "80%" (font-size 3xl or 4xl)
   - Subtitle: "4 of 5 units occupied"
   - Color-coded by rate:
     - ≥80%: green
     - 50-79%: yellow
     - <50%: red
4. Add a mini bar chart:
   - 5 dots/blocks representing each unit
   - Filled (green) for occupied, gray for vacant
   - Visual representation at a glance
5. If no units: show "No units configured"

**Acceptance Criteria:**
- Percentage displays correctly (rounded to nearest whole number)
- Subtitle shows "X of Y units occupied"
- Color changes based on occupancy rate thresholds
- Mini dot chart shows visual representation
- Color coding: green ≥80%, yellow 50-79%, red <50%
- Empty state shows when no units exist
- Loading skeleton shows while fetching

---

## Task 1.6.5 — Recent Activity Feed

**What:** Show the last 5 activities across all models.

**Steps:**
1. Create `src/components/dashboard/activity-feed.tsx`
2. Data from `GET /api/dashboard`:
   ```ts
   {
     "activities": [
       {
         "type": "payment",
         "message": "Juan Dela Cruz paid ₱15,000 rent",
         "timestamp": "2026-04-15T10:30:00Z",
         "link": "/rent"
       },
       {
         "type": "lease",
         "message": "Unit 2B lease renewed",
         "timestamp": "2026-04-14T14:00:00Z",
         "link": "/leases/xxx"
       },
       {
         "type": "maintenance",
         "message": "New maintenance request: leak in Unit 3A",
         "timestamp": "2026-04-13T09:15:00Z",
         "link": "/maintenance"
       }
     ]
   }
   ```
3. Display:
   - Title: "Recent Activity"
   - List of last 5 activities
   - Each item shows:
     - Icon based on type (💰 payment, 📄 lease, 🔧 maintenance)
     - Message text
     - Relative time: "2 hours ago", "3 days ago"
   - Each item is clickable → navigates to related page
4. Create time formatting utility:
   ```ts
   export function timeAgo(date: Date | string): string {
     const now = new Date();
     const then = new Date(date);
     const diffMs = now.getTime() - then.getTime();
     const diffMins = Math.floor(diffMs / 60000);
     const diffHours = Math.floor(diffMs / 3600000);
     const diffDays = Math.floor(diffMs / 86400000);
     if (diffMins < 1) return "Just now";
     if (diffMins < 60) return `${diffMins}m ago`;
     if (diffHours < 24) return `${diffHours}h ago`;
     if (diffDays < 7) return `${diffDays}d ago`;
     return formatDate(then, "MMM d");
   }
   ```
5. If no activities: show "No recent activity"

**Acceptance Criteria:**
- Shows last 5 activities (or fewer if less exist)
- Each activity has appropriate icon
- Relative time displays correctly ("2h ago", "3d ago")
- Each item is clickable and navigates to related page
- Empty state shows when no activities exist
- Loading skeleton shows while fetching

---

## Task 1.6.6 — Upcoming Expirations Card

**What:** Show leases expiring in the next 60 days, grouped by urgency.

**Steps:**
1. Create `src/components/dashboard/expirations-card.tsx`
2. Data from `GET /api/dashboard`:
   ```ts
   {
     "expirations": [
       {
         "unitNumber": "1A",
         "tenantName": "Juan Dela Cruz",
         "endDate": "2026-04-30",
         "daysRemaining": 13,
         "urgency": "critical"  // 0-15 days
       },
       {
         "unitNumber": "3B",
         "tenantName": "Maria Santos",
         "endDate": "2026-05-15",
         "daysRemaining": 28,
         "urgency": "warning"   // 16-30 days
       }
     ]
   }
   ```
3. Display:
   - Title: "Upcoming Expirations"
   - Subtitle: "Next 60 days"
   - List of expiring leases, grouped by urgency:
     - **Critical (0-15 days):** red background tint, "⚠️" icon
     - **Warning (16-30 days):** yellow background tint, "⏰" icon
     - **Upcoming (31-60 days):** blue background tint, "📅" icon
   - Each item shows:
     - Unit number + tenant name
     - Days remaining (large number)
     - End date
   - "View all leases" link → navigates to `/leases`
4. If no upcoming expirations: show "No leases expiring in the next 60 days"

**Acceptance Criteria:**
- Shows leases expiring within 60 days
- Items grouped by urgency with correct colors and icons
- Days remaining calculated correctly
- End date displayed in readable format
- "View all leases" link navigates to /leases
- Empty state shows when no expirations in next 60 days
- Loading skeleton shows while fetching

---

## Task 1.6.7 — Create `GET /api/dashboard`

**What:** Single endpoint that aggregates all dashboard data in one call.

**Steps:**
1. Create `src/app/api/dashboard/route.ts`
2. Implement aggregation logic:

   **Unit counts by status:**
   ```ts
   const unitCounts = await prisma.unit.groupBy({
     by: ["status"],
     _count: { status: true },
   });
   // Result: [{ status: "OCCUPIED", _count: { status: 3 } }, ...]
   ```

   **Monthly revenue:**
   ```ts
   const startDate = startOfMonth(new Date());
   const endDate = endOfMonth(new Date());
   const [payments, allUnits] = await Promise.all([
     prisma.payment.findMany({
       where: { date: { gte: startDate, lte: endDate } },
       select: { amount: true, status: true },
     }),
     prisma.unit.findMany({ select: { id: true, rentAmount: true } }),
   ]);
   const collected = payments
     .filter(p => p.status === "PAID")
     .reduce((sum, p) => sum + Number(p.amount), 0);
   const expected = allUnits.reduce((sum, u) => sum + Number(u.rentAmount), 0);
   ```

   **Occupancy rate:**
   ```ts
   const occupiedCount = unitCounts
     .find(u => u.status === "OCCUPIED")?._count.status ?? 0;
   const totalCount = allUnits.length;
   const rate = totalCount > 0 ? occupiedCount / totalCount : 0;
   ```

   **Recent activities (last 5 across models):**
   ```ts
   const [recentPayments, recentLeases, recentMaintenance] = await Promise.all([
     prisma.payment.findMany({ orderBy: { date: "desc" }, take: 3, include: { unit: true } }),
     prisma.lease.findMany({ orderBy: { createdAt: "desc" }, take: 1, include: { tenant: true, unit: true } }),
     prisma.maintenanceRequest.findMany({ orderBy: { createdAt: "desc" }, take: 1, include: { unit: true } }),
   ]);
   // Combine and sort by timestamp, take 5
   ```

   **Upcoming expirations:**
   ```ts
   const futureDate = addDays(new Date(), 60);
   const expirations = await prisma.lease.findMany({
     where: {
       endDate: { gte: new Date(), lte: futureDate },
       status: "ACTIVE",
     },
     include: { tenant: true, unit: true },
     orderBy: { endDate: "asc" },
   });
   // Add daysRemaining and urgency to each
   ```

3. Assemble response:
   ```ts
   return json({
     units: {
       occupied: occupiedCount,
       vacant: vacantCount,
       maintenance: maintenanceCount,
       underRenovation: renovationCount,
       total: totalCount,
     },
     revenue: {
       collected: collected.toString(),
       expected: expected.toString(),
       rate: Math.round(rate * 100),
     },
     occupancy: {
       rate: Math.round(rate * 100),
       occupied: occupiedCount,
       total: totalCount,
     },
     activities: [...],
     expirations: [...],
   });
   ```

4. Use `Promise.all` for parallel queries to minimize response time

**Acceptance Criteria:**
- Returns all dashboard data in a single response
- Unit counts accurate (sum matches total units)
- Revenue totals correct (collected ≤ expected)
- Occupancy rate matches unit counts
- Activities sorted by timestamp, limited to 5
- Expirations sorted by date, limited to 60 days
- Response time under 200ms (uses `Promise.all` for parallel queries)
- All routes protected by auth
- Returns 200 with valid JSON

---

## Summary Checklist

- [x] Task 1.6.1 — Dashboard page layout with grid
- [x] Task 1.6.2 — Unit Status Overview component
- [x] Task 1.6.3 — Monthly Revenue component
- [x] Task 1.6.4 — Occupancy Rate component
- [x] Task 1.6.5 — Recent Activity Feed component
- [x] Task 1.6.6 — Upcoming Expirations component
- [x] Task 1.6.7 — Dashboard aggregation API endpoint
