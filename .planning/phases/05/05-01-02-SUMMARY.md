---
phase: 05
plan: 01-02
subsystem: deployment-security
tags: [docker, security, deployment, production]

# Dependency graph
requires:
  - phase: 04-tenant-portal
    provides: "Complete application with all features"
provides:
  - "Docker containerization for all services"
  - "Security hardening (headers, rate limiting)"
  - "Production environment configuration"
affects:
  - "Production deployment"

# Tech tracking
tech-stack:
  added: ["Docker", "docker-compose", "slowapi (rate limiting)", "security headers"]
  patterns: ["Multi-stage Docker builds", "Standalone Next.js output", "Rate limiting middleware"]

key-files:
  created:
    - "Dockerfile"
    - "backend/Dockerfile"
    - "docker-compose.yml"
    - ".dockerignore"
    - ".env.local.example"
    - ".env.production.example"
  modified:
    - "next.config.ts"
    - "backend/app/main.py"
    - "backend/requirements.txt"

key-decisions:
  - "Multi-stage Docker builds for smaller production images"
  - "Next.js standalone output mode for minimal runtime dependencies"
  - "slowapi for rate limiting - simple decorator-based approach"
  - "Security headers via Next.js config - no additional middleware needed"

# Execution summary
## Wave 1: Docker & Security (Plans 05-01, 05-02)

### Task P5.1: Docker Configuration

**Created files:**
- `Dockerfile` - Multi-stage build for Next.js (deps → builder → runner)
- `backend/Dockerfile` - Python FastAPI production image
- `docker-compose.yml` - Orchestrates PocketBase, FastAPI, and Next.js
- `.dockerignore` - Excludes unnecessary files from build context

**Docker setup:**
- PocketBase: Uses frodenas/pocketbase:0.24.0 image with persistent volume
- FastAPI: Built from requirements.txt, exposes port 8000
- Next.js: Standalone output, exposes port 3000
- Service dependencies: app → backend → pb

**Verification:**
✅ `docker compose config` runs without errors

### Task P5.2: Security Hardening

**Next.js security headers (next.config.ts):**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 0
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera, microphone, geolocation disabled

**FastAPI rate limiting:**
- Added slowapi middleware
- Rate limit exceeded handler returns 429 status
- Key function: get_remote_address (per-IP limiting)

**Environment configuration:**
- `.env.local.example` - Development template with comments
- `.env.production.example` - Production template with security notes

## Verification

✅ Build succeeds with `npm run build` (zero TypeScript errors)
✅ Docker compose config validates successfully
✅ Security headers configured
✅ Rate limiting middleware added
✅ Environment templates created

## Success criteria met

- [x] Docker configuration created for all services
- [x] docker-compose.yml orchestrates PocketBase + FastAPI + Next.js
- [x] Security headers added to Next.js
- [x] Rate limiting added to FastAPI
- [x] Environment templates created
- [x] Build succeeds

---
*Wave 1 execution complete: 2026-04-21*
