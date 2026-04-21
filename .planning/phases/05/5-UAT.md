---
status: testing
phase: 05-polish-deploy
source: [05-01-02-SUMMARY.md, 05-03-04-SUMMARY.md, 05-05-SUMMARY.md]
started: 2026-04-23T00:05:00Z
updated: 2026-04-23T00:05:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Docker Build Succeeds
expected: |
  Run `docker-compose build`. All services build successfully:
  - Next.js frontend (multi-stage build)
  - FastAPI backend
  - PocketBase (base image)
  No build errors, images created.
awaiting: user response

## Tests

### 1. Docker Build Succeeds
expected: `docker-compose build` completes without errors. All 3 service images created.
result: pending

### 2. Docker Compose Starts All Services
expected: `docker-compose up` starts PocketBase (8090), FastAPI (8000), Next.js (3000). All healthy.
result: pending

### 3. Services Communicate in Docker
expected: Next.js can reach FastAPI and PocketBase via Docker network. API calls succeed.
result: pending

### 4. Security Headers Present
expected: Browser dev tools > Network > Response Headers show:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
result: pending

### 5. Rate Limiting Active
expected: Rapid API requests (100+ in seconds) trigger 429 Too Many Requests response.
result: pending

### 6. Font Display Swap Works
expected: Viewport > Network > Font shows `display=swap`. Text renders before font loads.
result: pending

### 7. Home Page Redirects to Login
expected: Navigate to /. Unauthenticated user redirects to /login. No welcome page shown.
result: pending

### 8. Logout Button Works
expected: Click logout. Session cleared, redirects to /login. Header shows login link.
result: pending

### 9. Dashboard Loads Under 5 Seconds
expected: Fresh load of /dashboard (with PocketBase running) completes in < 5 seconds.
result: pending

### 10. Production Environment Variables Set
expected: `.env.production` has all required vars:
- NEXT_PUBLIC_POCKETBASE_URL (production URL)
- BACKEND_POCKETBASE_URL
- BACKEND_POCKETBASE_ADMIN_TOKEN
result: pending

### 11. Deploy Checklist Complete
expected: `.planning/phases/05/deploy-checklist.md` exists with all sections:
- Pre-deployment verification
- Deployment steps
- Post-deployment tests
- Monitoring setup
result: pending

### 12. README Has Deployment Instructions
expected: README.md includes deployment guide section with steps for Vercel + Railway/fly.io.
result: pending

## Summary

total: 12
passed: 0
issues: 0
pending: 12
skipped: 0

## Gaps

[none yet]
