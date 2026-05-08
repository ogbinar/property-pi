# Property-Pi Project Snapshot

## Current State

Property-Pi is currently operated as a single-service production application:

- FastAPI serves the SPA and API together
- Root `Dockerfile` is the production build
- `docker-compose.yml` is the current production compose
- Canonical auth routes are `/auth/*`
- Canonical health endpoint is `/api/health`

## Active Planning Position

- No active runtime split work
- No active PocketBase migration work
- No active Next.js runtime plan

## Historical Context

Earlier project planning moved through several discarded directions, including PocketBase, Next.js-centric runtime ideas, and multi-service deployment shapes. Those plans are superseded and kept only as history.

## Current Constraints

- SQLite remains the active database
- Uploads remain filesystem-backed
- Local development remains a Vite + FastAPI two-process setup

## Source of Truth

Use the current top-level docs for operational truth:

- `README.md`
- `ARCHITECTURE.md`
- `SPEC.md`
