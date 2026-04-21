# Technology Stack

**Analysis Date:** 2026-04-21

## Languages

**Primary:**
- TypeScript 5.x - Frontend application (`tsconfig.json`)
- Python 3.12 - Backend API (`backend/Dockerfile`, `backend/requirements.txt`)

**Secondary:**
- JavaScript (React components with JSX)

## Runtime

**Environment:**
- Node.js 20 (Alpine Linux for Docker) - Next.js frontend
- Python 3.12 (Slim Linux for Docker) - FastAPI backend

**Package Manager:**
- npm - Frontend dependencies (`package.json`, `package-lock.json` present)
- pip - Backend dependencies (`backend/requirements.txt`)

## Frameworks

**Core:**
- Next.js 16.2.4 - Full-stack React framework with App Router
- React 19.2.4 - UI library
- React DOM 19.2.4 - DOM rendering
- FastAPI 0.115.0 - Python backend API framework
- Uvicorn 0.32.1 - ASGI server for FastAPI

**Testing:**
- Not detected (no test framework configured)

**Build/Dev:**
- ESLint 9 - Code linting (`eslint.config.mjs`)
- Tailwind CSS 4 - Utility-first CSS framework
- PostCSS - CSS processing (`postcss.config.mjs`)
- TypeScript 5.x - Type checking
- tsx 4.21.0 - TypeScript execution

## Key Dependencies

**Critical:**
- `pocketbase` 0.25.0 - PocketBase JavaScript SDK for database/auth client (`package.json`)
- `zod` 4.3.6 - Schema validation and type inference
- `react-hook-form` 7.72.1 - Form management
- `@hookform/resolvers` 5.2.1 - Hook form resolvers integration
- `lucide-react` 1.8.0 - Icon library
- `recharts` 3.8.1 - Charting library for dashboards
- `sonner` 2.0.7 - Toast notifications
- `date-fns` 4.1.0 - Date utilities
- `class-variance-authority` 0.7.1 - CSS class variants
- `clsx` 2.1.1 - Conditional class joining
- `tailwind-merge` 3.5.0 - Tailwind class merging
- `httpx` 0.27.2 - HTTP client for FastAPI backend
- `pydantic-settings` 2.5.2 - Settings management for FastAPI
- `slowapi` 0.1.9 - Rate limiting for FastAPI

**Infrastructure:**
- `frodenas/pocketbase:0.24.0` Docker image - PocketBase database server (`docker-compose.yml`)

## Configuration

**Environment:**
- Environment variables via `.env` files
- Frontend: `NEXT_PUBLIC_POCKETBASE_URL` for PocketBase connection
- Backend: `POCKETBASE_URL`, `BACKEND_SECRET_KEY`, `FASTAPI_PORT`
- Configuration loaded via `pydantic-settings` in `backend/app/config.py`

**Build Files:**
- `package.json` - Frontend dependencies and scripts
- `backend/requirements.txt` - Backend Python dependencies
- `tsconfig.json` - TypeScript configuration with path alias `@/*` → `./src/*`
- `next.config.ts` - Next.js configuration with standalone output, security headers
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS configuration
- `docker-compose.yml` - Multi-container orchestration (PocketBase, Backend, Frontend)
- `Dockerfile` - Frontend multi-stage build (deps → builder → runner)
- `backend/Dockerfile` - Backend multi-stage build (builder → production)

## Platform Requirements

**Development:**
- Node.js 20+ with npm
- Python 3.12+ with pip/venv
- Docker and Docker Compose (for full stack including PocketBase)

**Production Deployment Target:**
- Node.js 20 Alpine container (standalone Next.js server on port 3000)
- Python 3.12 Slim container (Uvicorn + FastAPI on port 8000)
- PocketBase container (frodenas/pocketbase:0.24.0 on port 8090)
- All services orchestrated via Docker Compose

---

*Stack analysis: 2026-04-21*
