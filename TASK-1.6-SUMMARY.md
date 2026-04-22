# Task 1.6 — Dashboard (Complete)

## Summary

Single-page overview showing all important property management data at a glance.

## What was built

### API Endpoint (Task 1.6.7)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/dashboard` | GET | Aggregates all dashboard data in one call using `Promise.all` |

**Data returned:**
- Unit counts by status (occupied, vacant, maintenance, under_renovation)
- Monthly revenue (collected vs expected, collection rate %)
- Occupancy rate (percentage + unit counts)
- Recent activities (last 5 across payments, leases, maintenance)
- Upcoming expirations (leases expiring in next 60 days with urgency)

### Components (Tasks 1.6.2–1.6.6)
| Component | Path | Description |
|-----------|------|-------------|
| **Unit Status Grid** | `components/dashboard/unit-status-grid.tsx` | Color-coded unit cards, auto-fetches from `/api/units` |
| **Revenue Card** | `components/dashboard/revenue-card.tsx` | Collected vs expected, progress bar, PHP formatting |
| **Occupancy Card** | `components/dashboard/occupancy-card.tsx` | Large percentage, color-coded (green/yellow/red), mini dot chart |
| **Activity Feed** | `components/dashboard/activity-feed.tsx` | Last 5 activities with icons, relative time, clickable links |
| **Expirations Card** | `components/dashboard/expirations-card.tsx` | Leases expiring in 60 days, urgency grouping (critical/warning/upcoming) |

### Dashboard Page (Task 1.6.1)
| Page | Path | Description |
|------|------|-------------|
| **Dashboard** | `/` | Responsive grid layout with welcome header, 4 metric cards, unit status, activity + expirations |

**Layout:**
- Top: Welcome message with user name + current date
- Row 1: Revenue Card + Occupancy Card (2-col desktop, 1-col mobile)
- Row 2: Unit Status Grid (full width, 5-col desktop)
- Row 3: Activity Feed + Expirations Card (2-col desktop, 1-col mobile)

## Key features
- **Responsive design**: Grid adapts from mobile (1-col) to desktop (2-3-5 cols)
- **Loading skeletons**: Pulse animations while fetching data
- **Empty states**: Contextual messages with CTAs when no data exists
- **Currency formatting**: PHP/₱ using `Intl.NumberFormat("fil-PH")`
- **Time formatting**: Relative time ("2h ago", "3d ago") for activities
- **Urgency grouping**: Critical (0-15d), Warning (16-30d), Upcoming (31-60d)
- **Color coding**: Green (≥80%), Yellow (50-79%), Red (<50%) for occupancy
- **Parallel queries**: `Promise.all` for fast dashboard data aggregation
- **Auto-fetching**: UnitStatusGrid fetches its own data independently

## Verification
- ✅ `tsc --noEmit` — zero errors
- ✅ `npm run lint` — zero warnings
- ✅ Dev server starts successfully

## Next: Task 1.3 — Tenant Management (full CRUD)
