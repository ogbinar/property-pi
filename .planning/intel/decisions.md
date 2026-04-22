# Decisions Index

Synthesized from ADRs in CLASSIFICATIONS_DIR

---

## ADR: Architecture Decision — PocketBase + FastAPI Hybrid

**Source:** `/projects/property-pi/ARCHITECTURE-DECISION.md`  
**Status:** LOCKED  
**Scope:** PocketBase, FastAPI, Next.js frontend, Authentication, Data layer, File storage, Deployment

### Decision Statement

PocketBase handles auth, database (SQLite), and file storage via JS SDK. FastAPI handles reporting, automation, and aggregation only — NOT CRUD or auth. PocketBase email/password auth is the single auth approach. Tenant portal uses shared link tokens, not PocketBase auth accounts.

### Key Decisions (D-01 through D-10)

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| D-01 | PocketBase for auth, data, and file storage | Single binary, built-in admin panel, SQLite, email/password auth | ✅ Confirmed |
| D-02 | FastAPI for reporting and automation only | PocketBase can't do aggregation/JOINs; FastAPI handles dashboard queries | ✅ Confirmed |
| D-03 | Next.js as frontend only (zero server-side logic) | No Prisma, no NextAuth, no bcrypt — all backend logic goes to PocketBase/FastAPI | ✅ Confirmed |
| D-04 | SQLite for dev and production | PocketBase uses SQLite natively; cheap hosting; no separate DB maintenance | ✅ Confirmed |
| D-05 | Landlord-only auth (single PocketBase user) | No self-registration; tenant access via shared link tokens | ✅ Confirmed |
| D-06 | Tenant portal via shared link tokens (no tenant accounts) | Tenants don't need PocketBase accounts; landlord shares unique token link | ✅ Confirmed |
| D-07 | RentAdjustment and ContactLog as JSON fields | Append-only logs on parent records; unnecessary collections for ≤5 units | ✅ Confirmed |
| D-08 | File uploads via PocketBase file fields | Replaces String[] and receiptUrl strings; built-in storage | ✅ Confirmed |
| D-09 | PocketBase SDK for all frontend data operations | No Next.js API proxy routes needed; SDK handles auth, HTTP, errors | ✅ Confirmed |
| D-10 | FastAPI communicates with PocketBase via Admin API | NOT direct DB access; NOT Prisma; NOT SQLAlchemy | ✅ Confirmed |

### Supersedes

This ADR explicitly supersedes:
- `plans/01-setup-infrastructure.md` (Prisma/PostgreSQL setup)
- `plans/00-schema-refactoring.md` (Prisma schema design)
- `plans/99-fix-for-running.md` (Prisma bug fixes)
- `plans/02-unit-management.md` through `plans/07-data-seeding.md` (all Phase 1 sub-plans)
- `plans/21-expense-management.md` through `plans/24-file-upload-integration.md` (Phase 2 plans)
- `.planning/phases/02/02-PLAN.md`
- `.planning/research/STACK.md`

### Conflicts With

- `.planning/research/STACK.md` (suggested removing FastAPI — corrected to keep for reporting)
- `src/lib/AuthProvider.tsx` (currently uses FastAPI token auth — must be rewritten to PocketBase)

---

*Generated: 2026-04-22 via /gsd-doc-synthesizer (MERGE mode)*  
*Total decisions: 1 (with 10 sub-decisions), all LOCKED*
