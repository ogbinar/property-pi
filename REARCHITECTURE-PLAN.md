# Property-Pi Rearchitecture Plan

**Status:** In progress  
**Scope:** Runtime architecture, deployment contract, and refactor sequence  
**Goal:** Reduce deploy fragility by collapsing the current two-service runtime into one Python-backed service

**Current state:** phases 1-3 are implemented and verified locally; phase 4 cleanup and phase 5 doc/test polish remain.

## Why This Plan Exists

The current codebase is already a React + Vite SPA frontend plus a FastAPI backend. The problem is not feature completeness. The problem is runtime fragility:

- the frontend depends on an Nginx proxy container
- Nginx depends on backend container reachability
- Dokploy compose state depends on a separate env/config layer
- production startup fails hard if `SECRET_KEY` is missing
- live debugging is split across multiple containers and routing layers

This creates too many places for a deploy to be "up" while the app is still unusable.

## Current State

- Frontend: React + Vite SPA with bearer-token auth in `localStorage`
- Backend: FastAPI + SQLite + JWT auth
- Runtime: frontend Nginx container proxies `/api` and `/auth` to `backend:8000`
- Production: Dokploy compose deployment with external domain routing

The current runtime shape is functional in local dev, but it is brittle in production.

## Target State

Use a **single Python runtime** for production:

- FastAPI serves the API
- FastAPI serves the built SPA static files
- One container, one service, one health check
- SQLite stays on a volume
- uploads stay on a separate volume

The frontend code stays React/Vite. The change is the runtime packaging, not a rewrite of the UI.

## Recommended Architecture

### Preferred production shape

- `backend/` remains the application runtime
- Vite builds the frontend into `frontend/dist`
- the backend image copies `dist/` during a multi-stage Docker build
- FastAPI mounts static files and falls back to `index.html` for client routes
- Dokploy deploys one service instead of two

### Why this is better

- removes the Nginx-to-backend proxy hop
- removes backend service DNS reachability as a runtime dependency
- removes route prefix confusion between frontend proxy and backend router
- makes startup failures easier to diagnose
- reduces compose/Dokploy config drift

## What Stays The Same

- React UI
- Vite build pipeline
- FastAPI router structure
- SQLite storage
- JWT auth
- file upload storage

## What Changes

- no separate frontend runtime container in production
- no `proxy_pass http://backend:8000` dependency for user traffic
- no production reliance on frontend Nginx to route API traffic
- one Dokploy service instead of a split frontend/backend service pair

## Migration Plan

### Phase 1: Lock the contract

Goal: make the current behavior explicit before changing packaging.

- document canonical routes: `/api/health`, `/auth/login`, `/auth/me`
- keep the route aliases only until the new runtime is stable
- keep production `SECRET_KEY` required and explicit
- update README and architecture docs to stop describing the repo as Next.js

Acceptance:
- local tests pass
- production env contract is documented
- route behavior is fully specified

### Phase 2: Make FastAPI capable of serving the SPA

Goal: let the backend serve the frontend build output directly.

- add static file mounting for `frontend/dist`
- add SPA fallback to `index.html`
- ensure `/api/*` and `/auth/*` remain routed to FastAPI handlers
- keep `/uploads/*` static serving

Files likely involved:

- `backend/app/main.py`
- `backend/app/config.py`
- `backend/app/routers/*`
- backend Dockerfile

Acceptance:
- `/` serves the SPA
- `/login`, `/register`, and all SPA routes load correctly
- `/api/health` and `/auth/login` still work

### Phase 3: Collapse production compose to one service

Goal: remove the frontend runtime container from production.

- replace the current two-service compose with one backend service
- build frontend assets in the backend image
- keep one SQLite volume and one uploads volume
- set `SECRET_KEY` directly in production env

Files likely involved:

- `docker-compose.yml`
- `backend/Dockerfile`
- maybe `frontend/Dockerfile` becomes build-only or is removed from production use

Acceptance:
- one service deploys successfully in Dokploy
- the site loads
- login works
- health works

### Phase 4: Remove routing workarounds

Goal: delete temporary compatibility layers once the single-service runtime is stable.

- remove route aliases that only exist to support old proxy shapes
- remove frontend Nginx proxy config from production use
- remove any deploy-specific env hacks that are no longer needed

Acceptance:
- only canonical routes remain
- no proxy-only compatibility code remains

### Phase 5: Clean up docs and tests

Goal: align the repo to the new runtime.

- rewrite README
- rewrite architecture docs
- delete stale deployment notes that describe the old split runtime
- add a deployment smoke test that validates the production contract

Acceptance:
- docs match reality
- new contributors can follow one setup path
- deployment smoke tests catch regressions before push

## Test Gates

Every phase should pass the following gates before moving on:

1. backend unit tests
2. frontend build
3. API contract tests for auth and health
4. local container smoke test
5. production-like compose smoke test
6. live smoke test after deploy

Minimum live smoke:

- `GET /`
- `GET /api/health`
- `POST /auth/login`
- authenticated dashboard load

## Risks

### High risk

- changing runtime packaging can break deploys if the frontend build is not copied correctly
- production secret handling must remain strict
- SQLite volume paths must not change unexpectedly

### Medium risk

- route aliases may need to stay temporarily during transition
- stale docs can mislead operators during cutover
- tenant portal and upload paths need to be preserved in the new single-service runtime

## Suggested Order of Work

1. Update docs to reflect the real stack
2. Add/verify backend static serving for the SPA
3. Switch production compose to one service
4. Re-run deploy smoke tests
5. Remove compatibility code after live verification

## Exit Criteria

The rearchitecture is complete when:

- production deploys with one runtime service
- the frontend loads from FastAPI
- auth works
- health works
- uploads work
- the live site survives redeploys without manual proxy repair
