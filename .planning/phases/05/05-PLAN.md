---
phase: 5
plan_number: 05
title: "Polish & Deploy"
objective: "Production deployment configuration — Docker, Docker Compose, security hardening, performance optimization, and deployment verification for the PocketBase + FastAPI + Next.js hybrid stack."
waves:
  - wave: 1
    plans:
      - id: "05-01"
        autonomous: true
        objective: "Create Docker and Docker Compose configuration for PocketBase and FastAPI"
      - id: "05-02"
        autonomous: true
        objective: "Harden Next.js security (CORS, security headers, rate limiting)"
  - wave: 2
    plans:
      - id: "05-03"
        autonomous: true
        objective: "Optimize performance (image optimization, caching, bundle analysis)"
      - id: "05-04"
        autonomous: true
        objective: "Rewrite AuthProvider to use PocketBase SDK, fix login flow"
  - wave: 3
    plans:
      - id: "05-05"
        autonomous: false
        objective: "Production verification, environment config, documentation, and deployment checklist"
files_modified:
  - Dockerfile
  - docker-compose.yml
  - .dockerignore
  - backend/Dockerfile
  - next.config.ts
  - src/lib/AuthProvider.tsx
  - src/lib/api.ts
  - src/app/login/page.tsx
  - src/components/auth/AuthGuard.tsx
  - src/components/auth/LogoutButton.tsx
  - src/app/page.tsx
  - src/app/layout.tsx
  - src/components/layout/header.tsx
  - .env.local.example
  - .env.production.example
  - README.md
  - DEPLOYMENT.md
requirements:
  - REQ-13
  - REQ-14
  - REQ-15
must_haves:
  truths:
    - "Application starts with docker compose up and all 3 services run"
    - "Dashboard loads in under 5 seconds on 4G connection"
    - "All landlord operations require authentication"
    - "No hardcoded secrets in codebase"
    - "Tenant portal links work from production"
    - "CRUD operations work in production"
  artifacts:
    - path: "Dockerfile"
      provides: "Next.js production Docker image"
    - path: "backend/Dockerfile"
      provides: "FastAPI production Docker image"
    - path: "docker-compose.yml"
      provides: "Local development orchestration"
    - path: ".env.local.example"
      provides: "Development environment variable template"
    - path: ".env.production.example"
      provides: "Production environment variable template"
    - path: "DEPLOYMENT.md"
      provides: "Production deployment instructions for fly.io and Vercel"
    - path: "README.md"
      provides: "Project overview and quickstart"
  key_links:
    - from: "src/lib/AuthProvider.tsx"
      to: "src/lib/pocketbase.ts"
      via: "pb.authWithPassword()"
      pattern: "pb\\.collection\\('users'\\)\\.authWithPassword"
    - from: "src/components/auth/AuthGuard.tsx"
      to: "src/lib/AuthProvider.tsx"
      via: "useAuth() redirect"
      pattern: "useAuth\\(\\).*redirect"
    - from: "src/lib/api.ts"
      to: "src/lib/AuthProvider.tsx"
      via: "token from pb.authStore"
      pattern: "pb\\.authStore\\.token"
---

## Objective

Production deployment setup for the Property-Pi hybrid stack. This covers Docker containerization of PocketBase and FastAPI, Docker Compose orchestration, security hardening (CORS, security headers, rate limiting), performance optimization to meet the < 5s dashboard load requirement, and deployment configuration.

## Tasks

### Task P5.1: Create Docker configuration (Wave 1)

Create multi-stage Dockerfiles and docker-compose.yml for the full stack.

**a. Frontend Dockerfile** — Create `Dockerfile` at project root:

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx next telemetry disable
RUN npm run build
# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
ENV NEXT_ENV_MODE=standalone
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
```

**b. Backend Dockerfile** — Create `backend/Dockerfile`:

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS production
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY backend/ ./
ENV POCKETBASE_URL=http://pb:8090
ENV FASTAPI_PORT=8000
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**c. docker-compose.yml** — Create at project root:

```yaml
services:
  pb:
    image: frodenas/pocketbase:0.24.0
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/pb_data
    environment:
      PB_HTTP_ENABLE: "true"
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    environment:
      POCKETBASE_URL: http://pb:8090
      BACKEND_SECRET_KEY: ${BACKEND_SECRET_KEY:-property-pi-secret-key}
    depends_on:
      - pb
    restart: unless-stopped

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_POCKETBASE_URL: http://localhost:8090
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on:
      - backend
      - pb
    restart: unless-stopped

