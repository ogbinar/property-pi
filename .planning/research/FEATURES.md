# Feature Landscape

**Domain:** Lightweight rental property management for small landlords (≤5 units)
**Researched:** 2026-04-21
**Confidence:** HIGH (Verified with Prisma schema, existing UI, PocketBase docs)

---

## Table Stakes

Features users expect from any property management product. Without these, the product feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|-------------|------------|-------|
| **Unit management** (CRUD + status tracking) | Core entity — you can't manage what you can't define | Low | VACANT/OCCUPIED/MAINTENANCE/UNDER_RENOVATION statuses map cleanly to PocketBase select fields |
| **Tenant management** (CRUD + contact details) | Each unit needs an occupant | Low | PocketBase `Tenant` collection with text fields for email, phone, emergency contact |
| **Lease management** (create, view, status) | Legal record tying tenant→unit→rent | Medium | PocketBase `Lease` collection with relation fields; `documents` as files via PocketBase storage |
| **Rent tracking** (monthly overview, paid/pending/overdue) | Core value: "know who owes rent in 5 seconds" | Medium | `Payment` collection linked to `Unit` + `Lease`; PocketBase filters for status queries |
| **Expense tracking** (record, categorize, attach receipts) | Tax season necessity; profitability visibility | Low | `Expense` collection with category select + file field for receipt images |
| **Maintenance request tracking** (report, assign priority, status) | Keeps units habitable; tenant satisfaction | Medium | `MaintenanceRequest` collection with priority/status enums; PocketBase sort by priority |
| **Dashboard with unit status overview** | First-screen sanity check | Low | Aggregated queries across Unit, Lease, Payment collections using PocketBase expand |
| **Landlord authentication** (login, session) | Secures sensitive financial data | Low | PocketBase auth collection — email/password only, already planned |
| **Tenant portal (view-only, shared-link access)** | Tenants need to see lease info & submit maintenance | Medium | PocketBase public records (no auth required for Tenant/Lease/MaintenanceRequest view); URL contains tenant ID for lookup |

---

## Differentiators

Features that set this apart from bare-bones CRUD. Not expected, but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Lease expiration alerts** | Proactive renewal planning vs. surprise turnover | Medium | PocketBase query filtering leases where `endDate` is within N days; displayed in dashboard `ExpirationsCard` |
| **Revenue vs. expenses net profit** | Landlord sees profitability at a glance | Medium | Dashboard aggregation: sum all Payment statuses minus sum Expense amounts |
| **Occupancy rate card** | Know portfolio utilization instantly | Low | Count OCCUPIED units / total units; displayed in dashboard `OccupancyCard` |
| **Expense category breakdown** | See where money goes (maintenance, utilities, taxes) | Low | PocketBase `filter` on Expense `category` field; group by category for chart |
| **Rent generation for the month** | Auto-create monthly rent records for all occupied units | Medium | Server-side logic or Next.js API route that reads occupied leases and creates Payment records |
| **Activity feed** | Recent changes across all entities in chronological order | Medium | PocketBase `sort=-created` across collections; aggregate into unified feed |
| **Unit status grid** | Visual overview of which units are occupied/vacant/maintenance | Low | `UnitStatusGrid` component reads Unit collection filtered by status |
| **Maintenance cost tracking** | See how much repairs are costing per unit | Low | Add `cost` Decimal field to MaintenanceRequest (already in schema) |

---

## Anti-Features

Features to deliberately NOT build. These are explicitly out of scope and would distract from the core value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Automated rent collection / payment processing** | Requires PCI compliance, banking integrations, reconciliation logic; massive scope creep | Manual "mark as paid" button; landlord confirms payment after checking their bank |
| **Tenant authentication (accounts)** | Over-engineering; tenants are few, stable, and don't log in | Shared-link access (`/tenant/portal?tenantId=xxx`) for view-only tenant portal |
| **Real-time updates (WebSockets, SSE)** | PocketBase supports it, but adds infra complexity for a single-landlord app | Polling or page refresh is fine for ≤5 units; explicitly deferred in PROJECT.md |
| **Multi-property / multi-tenant support** | Schema changes required (add `propertyId` to all models); complicates data queries | Single-property focus keeps queries simple; PocketBase admin is per-instance |
| **Automated notice delivery (email/SMS)** | Requires third-party integrations (SendGrid, Twilio), API keys, template design | Manual notice creation stored as `Notice` records; landlord sends via their own email |
| **Advanced analytics / ML forecasting** | Requires Python backend (explicitly deferred); overkill for small landlords | Simple trend lines in dashboard (revenue vs. expenses over months) is sufficient |
| **Mobile app** | Duplication of effort; rent management is a weekly task, not hourly | Responsive web UI is sufficient; tenant portal works on phone browsers |
| **Multi-currency support** | Adds Decimal field complexity; landlords operate in single currency | Single currency (PHP per PROJECT.md locale hints); no currency field needed |
| **AI-powered rent estimation** | Requires training data, ML pipeline, external APIs | Landlord sets rent manually on Unit creation; RentAdjustment tracks changes |

