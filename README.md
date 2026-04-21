# Property-Pi

A lightweight rental property management application for small-scale landlords. Manage units, tenants, leases, rent payments, expenses, and maintenance requests from a single dashboard.

## Features

- **Landlord Dashboard**: Overview of all units, occupancy rate, monthly revenue, recent activity
- **Unit Management**: Track unit status (occupied, vacant, maintenance, renovation)
- **Tenant Management**: Tenant profiles, contact information, lease history
- **Lease Management**: Create, renew, and terminate leases with status tracking
- **Rent Tracking**: Monthly rent generation, payment recording, overdue indicators
- **Expense Tracking**: Record and categorize property expenses
- **Maintenance Requests**: Track and manage maintenance tickets
- **Tenant Portal**: Shared-link access for tenants to view their lease, payment history, and maintenance status

## Architecture

**Hybrid Backend Approach:**
- **PocketBase** (Go/SQLite): Primary data storage, authentication, file storage, real-time updates
- **FastAPI** (Python): Aggregation layer for complex queries, reporting, and automation
- **Next.js** (TypeScript): Frontend UI with App Router

**Why this approach?**
- PocketBase provides instant CRUD, auth, and file storage out of the box
- FastAPI handles complex aggregations (dashboard stats, rent calculations) that would be inefficient in PocketBase
- Next.js API routes serve as a unified proxy to both backends

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: PocketBase (BaaS), FastAPI (Python)
- **Database**: SQLite (via PocketBase)
- **Authentication**: PocketBase email/password
- **State Management**: PocketBase SDK reactive auth store

## Prerequisites

- **Node.js** 18+ (for Next.js frontend)
- **Python** 3.10+ (for FastAPI backend)
- **PocketBase** binary (download from [pocketbase.io](https://pocketbase.io))

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

### 2. Set Up PocketBase

```bash
# Download PocketBase from https://pocketbase.io/docs/
# Place the `pocketbase` binary in the project root

# Initialize PocketBase (creates pb_data directory)
./pocketbase migrate

# Start PocketBase server
./pocketbase serve
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# - NEXT_PUBLIC_POCKETBASE_URL: Your PocketBase URL (http://localhost:8090 for dev)
# - BACKEND_POCKETBASE_URL: PocketBase URL for backend (same as above for dev)
# - BACKEND_POCKETBASE_ADMIN_TOKEN: Admin token for server-to-server calls (optional for dev)
# - BACKEND_FASTAPI_PORT: FastAPI server port (default: 8000)
```

### 4. Set Up PocketBase Collections

1. Open PocketBase Admin UI: http://localhost:8090/_/
2. Create the following collections (or import from schema):
   - `users` - Landlord accounts
   - `units` - Property units
   - `tenants` - Tenant information
   - `leases` - Lease agreements
   - `payments` - Payment records
   - `expenses` - Expense tracking
   - `maintenance_requests` - Maintenance tickets

### 5. Run Development Servers

**Terminal 1 - PocketBase:**
```bash
./pocketbase serve
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Backend:**
```bash
cd backend
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **PocketBase Admin**: http://localhost:8090/_/
- **FastAPI Docs**: http://localhost:8000/docs

## Project Structure

```
property-pi/
├── src/                      # Next.js frontend
│   ├── app/                  # App Router pages and layouts
│   │   ├── (dashboard)/      # Landlord dashboard routes
│   │   ├── (auth)/           # Authentication routes
│   │   └── tenant/           # Tenant portal routes
│   ├── components/           # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   └── ...               # Feature-specific components
│   └── lib/                  # Utilities and API clients
│       ├── pocketbase.ts     # PocketBase SDK client
│       └── api.ts            # Frontend API functions
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── routers/          # API route handlers
│   │   ├── config.py         # Environment configuration
│   │   └── main.py           # FastAPI application
│   └── requirements.txt      # Python dependencies
├── .env.example              # Environment variable template
├── package.json              # Frontend dependencies
└── pocketbase                # PocketBase binary
```

## Development

### Creating New Collections in PocketBase

1. Add collection via Admin UI or CLI
2. Update `src/types/pocketbase.ts` with new type definitions
3. Add API functions in `src/lib/api.ts`
4. Create components and pages as needed

### Adding Backend Endpoints

1. Create new router in `backend/app/routers/`
2. Register router in `backend/app/main.py`
3. Use `httpx` to call PocketBase Admin API
4. Add type hints with Pydantic models

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions to Vercel (frontend), Railway/fly.io (backend + PocketBase).

## License

MIT