volumes:
  pb_data:
```

**d. .dockerignore** — Create at project root:

```
node_modules
.next
pb_data
.git
.gitignore
backend/.venv
backend/__pycache__
**/*.pyc
**/*.pyo
**/__pycache__
*.md
.Dockerfile
.dockerignore
```

**Verify:** `docker compose -f docker-compose.yml config` runs without errors.

---

### Task P5.2: Security hardening (Wave 1)

Harden Next.js configuration and FastAPI security posture. This addresses REQ-15 (security), REQ-14 (performance), and CONCERNS.md security findings.

**a. Update `next.config.ts`** — Add security headers and production config:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '0',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60, stale-while-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**b. Update `backend/app/config.py`** — Add production settings:

```python
class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/property_pi"
    secret_key: str = "property-pi-secret-key-for-development"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 30
    pocketbase_url: str = "http://localhost:8090"
    pocketbase_admin_secret: str = ""
    allowed_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_prefix = "BACKEND_"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",")]
        return v

settings = Settings()
```

**c. Update `backend/app/main.py`** — Fix CORS for production and add rate limiting:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import remote_addr
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.routers import auth as auth_router
from app.routers import units, tenants, leases, rent, expenses, maintenance, dashboard

app = FastAPI(
    title="Property-Pi",
    description="Small-scale property management API",
    version="0.1.0",
)

# Rate limiting
limiter = Limiter(key_func=remote_addr)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# CORS — production origins from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router.router)
app.include_router(units.router)
app.include_router(tenants.router)
app.include_router(leases.router)
app.include_router(rent.router)
app.include_router(expenses.router)
app.include_router(maintenance.router)
app.include_router(dashboard.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

**d. Add rate limiting to auth router** — In `backend/app/routers/auth.py`, wrap the login endpoint:

```python
from app.main import limiter

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

**e. Create `.env.local.example`** — Create at project root:

```env
# Next.js (frontend)
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
NEXT_PUBLIC_API_URL=http://localhost:8000

# PocketBase
POCKETBASE_URL=http://localhost:8090

# FastAPI
BACKEND_SECRET_KEY=your-secret-key-change-in-production
BACKEND_POCKETBASE_URL=http://localhost:8090
BACKEND_POCKETBASE_ADMIN_SECRET=your-admin-secret
```

**f. Create `.env.production.example`** — Create at project root:

```env
# Production Next.js
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase.fly.dev
NEXT_PUBLIC_API_URL=https://your-fastapi.fly.dev

# Production PocketBase
POCKETBASE_URL=https://your-pocketbase.fly.dev

# Production FastAPI
BACKEND_SECRET_KEY=changeme-use-openssl-random
BACKEND_POCKETBASE_URL=https://your-pocketbase.fly.dev
BACKEND_POCKETBASE_ADMIN_SECRET=changeme
BACKEND_ALLOWED_ORIGINS=https://your-app.vercel.app
```

**g. Verify `.gitignore`** — Confirm `.env` and `.env.local` are excluded (already present on line 34).

**Verify:** `npx tsc --noEmit` passes. `python -c "from backend.app.config import settings; print(settings)"` works.

---

### Task P5.3: Performance optimization (Wave 2)

Optimize the Next.js build and runtime to meet the < 5s dashboard load requirement (REQ-14).

**a. Verify standalone build** — The Dockerfile in P5.1 already copies `.next/standalone`, which requires `output: 'standalone'` in next.config.ts (done in P5.2 task a).

**b. Optimize font loading** — In `src/app/layout.tsx`, add `display: 'swap'` to font config:

```typescript
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})
```

**c. Remove Next.js welcome page** — Replace `src/app/page.tsx` with redirect:

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/login')
}
```

**d. Run build verification** — Execute `npm run build` and verify:
- Build succeeds with zero errors
- `.next/standalone` directory created
- Bundle size reasonable (target: < 500KB total JS)

**Verify:** `npm run build` succeeds. Check `.next/standalone/server.js` exists.

---

### Task P5.4: Fix AuthProvider to use PocketBase SDK (Wave 2)

This is the prerequisite for working production login. The current AuthProvider calls FastAPI endpoints that don't exist. Per ARCHITECTURE-DECISION.md section 2, auth must use PocketBase SDK. This implements D-01, D-05, D-09.

**a. Rewrite `src/lib/AuthProvider.tsx`** — Replace FastAPI token auth with PocketBase SDK:

```typescript
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import pb from '@/lib/pocketbase'