---

## Feature Dependencies

```
Landlord Auth → All landlord features (gate all pages)

Tenant Portal → Shared-link lookup (tenantId from URL param)
Tenant Portal → Lease view (Lease collection, public read)
Tenant Portal → Maintenance request submit (MaintenanceRequest create, public)

Rent Tracking → Lease collection (must have active leases to generate)
Rent Tracking → Payment collection (monthly records)
Rent Tracking → Unit collection (occupied units only)

Dashboard → Unit collection (status grid)
Dashboard → RevenueCard → Payment collection (collected/expected)
Dashboard → OccupancyCard → Unit collection (occupied/total)
Dashboard → ExpenseBreakdown → Expense collection (category breakdown)
Dashboard → ActivityFeed → All collections (sorted by created desc)
Dashboard → ExpirationsCard → Lease collection (endDate within N days)

Expense Tracking → Unit collection (expense association)
Expense Tracking → PocketBase file storage (receipt uploads)

Maintenance Tracking → Unit collection (request association)
Maintenance Tracking → Priority/status enums (PocketBase select fields)

Lease Management → Tenant collection (relation)
Lease Management → Unit collection (relation)
Lease Management → PocketBase file storage (lease document uploads)

Rent Adjustment → Unit collection (which unit)
Rent Adjustment → History tracking (RentAdjustment collection)
```

---

## MVP Recommendation

**Prioritize (Phase 1 — Core):**

1. **Landlord authentication** — gate the entire app
2. **Unit management** (CRUD + status) — core entity, required by everything else
3. **Tenant management** (CRUD) — required by leases and rent
4. **Lease management** (create, view, status) — ties tenant→unit→rent
5. **Rent tracking** (generate monthly, mark paid) — core value feature
6. **Expense tracking** (record + receipt upload) — tax necessity
7. **Maintenance tracking** (report, prioritize, status) — keeps units habitable
8. **Dashboard** (unit grid, revenue, occupancy, expenses, expirations, activity) — first-screen value

**Defer (Phase 2 — Enhance):**
- Tenant portal (shared-link view-only) — nice-to-have, not blocking for landlord to use
- Lease expiration alerts — useful but not blocking
- Revenue vs. expenses net profit — dashboard enhancement, not standalone feature

**Never build (out of scope):**
- Automated payment processing
- Tenant accounts
- Real-time updates
- Multi-property support
- Email/SMS delivery
- Mobile app
- Advanced analytics / ML

---

## PocketBase Feature Mapping

How PocketBase's built-in capabilities map to rental property management needs:

| PocketBase Feature | Maps To | How Used |
|--------------------|---------|----------|
| **Auth collection (email/password)** | Landlord login | Single auth collection with role field (LANDLOND/MANAGER) |
| **Base collections** | Unit, Tenant, Lease, Payment, Expense, MaintenanceRequest, RentAdjustment, Notice, ContactLog | 9 collections mirroring Prisma schema |
| **Relation fields** | Lease→Tenant, Lease→Unit, Payment→Unit, Expense→Unit, etc. | PocketBase relation field with cascade delete |
| **Select fields (enums)** | UnitStatus, LeaseStatus, PaymentStatus, Priority, MaintenanceStatus, ContactType, NoticeType | PocketBase multi-select or single-select fields |
| **File fields** | Receipt images, lease documents | PocketBase file storage with thumbnail generation |
| **API rules (access control)** | Role-based visibility | `@request.auth.id != ''` for landlord-only; empty rules for tenant portal |
| **Admin dashboard** | Landlord data management | PocketBase admin UI provides instant CRUD for all collections |
| **Record filtering/sorting** | Rent status queries, expiring leases | `filter=status='OVERDUE'`, `sort=-created` |
| **File download API** | Receipt/lease document access | `GET /api/files/{collection}/{record}/{filename}` |

---

## Sources

- **PocketBase Docs**: Context7 verified — records CRUD, file upload, API rules, relation fields, select fields, file download API
- **Prisma Schema**: 9 models with proper relationships, enums, and cascade deletes
- **Existing UI**: 21 pages across 6 sections (dashboard, units, tenants, leases, rent, expenses, maintenance)
- **Component Library**: 30+ components covering all entity forms, tables, and dashboard cards
- **PROJECT.md**: Explicit out-of-scope items (tenant auth, real-time, mobile, multi-property, automated payments)
