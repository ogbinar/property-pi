# Property-Pi

## What This Is

A lightweight rental property management application for small-scale landlords managing a small portfolio of units (optimized for 5-unit configurations). The app is a **two-service architecture**: Next.js frontend (SSR, UI, client-side logic) + Python FastAPI backend (auth, CRUD, data aggregations) sharing a SQLite database. The landlord gets a full dashboard for managing units, tenants, leases, rent payments, expenses, and maintenance requests. Tenants get a **full tenant portal** with their own dashboard (lease details, payment history, maintenance status, notices) accessed via a shared link with unique token.

## Core Value

The landlord can see the status of all units and know exactly which tenants owe rent for the current month in under 5 seconds.

## Requirements

### Validated

- ✓ Next.js 16 frontend with Tailwind CSS UI already built
- ✓ Prisma schema defines 10 models (User, Unit, Tenant, Lease, Payment, Expense, MaintenanceRequest, RentAdjustment, ContactLog, Notice) with proper relationships
- ✓ Existing API routes directory (`src/app/api/`) with CRUD endpoints for all entities
- ✓ `backend/` directory with Python FastAPI scaffold (alembic, app/main.py) already started

### Active

- [x] Fix 3 TS errors in `tenants-repo.ts` (post-v1.0 — completed)
- [x] Create database initialization/seed script (post-v1.0 — completed)
- [x] Delete dead code (post-v1.0 — completed)
- [x] Remove `pocketbase` from `package.json` (post-v1.0 — completed)
- [x] Update `docker-compose.yml` — single Next.js service (post-v1.0 — completed)
- [ ] Phase 1: Python Backend Foundation — FastAPI, SQLAlchemy, auth, Docker
- [ ] Phase 2: CRUD Endpoints (Units, Tenants, Leases)
- [ ] Phase 3: CRUD Endpoints (Payments, Expenses, Maintenance, Dashboard)
- [ ] Phase 4: Tenant Portal API
- [ ] Phase 5: Frontend Migration — replace server actions with API calls
- [ ] Phase 6: Cleanup & Verification — delete dead code, 2-service deploy
- [ ] Create data migration strategy (PocketBase → SQLite)
- [ ] Verify all pages work with new stack (end-to-end)
- [ ] Update deployment docs for 2-service stack

### Out of Scope

- Tenant authentication — tenants don't have accounts, accessed via shared links
- Real-time updates — not needed for v1
- Mobile app — web-first approach
- Multi-tenant / multi-property support — single property focus for v1
- Automated payment processing (Stripe, etc.) — manual payment tracking only

## Context

- **v1.0** (committed): Brownfield Next.js project migrated to hybrid PocketBase + FastAPI architecture — all 5 phases complete, 56 UAT tests passed
- **post-v1.0** (uncommitted): Architectural pivot away from PocketBase + FastAPI → single Next.js service with SQLite + Drizzle ORM + Server Actions. **COMPLETE**, build passing (0 errors, 26 routes)
- **post-v1.1** (planned): Architectural pivot to two-service architecture — Next.js frontend (thin client) + Python FastAPI backend (auth, CRUD, aggregations) + SQLite. See `REFACTOR-PYTHON-BACKEND.md`
- Active planning docs: `REFACTOR-PYTHON-BACKEND.md`, `MIGRATION-PB-TO-SQLITE.md`

## Constraints

- **Tech stack**: Next.js 16 (App Router) frontend + Python FastAPI backend + SQLite + SQLAlchemy + Tailwind CSS 4.x
- **Database**: Single SQLite file (`pb_data.sqlite`) via SQLAlchemy (Python backend owns the DB)
- **Auth**: JWT cookies + bcrypt — landlord-only login (auth logic in Python backend)
- **Tenant access**: Shared link with unique token — no separate tenant accounts
- **Mutations**: HTTP API calls to Python backend (replacing Server Actions)
- **UI**: Preserve existing page structure and component hierarchy — data layer swapped from Server Actions to Python API
- **Deploy**: Two services in Docker Compose — Next.js (port 3000) + FastAPI (port 8000)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PocketBase + FastAPI hybrid | PocketBase for core (auth/data/storage), FastAPI for reporting/automation — best of both | ✓ Confirmed v1.0 |
| Next.js API routes as proxy | Unified interface to both backends, no frontend CORS issues, single deploy boundary | ✓ Confirmed v1.0 |
| SQLite for dev and prod | PocketBase uses SQLite natively, cheap hosting, no separate DB maintenance | ✓ Confirmed v1.0 |
| Landlord-only auth | Tenants don't need accounts; notices sent via email/text | ✓ Confirmed |
| Full tenant portal | Tenants need more than lease + maintenance — they need payment history, notices, dashboard | ✓ Confirmed |
| Tenant access via shared links | No tenant accounts; landlord shares unique token link | ✓ Confirmed |
| All automation in v1 | Auto-mark overdue, monthly rent generation, lease expiry alerts — baseline features | ✓ Confirmed |
| **post-v1.0: Abandon PocketBase + FastAPI** | Single Next.js service with SQLite + Drizzle + Server Actions — simpler deploy, fewer dependencies | ✅ Complete (build passing) |
| **post-v1.1: Python Backend** | Next.js frontend + Python FastAPI backend — Python for aggregations, reporting, future automation | ⚠️ Planned |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state (users, feedback, metrics)

---
*Last updated: 2026-04-30 post-v1.1 planned — architectural pivot to Python FastAPI backend documented in REFACTOR-PYTHON-BACKEND.md*
