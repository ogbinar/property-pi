# Task 1.3 — Tenant Management (Complete)

## Summary

Full CRUD for tenants with profile views and linked lease/payment history.

## What was built

### API Routes (Task 1.3.5)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/tenants` | POST | Create tenant (Zod validated, 409 on duplicate email) |
| `/api/tenants` | GET | List tenants with `q` search param (filters by name/email/phone) |
| `/api/tenants/[id]` | GET | Get tenant detail with active lease + unit payments |
| `/api/tenants/[id]` | PATCH | Update tenant (all fields optional, 404 if not found) |
| `/api/tenants/[id]` | DELETE | Delete tenant (409 if has active leases) |

### Pages (Tasks 1.3.1–1.3.4)
| Page | Path | Description |
|------|------|-------------|
| **Tenant List** | `/tenants` | Responsive table with search, status badges, action buttons |
| **New Tenant** | `/tenants/new` | Form with Zod validation, toast on success, redirect to detail |
| **Tenant Detail** | `/tenants/[id]` | Profile card, active lease info, payment history table |
| **Edit Tenant** | `/tenants/[id]/edit` | Pre-populated form, delete confirmation modal |

### Components (Tasks 1.3.1–1.3.2)
| Component | Path | Description |
|-----------|------|-------------|
| **TenantForm** | `components/tenants/tenant-form.tsx` | Reusable form with Zod validation, labels, error display |
| **TenantTable** | `components/tenants/tenant-table.tsx` | Responsive table with search, status badges, delete modal |
| **TenantSearch** | `components/tenants/tenant-search.tsx` | Debounced search input with URL query param sync |

## Key features
- **Client-side search**: Debounced (300ms) search by name/email/phone
- **Zod validation**: Required fields, email format, inline errors
- **Duplicate detection**: 409 on duplicate email (create + edit)
- **Delete protection**: 409 if tenant has active leases
- **Payment history**: Last 10 payments linked through unit assignment
- **Responsive table**: Horizontal scroll on mobile, hidden columns at breakpoints
- **Toast notifications**: Sonner for success/error feedback
- **Confirmation modals**: Delete with Modal component + danger variant
- **Clickable links**: Email (mailto:), phone (tel:), unit, lease navigation
- **Currency formatting**: PHP/₱ using `Intl.NumberFormat("fil-PH")`
- **Loading states**: Skeletons while fetching tenant detail

## Verification
- ✅ `tsc --noEmit` — zero errors
- ✅ `npm run lint` — zero warnings
- ✅ Dev server starts successfully

## Next: Task 1.4 — Lease Management (full CRUD + lifecycle)
