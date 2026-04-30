# Property-Pi

A lightweight rental property management application for small-scale landlords. Manage units, tenants, leases, rent payments, expenses, and maintenance requests from a single dashboard.

## Features

- **Landlord Dashboard**: Overview of all units, occupancy rate, monthly revenue, recent activity
- **Unit Management**: Track unit status (occupied, vacant, maintenance, renovation), rent history
- **Tenant Management**: Tenant profiles, contact information, lease history, contact log
- **Lease Management**: Create, renew, and terminate leases with status tracking and shared-link tokens
- **Rent Tracking**: Monthly rent generation, payment recording, overdue indicators
- **Expense Tracking**: Record and categorize property expenses, receipt uploads
- **Maintenance Requests**: Track and manage maintenance tickets
- **Tenant Portal**: Shared-link access for tenants to view their lease, payment history, and maintenance status
- **Notices**: Send digital notices to tenants or specific units

## Architecture

**Two-Service Architecture:**
- **Next.js** (TypeScript): Thin frontend client with App Router, Server Actions for authenticated API calls
- **FastAPI** (Python): REST API backend with SQLite, JWT auth, file uploads, rate limiting
- **SQLite**: Single-file database shared by the FastAPI backend

**Why this approach?**
- Simple deployment: just Next.js + FastAPI + SQLite (no separate database server)
- FastAPI handles complex aggregations (dashboard stats, rent calculations) efficiently
- Next.js provides a modern, responsive UI with server-side rendering
- SQLite eliminates infrastructure complexity for small portfolios

## Tech Stack

- **Frontend**: Next.js 14+, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy, SQLite
- **Authentication**: Custom JWT (HS256) with bcrypt password hashing, cookie-based sessions
- **File Storage**: Local filesystem (served via FastAPI static files)

## Prerequisites

- **Node.js** 18+ (for Next.js frontend)
- **Python** 3.10+ (for FastAPI backend)

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies (in backend directory)
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
```

### 3. Run Development Servers

**Terminal 1 - Backend (FastAPI):**
```bash
cd backend
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend (Next.js):**
```bash
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **FastAPI Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

### 5. First-Time Setup

The database is created automatically on first backend startup. Register your first landlord account via the login page or:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email": "admin@example.com", "password": "password123"}'
```

## Project Structure

```
property-pi/
├── src/                      # Next.js frontend
│   ├── app/                  # App Router pages and layouts
│   │   ├── (dashboard)/      # Landlord dashboard routes
│   │   ├── login/            # Login page
│   │   ├── tenant/           # Tenant portal routes
│   │   └── actions/          # Server Actions (auth, CRUD)
│   ├── components/           # React components
│   │   ├── ui/               # Reusable UI components (shadcn/ui)
│   │   └── ...               # Feature-specific components
│   └── lib/                  # Utilities and API clients
│       ├── api-client.ts     # Generic API client with cookie auth
│       ├── api-types.ts      # TypeScript types (mirrored from backend)
│       └── auth-token.ts     # Server-side token extraction from cookies
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── routers/          # API route handlers (units, tenants, leases, etc.)
│   │   ├── config.py         # Environment configuration
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # JWT creation/verification, bcrypt
│   │   ├── database.py       # SQLite connection
│   │   └── main.py           # FastAPI application
│   └── requirements.txt      # Python dependencies
├── uploads/                  # Uploaded files (receipts, documents)
├── .env.example              # Environment variable template
├── package.json              # Frontend dependencies
└── docker-compose.yml        # 2-service deployment (Next.js + FastAPI)
```

## Development

### Adding New API Endpoints

1. Create new router in `backend/app/routers/`
2. Register router in `backend/app/main.py`
3. Add Pydantic schemas in `backend/app/schemas.py`
4. Add TypeScript types in `src/lib/api-types.ts`
5. Add Server Action in `src/app/actions/`
6. Update frontend pages/components

### File Uploads

Files uploaded via `POST /api/upload` are stored in the `uploads/` directory and served at `/uploads/{filename}`.

### Tenant Portal

Tenants access the portal via a shared link with a token: `http://localhost:3000/tenant/portal?leaseId={id}&token={tenant_access}`. The token is generated via the "Generate Share Link" button on the lease detail page.

## Deployment

### Docker Compose

```bash
docker compose up --build
```

This starts both the Next.js frontend and FastAPI backend with SQLite.

### Production Considerations

- Set `SECRET_KEY` (or `JWT_SECRET`) to a strong random value
- Set `ALLOWED_ORIGINS` to your production domain
- Use `ACCESS_TOKEN_EXPIRE_MINUTES` to control session duration
- Consider using a reverse proxy (nginx, Caddy) for HTTPS termination
- Back up `property_pi.db` regularly

## License

MIT
