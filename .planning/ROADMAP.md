# Property-Pi — Development Roadmap

**Last updated:** 2026-04-30
**Current state:** All planned milestones complete (post-v1.1 Simplification)

See `.planning/STATE.md` for detailed phase progress.

---

## Completed Milestones

### v1 — Migration to Hybrid PocketBase + FastAPI (COMPLETE)
Legacy milestone. Superseded by post-v1.0.

### post-v1.0 — Refactor: PocketBase → SQLite + Drizzle + Server Actions (COMPLETE, 100%)
Single Next.js service with SQLite + Drizzle ORM + Server Actions + JWT auth.
Superseded by post-v1.1.

### post-v1.1 — Refactor: TypeScript Server Actions → Python Backend (COMPLETE, 100%)
Current architecture: Next.js frontend + FastAPI backend + SQLite.

**Phases completed:**
1. Python Backend Foundation (FastAPI, SQLAlchemy, JWT auth, rate limiting, CORS, Docker)
2. CRUD: Units, Tenants, Leases (core endpoints + rent_history JSON fields)
3. CRUD: Payments, Expenses, Maintenance, Dashboard (aggregations + monthly rent generation)
4. Tenant Portal API (shared-link access + maintenance submission)
5. Frontend Migration (all Server Actions call FastAPI backend)
6. Cleanup + Verification (dead code, stale docs, PocketBase binary removed)

---

## Future Work (Unplanned)

These are potential improvements that were not part of the core simplification plan:

- **Database migrations:** Add Alembic for schema versioning
- **Test suite:** Backend unit tests + frontend integration tests
- **Error handling:** Centralized exception handling in FastAPI
- **Performance:** Query optimization, indexing, caching
- **Security:** Rate limit tuning, input validation, CSRF protection
- **Deployment:** One-click deploy scripts, monitoring setup

---

*This roadmap is kept minimal. Detailed progress is tracked in `.planning/STATE.md`.*