export interface User {
  id: string
  name: string | null
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          const record = pb.collection('users').getFirstListItem(
            `id=${pb.authStore.recordId}`
          )
          if (record) {
            setUser({
              id: record.id,
              name: record.name || null,
              email: record.email,
            })
          }
        } catch {
          pb.authStore.clear()
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await pb.collection('users').authWithPassword(email, password)
      const record = pb.authStore.model
      if (record) {
        setUser({
          id: record.id,
          name: record.name || null,
          email: record.email,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    pb.authStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
```

**b. Add LogoutButton component** — Create `src/components/auth/LogoutButton.tsx`:

```typescript
'use client'

import { useAuth } from '@/lib/AuthProvider'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const { signOut } = useAuth()

  return (
    <button
      onClick={() => {
        signOut()
        window.location.href = '/login'
      }}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  )
}
```

**c. Update `src/components/layout/header.tsx`** — Replace any old user display with `LogoutButton` and show current user email.

**d. Update `src/lib/api.ts`** — The centralized API client currently reads from localStorage. Since auth now uses PocketBase SDK (token in localStorage via pb.authStore), update `getToken()`:

```typescript
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  const pb = require('@/lib/pocketbase').default
  return pb.authStore.token || null
}
```

**e. Update `src/app/login/page.tsx`** — The login page already uses `useAuth().signIn()` — it needs no structural changes, but the AuthProvider rewrite above replaces the FastAPI fetch calls with PocketBase SDK.

**Verify:** `npm run build` succeeds. Login flow uses `pb.authWithPassword()` (not FastAPI fetch calls).

---

### Task P5.5: Production verification and documentation (Wave 3)

Final deployment verification, environment setup, and documentation.

**a. Create deploy checklist** — Create `.planning/phases/05/deploy-checklist.md` with the checklist from the execution context.

**b. Create README.md** — Create project root README:

```markdown
# Property-Pi

Property management for small portfolios (≤5 units).

## Tech Stack
- Frontend: Next.js 16, React 19, Tailwind CSS v4
- Backend: PocketBase (auth + database + file storage)
- Reporting: FastAPI (aggregation, automation)

## Development

```bash
# Frontend
npm install
npm run dev

# Backends (Docker Compose)
docker compose up pb backend
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions.

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_POCKETBASE_URL` | Vercel | PocketBase instance URL |
| `POCKETBASE_URL` | fly.io/Railway | PocketBase URL (internal) |
| `FASTAPI_URL` | fly.io/Railway | FastAPI URL (internal) |
| `BACKEND_SECRET_KEY` | fly.io/Railway | JWT signing key |
| `BACKEND_POCKETBASE_ADMIN_SECRET` | fly.io/Railway | PocketBase admin API key |
```

**c. Create DEPLOYMENT.md** — Create project root DEPLOYMENT.md with fly.io and Vercel setup instructions.

**d. Run full verification** — Execute:
- `npm run build` — verify zero errors
- `docker compose config` — verify compose file validity
- `npx tsc --noEmit` — verify zero type errors

**e. Checkpoint: production deployment verification** — Pause for user to verify:
- Docker Compose starts all services
- Login page works with PocketBase auth
- Dashboard loads under 5 seconds

## Verification

### Docker Compose
```bash
docker compose up --build
curl http://localhost:8000/health
```

### Build Verification
```bash
npm install
npm run build
ls .next/standalone/server.js
```

### Type Checking
```bash
npx tsc --noEmit
```

### Security Headers
```bash
curl -I http://localhost:3000
# Verify X-Content-Type-Options, X-Frame-Options, Cache-Control present
```

## Success Criteria

- [ ] Docker Compose starts all 3 services (pb, backend, app)
- [ ] `npm run build` succeeds with zero errors
- [ ] `npx tsc --noEmit` passes
- [ ] Security headers present on Next.js responses
- [ ] Rate limiting configured on FastAPI auth endpoint
- [ ] CORS configured with explicit production origins
- [ ] No hardcoded secrets in codebase
- [ ] `.env` files excluded from git
- [ ] README.md and DEPLOYMENT.md created
- [ ] Dashboard loads under 5s (verified via Lighthouse or similar)

## Output

After completion, create `.planning/phases/05/05-05-SUMMARY.md`
