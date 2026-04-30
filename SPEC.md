# Project Specification: Property-Pi (Small Portfolio Property Manager)

## 1. Overview
Property-Pi is a lightweight property management application for small-scale landlords managing a small portfolio (optimally 1-20 units). Unlike enterprise-grade software, Property-Pi focuses on simplicity, speed, and the essential workflows of a small-scale landlord.

## 2. Target User
Small-scale landlords or property managers who own/manage a small number of residential units.

## 3. Core Features

### 3.1. Unit & Lease Management
- **Unit Dashboard:** Visual overview of all units with status indicators
- **Unit Details:** Unit number/identifier, type (Studio, 1BR, 2BR), status (Occupied, Vacant, Maintenance, Under Renovation), rent amount, security deposit, name, floor, area, features, description
- **Lease Lifecycle Tracking:** Automated tracking of lease start/end dates and notice periods
- **Renewal Workflow:** Automated alerts for upcoming expirations (60/30/15 days before), "Renew/Do Not Renew" status tracking, rent increase tracking
- **Tenant Profiles:** Name, contact information (Email, Phone), linked active lease, emergency contact, notes, contact log

### 3.2. Financial Management
- **Rent Tracking & Collection:** Monthly rent invoices generated automatically, payment status tracking (Paid, Pending, Overdue, Partial), rent adjustment history stored as JSON on Unit
- **Expense Logging:** Categorized expenses (Repairs, Utilities, Taxes, Insurance, Other), receipt upload/attachment, per-unit or general expenses
- **Financial Reporting:** Monthly cash flow (Income vs. Expenses), occupancy rate tracking, total revenue/profit per unit, expense breakdown by category

### 3.3. Maintenance
- **Maintenance Request Logging:** Track and manage maintenance tickets with priority and status
- **Tenant-Submitted Requests:** Tenants can submit maintenance requests via shared portal link

### 3.4. Communication
- **Tenant Notice System:** Send simple digital notices (e.g., "Maintenance scheduled for Tuesday") with type (general, warning, notice) and status (draft, active, archived)
- **Contact Log:** Quick log of interactions with tenants, stored as JSON on Tenant

### 3.5. Tenant Portal
- **Shared-Link Access:** Tenants access read-only dashboard via secure shared link (token-based, no login required)
- **Tenant View:** Lease details, payment history, maintenance request status, notices

## 4. Technical Stack (Actual)

### Frontend
- **Framework:** Next.js 14+ (App Router) with TypeScript
- **UI:** React 19, Tailwind CSS 4, shadcn/ui components
- **Auth:** Client-side `'use client'` Server Actions for login/register (JWT cookie persistence), `'use server'` Server Actions for authenticated API calls via `getServerToken()` (reads `session` cookie)
- **Routing:** Route groups `(dashboard)` for landlord pages, `tenant/` for tenant portal, `/login` for auth
- **Pages:** 26 routes total (5 static, 21 dynamic) — dashboard, units CRUD, tenants CRUD, leases CRUD, payments (rent), expenses CRUD, maintenance CRUD, tenant portal

### Backend
- **Framework:** Python 3.10+ FastAPI
- **Database:** SQLite (single file `property_pi.db`)
- **ORM:** SQLAlchemy (declarative models, `Base.metadata.create_all()` on startup — no migrations)
- **Auth:** Custom JWT (HS256) with bcrypt password hashing, cookie-based session (`session` cookie, 2-hour expiry)
- **API:** RESTful endpoints at `/api/*` with manual dict serializers (`_to_out` functions)
- **File Uploads:** `POST /api/upload` (10MB limit, allowed extensions: pdf, jpg, jpeg, png, gif, webp, doc, docx), files served at `/uploads/{filename}`
- **Rate Limiting:** slowapi (IP-based)
- **CORS:** Configurable via `ALLOWED_ORIGINS` env var (comma-separated)

### Environment Variables
```env
# Backend (FastAPI)
DATABASE_URL=sqlite:///./property_pi.db        # or db_url env var
SECRET_KEY=your-jwt-secret-here               # or jwt_secret env var
ACCESS_TOKEN_EXPIRE_MINUTES=120               # or access_token_expire_minutes
ALLOWED_ORIGINS=http://localhost:3000         # or allowed_origins (comma-separated)
FASTAPI_PORT=8000                             # or fastapi_port

# Frontend (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:8000     # Backend API base URL
```

## 5. Database Schema

