# Task 1.2 — Unit Management (Complete)

## Summary

Full CRUD for units with visual status tracking, detail views, and API routes.

## What was built

### API Routes (Task 1.2.5)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/units` | GET | List units with `status` and `q` query filters |
| `/api/units` | POST | Create unit (Zod validated, 409 on duplicate) |
| `/api/units/[id]` | GET | Single unit with tenant, lease, and payment relations |
| `/api/units/[id]` | PATCH | Update unit (auto-creates RentAdjustment on rent change) |
| `/api/units/[id]` | DELETE | Delete unit (409 if has tenants/leases) |

All routes are auth-protected, Zod-validated, and return consistent JSON shapes.

### Pages (Tasks 1.2.1–1.2.4)
| Page | Path | Description |
|------|------|-------------|
| Unit List | `/units` | Responsive card grid (1/2/3 cols), search, status filter, empty state |
| New Unit | `/units/new` | Form with validation, toast on success, redirect to list |
| Unit Detail | `/units/[id]` | Unit info, current tenant card, active lease card, recent payments |
| Edit Unit | `/units/[id]/edit` | Pre-populated form, disabled unit number, delete modal with confirmation |

### Components
| Component | Path | Description |
|-----------|------|-------------|
| UnitCard | `components/units/unit-card.tsx` | Status badge, rent, tenant, lease end date |
| UnitForm | `components/units/unit-form.tsx` | Reusable form with Zod validation, type select, loading state |

## Key features
- **Responsive grid**: 3-column desktop, 2-column tablet, 1-column mobile
- **Status badges**: Color-coded (Occupied=green, Vacant=gray, Maintenance=yellow, Under Renovation=blue)
- **Currency formatting**: PHP/₱ using `Intl.NumberFormat("fil-PH")`
- **Delete protection**: Units with active tenants or leases return 409
- **Rent adjustment tracking**: PATCH automatically creates `RentAdjustment` records
- **Toast notifications**: Sonner for success/error feedback
- **Loading skeletons**: Pulse animations during data fetch
- **Empty states**: Contextual messages with CTA buttons

## Verification
- ✅ `tsc --noEmit` — zero errors
- ✅ `npm run lint` — zero warnings
- ✅ Dev server starts successfully

## Next: Task 1.6 — Dashboard (home page with occupancy rate, revenue metrics)
