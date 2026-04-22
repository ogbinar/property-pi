# Synthesis Summary — Property-Pi

Generated: 2026-04-22 via /gsd-doc-synthesizer (MERGE mode)

---

## Doc Counts by Type

| Type | Count | Details |
|------|-------|---------|
| ADR | 1 | ARCHITECTURE-DECISION.md (LOCKED) |
| SPEC | 1 | SPEC.md (superseded by ADR) |
| PRD | 0 | No standalone PRDs in this ingest |
| DOC | 11 | Deployment guides, docker-compose files, task summaries |
| PLAN | 15 | Phase 1 sub-plan + 14 archive plans (all superseded by ADR) |
| **Total** | **28** | |

---

## Decisions Locked

**Count: 1** (with 10 sub-decisions: D-01 through D-10)

- `/projects/property-pi/ARCHITECTURE-DECISION.md` — LOCKED, precedence 1
  - PocketBase for auth/data/storage
  - FastAPI for reporting automation only
  - Next.js frontend-only (zero server-side logic)
  - SQLite for dev and production
  - Landlord-only auth
  - Tenant portal via shared link tokens
  - RentAdjustment/ContactLog as JSON fields
  - File uploads via PocketBase file fields
  - PocketBase SDK for all frontend data ops
  - FastAPI → PocketBase via Admin API

---

## Requirements Extracted

**Count: 15** (carried forward from prior ingestion, no new requirements)

REQ-01 through REQ-15: Strip legacy stack, PocketBase setup & schema, auth integration, unified API proxy, FastAPI backend, UI integration, tenant portal, tenant tokens, rent generation, auto-mark overdue, lease expiry alerts, document upload, production deployment, performance, security.

---

## Constraints

**Count: 7**
- api-contract: Tech stack, UI preservation
- schema: Data layer architecture, file storage
- protocol: Auth approach, tenant portal access
- nfr: Performance, security, zero TS errors

---

## Context Topics

**Count: 4**
1. Task execution summaries (3 task docs)
2. Archived plans (14 superseded plan files)
3. Original specification (SPEC.md scope)
4. Deployment guides (9 new DOCs — Docker Compose + Dokploy platforms)

---

## Conflicts Summary

- **BLOCKERS: 1** — Cycle detection in superseded plan set (info-level blocker, no action required)
- **WARNINGS: 0**
- **INFO: 8** — Mostly auto-resolved superseded docs and cycle notes

---

## Intel Files

| File | Path |
|------|------|
| Decisions | `.planning/intel/decisions.md` |
| Requirements | `.planning/intel/requirements.md` |
| Constraints | `.planning/intel/constraints.md` |
| Context | `.planning/intel/context.md` |

## Conflict Report

See `.planning/INGEST-CONFLICTS.md` for full details.

---

*Synthesis complete. Downstream consumers (gsd-roadmapper) should read the intel files above and the conflict report before routing.*
