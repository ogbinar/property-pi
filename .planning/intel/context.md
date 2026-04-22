# Context Index

Synthesized from DOCs in CLASSIFICATIONS_DIR

---

## Topic: Task Execution Summaries

**Sources:** `/projects/property-pi/TASK-1.2-SUMMARY.md`, `/projects/property-pi/TASK-1.3-SUMMARY.md`, `/projects/property-pi/TASK-1.6-SUMMARY.md`

### Notes

Task 1.2 — Unit Management (Complete):
- Full CRUD for units with visual status tracking completed
- 5 API routes: GET/POST /api/units, GET/PATCH/DELETE /api/units/[id]
- 4 pages: Unit List, New Unit, Unit Detail, Edit Unit
- 2 components: UnitCard, UnitForm
- Features: responsive grid, status badges, PHP formatting, delete protection
- Verified: tsc --noEmit, npm run lint, dev server starts
- **Note:** Implementation likely used Prisma (superseded by PocketBase)

Task 1.3 — Tenant Management (Complete):
- Full CRUD for tenants with profile views and linked lease/payment history completed
- 5 API routes: POST/GET /api/tenants, GET/PATCH/DELETE /api/tenants/[id]
- 4 pages: Tenant List, New Tenant, Tenant Detail, Edit Tenant
- 3 components: TenantForm, TenantTable, TenantSearch
- Features: debounced search, Zod validation, duplicate detection, delete protection
- Verified: tsc --noEmit, npm run lint, dev server starts
- **Note:** Implementation likely used Prisma (superseded by PocketBase)

Task 1.6 — Dashboard (Complete):
- Dashboard with all important property management data at a glance completed
- 1 API endpoint: GET /api/dashboard aggregating all metrics
- 6 components: UnitStatusGrid, RevenueCard, OccupancyCard, ActivityFeed, ExpirationsCard
- Data: unit counts, revenue, occupancy rate, recent activities, upcoming expirations
- Features: responsive design, loading skeletons, empty states, urgency grouping
- Verified: tsc --noEmit, npm run lint, dev server starts
- **Note:** Implementation likely used Prisma (superseded by PocketBase)

---

## Topic: Archived Plans (Superseded)

**Sources:** `plans/archive/*.md` (14 files)

### Notes

All plans in `plans/archive/` are superseded by ARCHITECTURE-DECISION.md:

- `plans/archive/00-schema-refactoring.md` — Prisma schema refactoring plan (superseded)
- `plans/archive/01-setup-infrastructure.md` — Prisma + PostgreSQL + NextAuth setup (superseded)
- `plans/archive/02-unit-management.md` — Unit CRUD via Prisma (superseded)
- `plans/archive/03-tenant-management.md` — Tenant CRUD via Prisma (superseded)
- `plans/archive/04-lease-management.md` — Lease CRUD via Prisma (superseded)
- `plans/archive/05-rent-tracking.md` — Rent tracking via Prisma (superseded)
- `plans/archive/06-dashboard.md` — Dashboard via Prisma aggregation (superseded)
- `plans/archive/07-data-seeding.md` — Prisma seed script (superseded)
- `plans/archive/21-expense-management.md` — Expense management via Prisma (superseded)
- `plans/archive/22-maintenance-tracking.md` — Maintenance tracking via Prisma (superseded)
- `plans/archive/23-enhanced-dashboard.md` — Enhanced dashboard via Prisma (superseded)
- `plans/archive/24-file-upload-integration.md` — File uploads via S3/Supabase (superseded)
- `plans/archive/99-fix-for-running.md` — Prisma-based fixes (superseded)
- `plans/archive/PLAN.md` — Archive container (superseded)

**Common theme:** All used Prisma + PostgreSQL + NextAuth stack, now obsolete per ARCHITECTURE-DECISION.md.

---

## Topic: Original Specification

**Source:** `/projects/property-pi/SPEC.md`

### Notes

Property-Pi is a lightweight, specialized property management application for small-scale landlords managing ~5 units.

**Target User:** Small-scale landlords or property managers who own/manage a small number of residential units (specifically optimized for 5-unit configurations).

**Core Features:**
- Unit & Lease Management: Visual dashboard, lease lifecycle tracking, renewal workflow, tenant profiles
- Financial Management: Automated rent generation, payment status tracking, expense logging, financial reporting
- Communication: Tenant notice system, contact log

**Original Tech Stack (Proposed):** Next.js, PostgreSQL/Prisma, NextAuth.js, Supabase Storage/AWS S3 — **now superseded by PocketBase + FastAPI hybrid**

**Success Metrics:**
- Ability to see the status of all 5 units in under 5 seconds
- Zero confusion on which tenant owes rent for the current month
- Clear visibility into monthly net profit

---

## Topic: Deployment Guides (New)

**Sources:** `/projects/property-pi/DEPLOYMENT.md`, `/projects/property-pi/DEPLOYMENT-DOCKPLOY.md`, `docker-compose.yml`, `docker-compose.dokploy.yml`, `.opencode/dokploy-config.md`, `.opencode/dokploy-deployment-checklist.md`, `.opencode/dokploy-deployment-template.md`, `.opencode/dokploy-prop-deployment.md`, `.opencode/github-push-workflow.md`

### Notes

New ingestion added 9 deployment-related DOCs covering two deployment approaches:

**Docker Compose (legacy):**
- `docker-compose.yml` — Three services: PocketBase (pb), backend API, Next.js app with volumes
- Used for local development and Railway/Vercel deployment guides (`DEPLOYMENT.md`)

**Dokploy PaaS:**
- `DEPLOYMENT-DOCKPLOY.md` — Step-by-step guide for deploying to Dokploy PaaS
- `docker-compose.dokploy.yml` — Dokploy-specific compose with PocketBase, FastAPI, Next.js services and health checks
- `.opencode/dokploy-config.md` — Instance setup, environment variables, deployment steps
- `.opencode/dokploy-deployment-checklist.md` — Configuration, verification, troubleshooting checklist
- `.opencode/dokploy-deployment-template.md` — Reusable template for GitHub repo deployments to Dokploy
- `.opencode/dokploy-prop-deployment.md` — Runbook for Property-Pi on Dokploy (SSL/HTTPS, deployment steps)
- `.opencode/github-push-workflow.md` — CLI guide for pushing code to GitHub

**Scope overlap:** The Dokploy docs and DEPLOYMENT.md cover the same project but different platforms. Both point to `docker-compose.dokploy.yml`. These are complementary deployment context documents, not conflicting requirements.

---

*Generated: 2026-04-22 via /gsd-doc-synthesizer (MERGE mode)*  
*Total context topics: 4*
