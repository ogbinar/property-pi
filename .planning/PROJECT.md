# Property-Pi

## What This Is

A lightweight rental property management application for small-scale landlords managing a small portfolio of units (optimized for 5-unit configurations). The app uses a **hybrid architecture** — PocketBase for core auth and data storage, FastAPI for reporting and automation, Next.js for the frontend UI. The landlord gets a full dashboard for managing units, tenants, leases, rent payments, expenses, and maintenance requests. Tenants get a **full tenant portal** with their own dashboard (lease details, payment history, maintenance status, notices) accessed via a shared link with unique token.

## Core Value

The landlord can see the status of all units and know exactly which tenants owe rent for the current month in under 5 seconds.

## Requirements

### Validated

- ✓ Next.js 16 frontend with Tailwind CSS UI already built
- ✓ Prisma schema defines 10 models (User, Unit, Tenant, Lease, Payment, Expense, MaintenanceRequest, RentAdjustment, ContactLog, Notice) with proper relationships
- ✓ Existing API routes directory (`src/app/api/`) with CRUD endpoints for all entities
- ✓ `backend/` directory with Python FastAPI scaffold (alembic, app/main.py) already started

### Active

- [ ] Strip NextAuth, Prisma client, bcryptjs, and next-auth from the codebase
- [ ] Set up PocketBase with SQLite for local development
- [ ] Recreate database schema in PocketBase (matching Prisma schema structure)
- [ ] Implement PocketBase auth integration in Next.js (email/password login)
- [ ] Implement FastAPI backend for reporting, automation, and file processing
- [ ] Create Next.js API routes as unified proxy to PocketBase + FastAPI
- [ ] Connect existing UI pages to the unified API proxy layer
- [ ] Implement landlord-only authentication flow
- [ ] Build full tenant portal (tenant dashboard with lease details, payment history, maintenance status, notices)
- [ ] Implement tenant access via shared link with unique token (no separate PocketBase tenant accounts)
- [ ] Configure file storage for receipts and lease documents via PocketBase
- [ ] Implement automation: auto-mark overdue rent, monthly rent payment generation, lease expiry alerts
- [ ] Set up deployment: PocketBase + FastAPI on fly.io/Railway, Next.js on Vercel

### Out of Scope

- Tenant authentication — tenants don't have accounts, accessed via shared links
- Real-time updates — not needed for v1
- Mobile app — web-first approach
- Multi-tenant / multi-property support — single property focus for v1
- Automated payment processing (Stripe, etc.) — manual payment tracking only

## Context

- Existing codebase is a brownfield Next.js project with full UI but Prisma/NextAuth backend
- User chose a **hybrid PocketBase + FastAPI** architecture over pure PocketBase or pure Python
- PocketBase handles: auth, data storage, admin panel, file storage, real-time
- FastAPI handles: reporting aggregation, file processing, automated tasks (cron)
- Next.js API routes serve as a **unified proxy** to both PocketBase and FastAPI
- Target deployment: PocketBase + FastAPI hosted (~$5-10/mo) + Next.js on Vercel

## Constraints

- **Tech stack**: PocketBase (Go/SQLite) + FastAPI (Python) + Next.js 16 (frontend) + Tailwind CSS 4.x
- **Database**: PocketBase SQLite (core data), FastAPI does not query PocketBase directly — talks via PocketBase Admin API
- **Auth**: PocketBase email/password only — landlord-only login
- **Tenant access**: Shared link with unique token — no separate tenant accounts in PocketBase
- **Frontend**: Next.js API routes as unified proxy to PocketBase + FastAPI (single interface)
- **UI**: Preserve existing page structure and component hierarchy — only swap data layer

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PocketBase + FastAPI hybrid | PocketBase for core (auth/data/storage), FastAPI for reporting/automation — best of both | ✓ Confirmed |
| Next.js API routes as proxy | Unified interface to both backends, no frontend CORS issues, single deploy boundary | ✓ Confirmed |
| SQLite for dev and prod | PocketBase uses SQLite natively, cheap hosting, no separate DB maintenance | ✓ Confirmed |
| Landlord-only auth | Tenants don't need accounts; notices sent via email/text | ✓ Confirmed |
| Full tenant portal | Tenants need more than lease + maintenance — they need payment history, notices, dashboard | ✓ Confirmed |
| Tenant access via shared links | No tenant accounts; landlord shares unique token link | ✓ Confirmed |
| All automation in v1 | Auto-mark overdue, monthly rent generation, lease expiry alerts — baseline features | ✓ Confirmed |

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
*Last updated: 2026-04-21 after architecture clarification — hybrid PocketBase + FastAPI approach confirmed*
