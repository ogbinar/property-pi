# Property-Pi Simplification Plan

**Date:** 2026-04-30
**Status:** DRAFT — pending approval
**Applies to:** Entire project

---

## Current State

**Architecture:** Next.js 16 frontend + FastAPI backend + SQLite (2 services)
**Auth:** JWT cookies (bcrypt + python-jose on backend)
**Status:** Functional, post post-v1.1 refactor. All CRUD working. Auth flow complete.

The post-v1.1 refactor (TypeScript Server Actions → Python Backend) is complete. The codebase works but has accumulated technical debt from multiple architecture pivots (Prisma → PocketBase → Drizzle → SQLAlchemy), leaving dead code, stale docs, and configuration issues.

---

## Phase 1: Bug Fixes

**Goal:** Fix critical bugs and configuration issues that prevent production deployment.

### 1.1 CORS Configuration
**Problem:** `backend/app/main.py` has hardcoded `allow_origins=["http://localhost:3000"]`. Breaks in Docker/production where frontend is at `http://frontend:3000` or external domain.

**Fix:** Read `allowed_origins` from `Settings` (already exists in `config.py` as comma-separated string). Parse and use in `CORSMiddleware`.

**Files:** `backend/app/main.py`, `backend/app/config.py`

### 1.2 Env Variable Mismatch (Docker vs Config)
**Problem:** `docker-compose.yml` sets `DATABASE_URL` and `SECRET_KEY`, but `config.py` reads `db_url` and `jwt_secret`. Docker env vars are silently ignored — backend falls back to hardcoded defaults.

**Fix:** Either rename docker-compose vars to match config.py (`db_url` → `DATABASE_URL`, `jwt_secret` → `SECRET_KEY`), or add `model_config` env var aliases in Pydantic Settings.

**Recommended:** Add Pydantic `alias` mapping so both naming conventions work:
```python
class Settings(BaseSettings):
    db_url: str = Field(alias="DATABASE_URL", default=...)
    jwt_secret: str = Field(alias="SECRET_KEY", default=...)
```

**Files:** `backend/app/config.py`, `docker-compose.yml`

### 1.3 JWT Secret Hardcoded Default
**Problem:** `config.py` has `jwt_secret: str = "property-pi-jwt-secret-change-in-production"`. If `.env` is missing or malformed, the app runs with a known secret.

**Fix:** Fail fast if JWT secret is the default value in production. Or at minimum require it via environment variable validation.

**Files:** `backend/app/config.py`

### 1.4 `RentAdjustment` and `ContactLog` Tables — Decide Fate
**Problem:** `models.py` defines both `RentAdjustment` and `ContactLog` tables, AND `Unit.rent_history` / `Tenant.contact_log` Text columns. The JSON fields are what the spec intends (D-07). The separate tables are redundant and have no routers.

**Fix:** Remove `RentAdjustment` and `ContactLog` from `models.py`. Keep only the JSON Text fields on `Unit` and `Tenant`. Add CRUD endpoints for managing these JSON fields (append/read entries).

**Files:** `backend/app/models.py`, new router endpoints in `units.py` and `tenants.py`

### 1.5 File Upload Endpoint
**Problem:** `Expense.file_url` exists but there's no file upload endpoint. Spec calls for receipt/document uploads.

**Fix:** Add `POST /api/upload` endpoint that saves files to a local `uploads/` directory and returns the URL. Configure backend to serve static files from `uploads/`. Use `python-multipart` (already in requirements).

**Files:** New `backend/app/routers/upload.py`, `backend/app/main.py` (static mount)

---

## Phase 2: Cleanup

**Goal:** Remove all dead code, stale artifacts, and unused dependencies.

### 2.1 Delete Dead Files

