# Technology Stack

**Analysis Date:** 2026-04-21

## Languages

**Primary:**
- **TypeScript** 5.x - Frontend (Next.js app, components, API utilities)
- **Python** 3.x - Backend (FastAPI routers and configuration)

**Secondary:**
- **JavaScript (ESNext)** - React components with JSX
- **Python** - FastAPI backend services

## Runtime

**Frontend Environment:**
- **Node.js** - Next.js runtime
- **Package Manager:** npm (package-lock.json present)

**Backend Environment:**
- **Python** - FastAPI application
- **Virtual Environment:** `.venv` directory present
- **Package Manager:** pip (requirements.txt)

## Frameworks

### Frontend Framework
- **Next.js** 16.2.4 - Full-stack React framework with App Router
  - Route groups: `(dashboard)` and `(auth)` for layout isolation
  - Uses `'use client'` and `'use server'` directives
  - Config: `next.config.ts` (empty - defaults used)
- **React** 19.2.4 - UI library with JSX
- **Tailwind CSS** 4 - Utility-first CSS via `@tailwindcss/postcss`
  - PostCSS config: `postcss.config.mjs`
  - Theme: CSS variables via `@theme inline` in `src/app/globals.css`

### Backend Framework
- **FastAPI** 0.115.0 - Async Python API framework
  - ASGI server: **uvicorn** 0.32.1 (`uvicorn[standard]`)
  - Validation: **pydantic-settings** 2.5.2 for configuration
  - HTTP client: **httpx** 0.27.2 for PocketBase API calls

### Build/Dev Tools
- **TypeScript** 5.x - Strict mode, ES2017 target
  - Config: `tsconfig.json` with `@/*` path alias → `./src/*`
- **ESLint** 9 - Linting via `eslint-config-next`
  - Config: `eslint.config.mjs` (flat config format)
  - Rules: Core web vitals + TypeScript config
- **tsx** 4.21.0 - TypeScript execution utility

## Key Dependencies

### Frontend (package.json)

**UI & Styling:**
- `lucide-react` ^1.8.0 - Icon library for navigation and UI elements
- `sonner` ^2.0.7 - Toast notification system
- `recharts` ^3.8.1 - Charting library for dashboard visualizations
- `class-variance-authority` ^0.7.1 - Component variant management
- `clsx` ^2.1.1 - Conditional class merging
- `tailwind-merge` ^3.5.0 - Resolves Tailwind class conflicts

**Forms & Validation:**
- `react-hook-form` ^7.72.1 - Form state management
- `@hookform/resolvers` ^5.2.1 - Schema validation integration
- `zod` ^4.3.6 - Schema validation for forms and API data

**Data & Utilities:**
- `date-fns` ^4.1.0 - Date manipulation utilities

### Backend (backend/requirements.txt)
- `fastapi` 0.115.0 - Web framework
- `uvicorn[standard]` 0.32.1 - ASGI server
- `httpx` 0.27.2 - Async HTTP client (PocketBase API calls)
- `pydantic-settings` 2.5.2 - Settings management from environment

## Database & Storage

### PocketBase (Primary Backend-as-a-Service)
- **SDK:** `pocketbase` ^0.25.0 (JavaScript client)
- **Configuration:**
  - Default URL: `http://localhost:8090`
  - Environment variable: `NEXT_PUBLIC_POCKETBASE_URL`
- **Client singleton:** `src/lib/pocketbase.ts`
- **Type definitions:** `src/types/pocketbase.ts`

**Collections (Schema):**
- `users` - User accounts (landlord/tenant roles)
- `units` - Property units with status tracking
- `tenants` - Tenant information
- `leases` - Lease agreements
- `payments` - Payment records
- `expenses` - Expense tracking
- `maintenance_requests` - Maintenance tickets
- **Note:** Additional collections may exist in PocketBase database

### No Traditional Database
- No PostgreSQL detected (Prisma/SQLAlchemy removed)
- No MongoDB detected
- No Redis detected
- All persistence via PocketBase

## Configuration

### Environment (.env)
- `NEXT_PUBLIC_POCKETBASE_URL` - PocketBase server URL
- `.env` file present (contents not read for security)

### Build Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies and npm scripts |
| `package-lock.json` | npm lockfile |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration (empty) |
| `eslint.config.mjs` | ESLint flat config |
| `postcss.config.mjs` | PostCSS with Tailwind plugin |
| `backend/requirements.txt` | Python backend dependencies |
| `backend/app/config.py` | Pydantic settings (BACKEND_ prefix) |

## Platform Requirements

### Development
- **Frontend:** `npm run dev` → `next dev` (port 3000)
- **Backend:** `uvicorn app.main:app` (port 8000)
- **PocketBase:** Self-hosted binary at root (`./pocketbase`)
  - Default port: 8090
  - Runs locally: `./pocketbase serve`

### Production
- **Frontend:** `npm run build` → `next build` + `next start`
- **Backend:** `uvicorn` with production settings
- **PocketBase:** Self-hosted deployment required
- No Dockerfile detected
- No CI/CD pipeline detected
- No hosting platform configured (Vercel, Netlify, etc.)

## Architecture Notes

### Dual-Layer Backend Pattern
The project has both a Python FastAPI layer and a JavaScript/TypeScript frontend layer:
- **Frontend:** Uses PocketBase SDK directly for most operations (`src/lib/api.ts`, `src/lib/tenant-api.ts`)
- **Backend (FastAPI):** Aggregation layer that fetches from PocketBase via HTTP and computes summaries
  - Example: `/api/fastapi/dashboard` endpoint in `backend/app/routers/dashboard.py`
  - Uses `httpx.AsyncClient` to call PocketBase REST API

### No ORM Layer
- Prisma removed (no `prisma/` directory, no `@prisma/client`)
- SQLAlchemy present in requirements but not actively used
- Direct PocketBase REST API calls via SDK and httpx

---

*Stack analysis: 2026-04-21*