### Tables (8 total)
| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | Landlord accounts | id, email, password_hash, name, role, created_at, updated_at |
| `units` | Property units | id, number, name, floor, area, type, rent, deposit, status, features, description, **rent_history** (JSON Text) |
| `tenants` | Tenant information | id, first_name, last_name, email, phone, emergency_contact, unit_id, move_in_date, move_out_date, status, notes, **contact_log** (JSON Text), user_id, created_at, updated_at |
| `leases` | Lease agreements | id, unit_id, tenant_id, start_date, end_date, monthly_rent, deposit_amount, status, tenant_access (shared link token), created_at, updated_at |
| `payments` | Payment records | id, unit_id, tenant_id, lease_id, amount, date, due_date, type, status, payment_method, notes, created_at, updated_at |
| `expenses` | Expense tracking | id, unit_id, amount, category, description, date, status, file_url, created_at, updated_at |
| `maintenance` | Maintenance tickets | id, unit_id, tenant_id, title, description, priority, status, cost, created_at, updated_at |
| `notices` | Tenant notices | id, unit_id, tenant_id, title, message, type, status, created_at, updated_at |

### JSON Fields
- **`Unit.rent_history`**: JSON array of `{old_rent, new_rent, effective_date, reason}` entries. Accessible via dedicated CRUD endpoints.
- **`Tenant.contact_log`**: JSON array of interaction entries. Accessible via dedicated CRUD endpoints.

## 6. API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new landlord user |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/auth/me` | Get current user (requires auth) |
| POST | `/api/auth/logout` | Logout (token cleared client-side) |

### Units (`/api/units`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/units/` | List all units |
| GET | `/api/units/{id}` | Get unit by ID |
| POST | `/api/units/` | Create new unit |
| PUT | `/api/units/{id}` | Update unit |
| DELETE | `/api/units/{id}` | Delete unit |
| POST | `/api/units/{id}/rent-history` | Add rent history entry |
| GET | `/api/units/{id}/rent-history` | Get rent history |
| PUT | `/api/units/{id}/rent-history` | Replace entire rent history |

### Tenants (`/api/tenants`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tenants/` | List all tenants |
| GET | `/api/tenants/{id}` | Get tenant by ID |
| POST | `/api/tenants/` | Create new tenant |
| PUT | `/api/tenants/{id}` | Update tenant |
| DELETE | `/api/tenants/{id}` | Delete tenant |
| POST | `/api/tenants/{id}/contact-log` | Add contact log entry |
| GET | `/api/tenants/{id}/contact-log` | Get contact log |
| PUT | `/api/tenants/{id}/contact-log` | Replace entire contact log |

### Leases (`/api/leases`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leases/` | List all leases |
| GET | `/api/leases/{id}` | Get lease by ID (with tenant/unit relations) |
| POST | `/api/leases/` | Create new lease |
| PUT | `/api/leases/{id}` | Update lease |
| DELETE | `/api/leases/{id}` | Delete lease |
| POST | `/api/leases/{id}/share-link` | Generate tenant access token |

### Payments (`/api/payments`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/payments/` | List all payments |
| GET | `/api/payments/{id}` | Get payment by ID |
| POST | `/api/payments/` | Create payment |
| PUT | `/api/payments/{id}` | Update payment |
| DELETE | `/api/payments/{id}` | Delete payment |
| POST | `/api/payments/generate-monthly` | Generate rent payments for all occupied units |

### Expenses (`/api/expenses`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/expenses/` | List all expenses |
| GET | `/api/expenses/{id}` | Get expense by ID |
| POST | `/api/expenses/` | Create expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |

### Maintenance (`/api/maintenance`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/maintenance/` | List all maintenance requests |
| GET | `/api/maintenance/{id}` | Get request by ID |
| POST | `/api/maintenance/` | Create request |
| PUT | `/api/maintenance/{id}` | Update request |
| DELETE | `/api/maintenance/{id}` | Delete request |

### Dashboard (`/api/dashboard`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Full dashboard data (unit counts, occupancy, revenue, expenses, expiring leases) |

### Tenant Portal (`/api/tenant`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tenant/{lease_id}?token=xxx` | Get tenant portal data (lease, payments, maintenance, notices) |
| POST | `/api/tenant/{lease_id}/maintenance?token=xxx` | Submit maintenance request |
| GET | `/api/tenant/{lease_id}/payments?token=xxx` | Get payments |
| GET | `/api/tenant/{lease_id}/maintenance?token=xxx` | Get maintenance requests |
| GET | `/api/tenant/{lease_id}/notices?token=xxx` | Get notices |

### Upload (`/api/upload`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload/` | Upload file (receipt, document) |

### Static Files
| Path | Description |
|------|-------------|
| `/uploads/{filename}` | Served uploaded files |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

## 7. Success Metrics
- Ability to see the status of all units in under 5 seconds
- Zero confusion on which tenant owes rent for the current month
- Clear visibility into monthly net profit
- Tenants can access their data without creating an account