| File | Reason |
|------|--------|
| `db/` directory | Old Drizzle/SQLite client code (orphaned from post-v1.0) |
| `pocketbase` binary | ~30MB PocketBase binary (orphaned from v1.0) |
| `SPEC-MVP.md` | Vanilla JS spec (obsolete) |
| `ARCHITECTURE-DECISION.md` | PocketBase hybrid architecture (obsolete) |
| `REFACTOR-PYTHON-BACKEND.md` | Migration plan (completed, superseded) |
| `MIGRATION-PB-TO-SQLITE.md` | Old migration doc |
| `DEPLOYMENT.md` | Old 3-service deployment guide |
| `DEPLOYMENT-DOCKPLOY.md` | Dokploy deployment guide |
| `docker-compose.dokploy.yml` | Dokploy compose file |
| `deploy-dokploy.sh` | Dokploy deploy script |
| `deploy-prop.sh` | Old deploy script |
| `.env.dokploy.example` | Dokploy env template |
| `.env.local.example` | Old env template |
| `.env.production.example` | Old env template |
| `REFACTOR-PLAN.md` | Old refactor plan |
| `PLAN-PHASE-1.md` | Old phase 1 plan |
| `TASK-1.2-SUMMARY.md` | Old task summary |
| `TASK-1.3-SUMMARY.md` | Old task summary |
| `TASK-1.6-SUMMARY.md` | Old task summary |
| `src/app/api/` directory | Empty directory |

### 2.2 Delete Stale Planning Artifacts

| Path | Reason |
|------|--------|
| `.planning/intel/classifications/` | 28+ JSON files referencing PocketBase |
| `.planning/POST-V1-STATE.md` | Pre-refactor state analysis |
| `.planning/GAP-FIX-PLAN.md` | Gap analysis (partially addressed) |
| `.planning/INGEST-CONFLICTS.md` | Doc classification conflicts |
| `.planning/codebase/` | 7 codebase analysis files (stale) |
| `.planning/research/` | 3 research files (pre-v1) |
| `.planning/phases/` | 5 phase directories with old plans |
| `plans/` directory | Old plan templates and archive |

### 2.3 Remove Unused Frontend Dependencies

**Problem:** `package.json` has `bcryptjs` and `jose` — auth is entirely backend now.

**Fix:** Remove from `package.json`, then `npm install` to clean `package-lock.json` (which also still references `pocketbase`).

**Files:** `package.json`, `package-lock.json`

### 2.4 Clean `.gitignore`

**Problem:** `.gitignore` may reference old artifacts (Prisma, PocketBase).

**Fix:** Update to current state. Ensure `pocketbase`, `*.db`, `.env`, `uploads/` are ignored.

**Files:** `.gitignore`

### 2.5 Consolidate `.env.example`

**Problem:** Multiple `.env.example` variants exist. Current `.env.example` has wrong var names (`DATABASE_URL_FILE`, `PYTHON_BACKEND_URL`, `SESSION_SECRET` don't match what's actually used).

**Fix:** Single `.env.example` with correct variable names matching both `config.py` and `api-client.ts`.

