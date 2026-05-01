# Property-Pi Refactor Plan: Next.js SSR → Vite SPA

## Why

Property-Pi's Dokploy deployment is broken because Next.js server-side components cannot reach the backend. Every attempt to resolve the backend URL (`API_URL` env var, `Host` header, `backend:8000` service name, `X-Forwarded-Host`, query param auth) has failed. The root cause: **server-side fetches inside a Dokploy container cannot reach the backend container**.

Fulfillment-360 works on the same Dokploy because it's a **pure Vite SPA** — all API calls are browser-side, routed through Traefik with `VITE_API_BASE_URL=/api/v1`.

## Target Architecture

```
property-pi/
├── docker-compose.yml     # Traefik labels, 2 services (frontend, backend)
├── frontend/
│   ├── Dockerfile         # node:20-alpine, single stage
│   ├── package.json       # Vite + React 18
│   ├── vite.config.js     # port 5173, allowedHosts
│   ├── index.html
│   └── src/
│       ├── main.jsx       # ReactDOM.createRoot
│       ├── App.jsx        # Router + layout + pages
│       ├── api.js         # fetch wrapper with VITE_API_BASE_URL
│       ├── auth.js        # token storage, auth context
│       ├── components/    # migrated from src/components/
│       └── pages/         # migrated from src/app/(dashboard)/*
├── backend/
│   ├── Dockerfile         # python:3.12-slim, uv
│   ├── pyproject.toml     # dependencies
│   ├── main.py            # FastAPI app
│   └── app/               # routers, models, auth, config, database
└── .env.example           # SECRET_KEY
```

## Migration Phases

### Phase 1: Scaffold Vite Frontend (foundation)

**Goal:** Create `frontend/` directory with Vite + React + React Router + Tailwind

**Tasks:**
1. Create `frontend/` directory structure
2. `frontend/package.json` — Vite, React 18, react-router-dom, react-hook-form, zod, recharts, lucide-react, sonner, clsx, tailwind-merge, class-variance-authority, date-fns
3. `frontend/vite.config.js` — React plugin, port 5173, preview config with `allowedHosts: ["property-pi.apps.ogbinar.com"]`
4. `frontend/index.html` — basic HTML shell
5. `frontend/src/main.jsx` — `ReactDOM.createRoot`, BrowserRouter wrapper
6. `frontend/src/api.js` — `fetch` wrapper using `VITE_API_BASE_URL` (default `/api`)
7. `frontend/src/auth.js` — `AuthContext` with `localStorage` token storage, login/logout/useAuth hook
8. `frontend/src/App.jsx` — Router setup with routes, protected route wrapper
9. `frontend/Dockerfile` — node:20-alpine, single stage, `npm run build && npm run preview`
10. Update `docker-compose.yml` — frontend build context `./frontend`, port 5173, `VITE_API_BASE_URL=/api`

**Key design decisions:**
- `VITE_API_BASE_URL=/api` — relative path, goes through Traefik
- Token stored in `localStorage` (not cookie) — avoids cookie routing issues
- React Router v6 for client-side routing
- No server-side rendering — all client-side

### Phase 2: Migrate Layout and Auth Pages

**Goal:** Login, register, and dashboard layout working

**Tasks:**
1. `frontend/src/pages/Login.jsx` — login form, redirects to `/` on success
2. `frontend/src/pages/Register.jsx` — registration form, redirects to `/` on success
3. `frontend/src/components/Layout.jsx` — sidebar + header + main content (from `src/app/(dashboard)/layout.tsx`)
4. `frontend/src/components/Sidebar.jsx` — migrate from `src/components/layout/sidebar.tsx`
5. `frontend/src/components/Header.jsx` — migrate from `src/components/layout/header.tsx`
6. Protected route wrapper — redirects to `/login` if no token
7. Test login → dashboard flow locally

### Phase 3: Migrate Dashboard and CRUD Pages

**Goal:** Dashboard and all CRUD pages functional

**Tasks:**
1. `frontend/src/pages/Dashboard.jsx` — KPI cards, charts, activity feed (from `src/app/(dashboard)/page.tsx`)
2. `frontend/src/pages/UnitsList.jsx` — units listing with CRUD actions
3. `frontend/src/pages/UnitDetail.jsx` — unit detail with tabs
4. `frontend/src/pages/UnitEdit.jsx` — unit edit form
5. `frontend/src/pages/TenantsList.jsx` — tenants listing
6. `frontend/src/pages/TenantDetail.jsx` — tenant detail
7. `frontend/src/pages/LeasesList.jsx` — leases listing
8. `frontend/src/pages/ExpensesList.jsx` — expenses listing
9. `frontend/src/pages/MaintenanceList.jsx` — maintenance listing
10. `frontend/src/pages/RentList.jsx` — rent page
11. Migrate all form components (from `src/components/forms/`)
12. Migrate all shared components (tables, modals, cards, charts)

