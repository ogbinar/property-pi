# Test Plan: Fix "Not Found" After Login

## Root Cause
After login, `router.replace('/')` navigates to `src/app/page.tsx`. This page checks for a session cookie and renders `<DashboardPage />` (imported from `(dashboard)/page`). However, when the user navigates to any sub-route (e.g., `/units`), the `(dashboard)/layout.tsx` runs `getSession()` which does `fetch('/api/auth/me')` with a relative URL. In Next.js 16 standalone mode, server-side `fetch()` cannot handle relative URLs — Node.js requires absolute URLs. This causes `getSession()` to throw, returns null, renders `<LoginRedirectClient>`, which calls `router.replace('/login')` from within a layout context. Next.js 16 standalone cannot handle client-side redirects from layout components, resulting in "Not Found".

## Fixes
1. **Dashboard layout fetch URL** (`src/app/(dashboard)/layout.tsx:13`): Replace relative URL with server-side absolute URL using `process.env.API_URL || 'http://backend:8000'`
2. **Remove unused `notFound` import** (`src/app/page.tsx:2`): Unused import can cause issues in standalone builds

## Test Plan

### Build Tests
| # | Test | Command | Expected |
|---|------|---------|----------|
| B1 | Clean build succeeds | `npm run build` | Exit 0, no errors |
| B2 | All routes present in build | `npx next dev` output | `/`, `/login`, `/register`, `/units`, etc. |

### Backend Tests
| # | Test | Command | Expected |
|---|------|---------|----------|
| BK1 | All API tests pass | `cd backend && source .venv/bin/activate && python -m pytest tests/test_api.py -v` | 33/33 pass |

### Authentication Flow Tests (Manual/Integration)
| # | Test | Steps | Expected |
|---|------|-------|----------|
| A1 | Login → Dashboard redirect | Login with valid credentials | Redirects to `/`, shows dashboard content |
| A2 | Dashboard sub-route navigation | Click sidebar link to `/units` | Shows units page with sidebar and header |
| A3 | Dashboard sub-route navigation | Navigate to `/expenses` | Shows expenses page with sidebar and header |
| A4 | Dashboard sub-route navigation | Navigate to `/maintenance` | Shows maintenance page with sidebar and header |
| A5 | Dashboard sub-route navigation | Navigate to `/tenants` | Shows tenants page with sidebar and header |
| A6 | Dashboard sub-route navigation | Navigate to `/leases` | Shows leases page with sidebar and header |
| A7 | Dashboard sub-route navigation | Navigate to `/rent` | Shows rent page with sidebar and header |
| A8 | No cookie → Login redirect | Visit `/` without session cookie | Redirects to `/login` |
| A9 | No session → Login redirect | Visit `/units` without session cookie | Redirects to `/login` |
| A10 | Register → Dashboard | Register new user | Redirects to `/`, shows dashboard |

### Server-Side Session Check Tests
| # | Test | Steps | Expected |
|---|------|-------|----------|
| S1 | Dashboard layout with valid session | Visit `/units` with valid session cookie | Renders layout with sidebar, header, and units content |
| S2 | Dashboard layout with invalid session | Visit `/units` with invalid/expired token | Renders LoginRedirectClient → redirects to `/login` |
| S3 | Dashboard layout with no cookie | Visit `/units` with no cookie | Renders LoginRedirectClient → redirects to `/login` |

### API Client Tests
| # | Test | Steps | Expected |
|---|------|-------|----------|
| AP1 | Server-side fetch in layout | `API_URL` is set to `http://backend:8000` | `getSession()` fetches from absolute URL |
| AP2 | Server-side fetch in page.tsx | Root page imports dashboard page | Dashboard data loads via `apiRequest` (which uses `SERVER_API_BASE`) |

## Implementation Order
1. Fix 1: Dashboard layout server-side fetch URL
2. Fix 2: Remove unused `notFound` import
3. Build and verify
4. Run backend tests
5. Manual verification of login flow