```env
# Backend
db_url=sqlite:////data/property_pi.db
# or: DATABASE_URL=sqlite:////data/property_pi.db  (alias)

jwt_secret=change-me-in-production
# or: SECRET_KEY=change-me-in-production  (alias)

access_token_expire_minutes=120
allowed_origins=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Files:** `.env.example`

---

## Phase 3: Documentation Updates

**Goal:** All documentation reflects the actual architecture.

### 3.1 Update `SPEC.md`

**Current:** References PostgreSQL + Prisma + NextAuth (original spec).

**Update to:**
- Tech stack: Next.js 16 + FastAPI + SQLite
- Auth: JWT cookies (bcrypt + python-jose)
- Architecture: 2-service (frontend + backend)
- Features: Reflect what's actually implemented (dashboard, units, tenants, leases, payments, expenses, maintenance, notices, tenant portal)
- Add missing features to spec: `rent_history`, `contact_log`, file uploads
- Update deployment section: Docker Compose (2 services)

### 3.2 Rewrite `README.md`

**Current:** References PocketBase architecture.

**Update to:**
- Project description
- Architecture overview (Next.js + FastAPI + SQLite)
- Local setup: `docker-compose up` or manual start
- Environment variables
- API documentation link
- Feature list

### 3.3 Create `ARCHITECTURE.md` (replaces ARCHITECTURE-DECISION.md)

**New document covering:**
- System architecture diagram (2 services)
- Auth flow (JWT cookie-based)
- Frontend data fetching pattern (`api-client.ts` + server actions)
- Backend structure (routers, models, schemas)
- Database schema (10 tables, JSON fields)
- Deployment (Docker Compose)
- Key decisions with rationale

### 3.4 Update `.planning/STATE.md`

**Current:** References post-v1.1 as not started (actually complete).

**Update to:**
- Mark post-v1.1 as complete
- Add post-v1.2 milestone: "Simplification, fixes, cleanup"
- Update config section

### 3.5 Update `.planning/ROADMAP.md`

**Current:** References old phase structure.

**Update to:**
- Consolidate completed phases
- Add post-v1 cleanup phase
- Add future phases (file uploads, tests, Alembic migrations, etc.)

### 3.6 Update `docker-compose.yml` Comments

**Fix:** Add comments explaining services, env vars, volumes. Ensure env var names match `config.py`.

---

## Phase 4: Quality Improvements (Optional but Recommended)

**Goal:** Improve code quality and production readiness.

### 4.1 Alembic Migrations
**Problem:** Backend uses `Base.metadata.create_all()` which is not production-safe for schema changes.

**Fix:** Initialize Alembic, create initial migration from current schema, update startup to use migrations.

**Files:** New `alembic/` directory, `alembic.ini`, update `backend/app/database.py`

### 4.2 Basic Test Suite
**Problem:** Zero tests exist.

**Fix:** Create minimal test suite:
- Backend: `pytest` with `httpx` for API endpoint tests (auth, units CRUD, dashboard)
- Frontend: No immediate need — can add later

### 4.3 Error Handling Standardization
**Problem:** Backend routers have inconsistent error handling (some return 404, some throw HTTPException, some return empty lists).

**Fix:** Standardize on HTTPException with consistent status codes. Add global exception handler.

---

## Execution Order

```
Phase 1: Bug Fixes (critical, do first)
  1.1 → 1.2 → 1.3 → 1.4 → 1.5
      (CORS) (env)  (jwt)  (tables) (upload)

Phase 2: Cleanup (can parallelize within phase)
  2.1 → 2.2 → 2.3 → 2.4 → 2.5
      (files) (planning) (deps) (gitignore) (env)

Phase 3: Documentation (after code changes are committed)
  3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6
      (spec) (readme) (arch) (state) (roadmap) (docker)

Phase 4: Quality (optional, can be done incrementally)
  4.1 → 4.2 → 4.3
      (alembic) (tests) (errors)
```

---

## Success Criteria

- [ ] CORS works in Docker (not just localhost)
- [ ] Env vars match between docker-compose.yml and config.py
- [ ] JWT secret not hardcoded in production
- [ ] RentAdjustment/ContactLog tables removed, JSON fields work with CRUD endpoints
- [ ] File upload endpoint exists and works
- [ ] All dead files deleted (30MB pocketbase binary, db/, old plans, etc.)
- [ ] Unused frontend dependencies removed (bcryptjs, jose, pocketbase)
- [ ] SPEC.md reflects current architecture
- [ ] README.md reflects current architecture
- [ ] New ARCHITECTURE.md written
- [ ] STATE.md updated
- [ ] .env.example correct and single source
- [ ] `npm run build` passes
- [ ] `docker-compose up` starts both services correctly

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Deleting planning docs loses history | Git preserves history; archive to `archive/` if needed |
| Removing RentAdjustment/ContactLog tables loses data | Tables are empty (no routers ever wrote to them) |
| Env var rename breaks existing .env | Use Pydantic aliases to accept both names |
| File upload storage in production | Local filesystem for now; can migrate to S3 later |

---

*Last updated: 2026-04-30*