**Auth pattern:** All API calls use `api.js` which attaches `Authorization: Bearer <token>` header from `localStorage`

### Phase 4: Backend Updates

**Goal:** Backend works with SPA auth pattern

**Tasks:**
1. Update CORS `ALLOWED_ORIGINS` to include `http://property-pi.apps.ogbinar.com`
2. Remove `/api/auth/me` query param token fallback (no longer needed — browser sends header)
3. Keep JWT auth as-is (create token on login, verify on protected endpoints)
4. Update `docker-compose.yml` backend service if needed
5. Remove `backend/Dockerfile` `ENV JWT_SECRET=change-me-in-production` line (use docker-compose env var)

### Phase 5: Dokploy Deployment

**Goal:** Deploy and verify on Dokploy

**Tasks:**
1. Update `docker-compose.yml` with correct Traefik labels for new port (5173)
2. Remove `API_URL` env var from Dokploy
3. Set `SECRET_KEY` env var in Dokploy
4. Force redeploy
5. Verify login → dashboard → CRUD flows

### Phase 6: Cleanup

**Goal:** Remove old Next.js files

**Tasks:**
1. Delete `src/`, `.next/`, `Dockerfile` (root), `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`
2. Clean up `package.json`, `package-lock.json`, `node_modules/`
3. Update `.gitignore`
4. Update `README.md`

## Auth Flow (SPA Pattern)

```
Browser → Traefik → Backend
─────────────────────────────────────────────────────────
POST /api/auth/login
  { email, password }
  → { access_token, token_type }

localStorage.setItem('token', access_token)

GET /api/dashboard
  Authorization: Bearer <token>
  → { monthly_revenue, ... }

GET /api/auth/me
  Authorization: Bearer <token>
  → { id, email, name }
```

## What Changes for the Developer

| Before (Next.js) | After (Vite SPA) |
|---|---|
| `src/app/(dashboard)/page.tsx` (server component) | `frontend/src/pages/Dashboard.jsx` (client component) |
| `cookies()` + `apiRequest` with `token` param | `api.js` auto-attaches token from `localStorage` |
| `redirect()` in server actions | `router.replace()` in React Router |
| `window.location.href` for full reload | `router.navigate()` for client navigation |
| Complex `resolveServerBase()` URL resolution | `VITE_API_BASE_URL=/api` — one line |
| Multi-stage Docker build | Single-stage Docker build |
| `getSession()` server-side fetch | `useAuth()` hook with `fetch` |

## What Stays the Same

- Backend FastAPI app (routers, models, auth, config, database)
- All API endpoints (same routes, same request/response format)
- SQLite database
- Docker Compose with Traefik routing
- Tailwind CSS styling
- Component visual design (same UI, just migrated to SPA)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Component migration is tedious (many files) | Components are largely self-contained; copy-paste with minor adjustments (TypeScript → JavaScript, `useEffect` for data fetching) |
| Lose TypeScript | Can keep TypeScript with Vite (`@vitejs/plugin-react-swc` or `@vitejs/plugin-react` with TS support) — but fulfillment-360 uses JSX for simplicity |
| Lose SEO | Property-Pi is an auth-gated app — no SEO needed |
| Form handling changes | `react-hook-form` + `zod` work the same in Vite |
| State management complexity | `AuthContext` + local state per page — same pattern as fulfillment-360 |

## Estimated Effort

- **Phase 1 (scaffold):** 30 min — straightforward setup
- **Phase 2 (auth + layout):** 1 hour — login, register, layout, sidebar, header
- **Phase 3 (pages + components):** 3-4 hours — most work, but largely mechanical migration
- **Phase 4 (backend):** 15 min — minor CORS update
- **Phase 5 (deploy):** 30 min — test on Dokploy
- **Phase 6 (cleanup):** 15 min — delete old files

**Total: ~5-6 hours of mechanical migration work**

## Why This Is the Right Move

1. **Eliminates all Dokploy URL resolution issues** — SPA pattern works reliably
2. **Matches proven pattern** — fulfillment-360 works on same Dokploy
3. **Simplifies auth** — token in localStorage, one `api.js` wrapper
4. **Reduces complexity** — no server components, no hydration, no `cookies()`, no `redirect()`
5. **Faster builds** — single-stage Docker, no Next.js standalone build
6. **Property-Pi doesn't need SSR** — auth-gated app with no public pages
