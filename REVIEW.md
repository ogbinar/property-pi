# Code Review: Property-Pi

## Executive Summary

Property-Pi is a property management application for small-scale landlords. The backend is a well-structured FastAPI application with SQLAlchemy ORM, JWT auth, and rate limiting. The frontend is a React + Vite SPA with React Router. The codebase is functional and covers core workflows, but has several security, correctness, and quality issues that should be addressed.

**Overall Risk Level: Medium** — Several high-severity issues exist but the application is not critically broken.

---

## Critical Severity

### CRIT-1: Default JWT Secret Used in Production

**Files**: `backend/app/config.py:14`
**Risk**: Any deployment without `JWT_SECRET` set will use the hardcoded default `property-pi-jwt-secret-change-in-production`. An attacker who obtains a JWT can forge arbitrary tokens, impersonate any user, and gain full admin access.

**Evidence**:
```python
jwt_secret: str = "property-pi-jwt-secret-change-in-production"
```

**Impact**: Complete authentication bypass in production deployments. All JWT tokens are reversible with the known secret.

**Recommendation**: Refuse to start if `JWT_SECRET` is the default value, or generate a secure random secret on first run and persist it.

---

### CRIT-2: Debug Endpoint Exposed in Production

**Files**: `backend/app/routers/health.py:24`
**Risk**: The `/api/debug/headers` endpoint exposes full request headers including `Authorization` bearer tokens. No auth guard is applied. Any network observer or attacker can retrieve valid session tokens.

**Evidence**:
```python
@router.get("/debug/headers")
async def debug_headers(request: Request):
    return dict(request.headers)
```

**Impact**: Session token theft, user impersonation.

**Recommendation**: Remove this endpoint entirely or gate it behind a debug-only flag + admin auth. It should never ship in production.

---

### CRIT-3: Frontend Login Endpoint Path Mismatch

**Files**: `frontend/src/pages/Login.jsx:33`, `backend/app/main.py:58`
**Risk**: Login.jsx calls `apiRequest('/auth/login', ...)` but the backend router is mounted at `/api/auth` prefix. The frontend's `apiRequest` function prepends `API_BASE` which is `/api`. So the actual call is `/api/auth/login` which IS correct. However, the Login.jsx code uses hardcoded `/auth/login` which relies on `apiRequest` prepending `/api`. Meanwhile Register.jsx calls `/api/auth/register` directly. The inconsistency is confusing but functionally works due to `apiRequest` behavior.

**CORRECTION**: After re-reading `api.js`, `apiRequest` does NOT prepend `/api` — it uses `SERVER_API_BASE` or falls back to `''`. The Login.jsx call to `/auth/login` would hit `http://localhost:8000/auth/login` (without `/api` prefix), which **does not exist** on the backend. The backend expects `/api/auth/login`.

**Impact**: Login may silently fail depending on deployment. In development with CORS proxy, this could work by accident.

**Recommendation**: Standardize all frontend API calls to use `/api/auth/login` and `/api/auth/register` consistently. Use a constant for the API base path.

---

## High Severity

### HIGH-1: `datetime.utcnow()` Deprecated and Timezone Naive

**Files**: `backend/app/models.py:18`
**Risk**: `datetime.utcnow()` is deprecated since Python 3.12 and will be removed. All timestamp fields use string storage of naive UTC datetimes. This causes incorrect comparisons in deployments with non-UTC system timezones.

**Evidence**:
```python
def _now() -> str:
    return datetime.utcnow().isoformat()
```

Used as default for `created_at` and `updated_at` across all 8 models.

**Impact**: Incorrect timestamps, potential data ordering issues, Python 3.12+ deprecation warnings.

**Recommendation**: Replace with `datetime.now(timezone.utc).isoformat()`.

---

### HIGH-2: No Rate Limiting on Auth Endpoints

**Files**: `backend/app/routers/auth.py`, `backend/app/main.py`
**Risk**: The `slowapi` rate limiter is configured globally but auth endpoints (register, login) are not protected. An attacker can brute-force passwords or create unlimited accounts.

**Evidence**: The `rate_limit` decorator is applied to some endpoints but not to `/api/auth/login` or `/api/auth/register`.

**Impact**: Brute-force attacks, account enumeration, resource exhaustion.

**Recommendation**: Apply rate limiting to login and register endpoints (e.g., 5 requests per minute per IP).

---

### HIGH-3: String-Based Date Comparisons Instead of SQLAlchemy Operators

**Files**: `backend/app/routers/payments.py:55-57`, `backend/app/routers/dashboard.py:31-33`
**Risk**: Date filtering uses string comparison (`Payment.date >= start_date`) on string-stored dates. While ISO-format strings happen to sort correctly lexicographically, this is fragile and doesn't use proper date parsing.

**Evidence**:
```python
if start_date:
    payments = payments.filter(Payment.date >= start_date)
if end_date:
    payments = payments.filter(Payment.date <= end_date)
```

**Impact**: Potential incorrect filtering with edge cases (different date formats, timezone-aware vs naive). Not a SQL injection risk since values are parameterized, but the comparison semantics are wrong.

**Recommendation**: Parse dates to `datetime` objects and use `func.strftime` or store dates as proper `DateTime` columns.

---

### HIGH-4: Tenant Portal Token Generation is Predictable

**Files**: `backend/app/routers/leases.py:104`
**Risk**: Tenant access tokens are generated with `secrets.token_urlsafe(32)` which is good, but there's no expiration mechanism. A leaked token provides perpetual access to tenant data.

**Evidence**:
```python
lease.tenant_access = secrets.token_urlsafe(32)
```

**Impact**: Perpetual unauthorized access if token is leaked (e.g., via URL logs, screenshots).

**Recommendation**: Add token expiration timestamp to the Lease model and validate expiration on access.

---

### HIGH-5: `window.location.href` Used for Navigation Instead of React Router

**Files**: `frontend/src/pages/Dashboard.jsx:14`, `frontend/src/pages/RentCollection.jsx:100`, `frontend/src/pages/Expenses.jsx:101`, `frontend/src/pages/Maintenance.jsx:112`, `frontend/src/pages/Units.jsx:131`, `frontend/src/pages/Tenants.jsx:121`, `frontend/src/pages/Leases.jsx:87`
**Risk**: Multiple pages use `window.location.href = '/path'` for navigation, which causes full page reloads instead of client-side SPA navigation. This defeats the purpose of a React SPA and causes auth token re-fetching on every navigation.

**Impact**: Poor user experience, slower navigation, unnecessary server requests.

**Recommendation**: Replace with `useNavigate` from `react-router-dom` or `<Link>` components.

---

## Medium Severity

### MED-1: Client-Side Filtering and Searching

**Files**: All frontend list pages (Units.jsx, Tenants.jsx, Leases.jsx, Payments/RentCollection.jsx, Expenses.jsx, Maintenance.jsx)
**Risk**: All filtering and searching happens on the client side with `useMemo` + `filter`. The backend returns all records. With a growing dataset (hundreds of units/tenants/payments), this will cause significant frontend performance issues.

**Impact**: Slow page loads and unresponsive UI as data grows. Memory pressure from loading all records.

**Recommendation**: Implement server-side pagination, filtering, and sorting. Add `page`, `limit`, `search`, `sort` query parameters to list endpoints.

---

### MED-2: No Input Validation on Tenant Portal Endpoints

**Files**: `backend/app/routers/tenant_portal.py:111-134`
**Risk**: The `create_tenant_maintenance` endpoint accepts `data: dict` with no validation. Malformed data can create invalid maintenance requests.

**Evidence**:
```python
async def create_tenant_maintenance(
    lease_id: str,
    data: dict,  # No validation
    ...
):
```

**Impact**: Data integrity issues, potential for storing unexpected fields.

**Recommendation**: Use a Pydantic schema for request validation.

---

### MED-3: File Uploads Stored on Local Filesystem

**Files**: `backend/app/routers/upload.py:11-12`
**Risk**: Uploaded files are stored in a local `uploads/` directory relative to the backend. This doesn't scale with multiple backend instances or container restarts.

**Impact**: File loss on deployment, inability to scale horizontally.

**Recommendation**: Use cloud storage (S3, GCS) or a volume-mounted path for production.

---

### MED-4: No Database Migrations

**Files**: `backend/app/database.py`, `backend/app/db_init.py`
**Risk**: Schema changes are applied with `Base.metadata.create_all()` which only creates missing tables. It does NOT alter existing tables. Any schema change requires manual intervention or database recreation.

**Impact**: Cannot evolve schema without data loss or manual SQL.

**Recommendation**: Introduce Alembic migrations for production deployments.

---

### MED-5: CORS Allows All Methods and Headers

**Files**: `backend/app/main.py:35-41`
**Risk**: CORS middleware allows all methods and all headers by default. While origins are configurable, the permissive method/header policy increases attack surface.

**Impact**: Potential CORS-based attacks from configured origins.

**Recommendation**: Restrict allowed methods to `GET, POST, PUT, DELETE, OPTIONS` and specify allowed headers explicitly.

---

### MED-6: JSON Fields Stored as Strings Without Schema Validation

**Files**: `backend/app/models.py` — `Unit.rent_history`, `Tenant.contact_log`
**Risk**: JSON data is stored as plain text with no schema validation. Corrupted JSON will cause runtime errors when deserializing.

**Impact**: Application crashes on malformed JSON data. Data integrity not enforced.

**Recommendation**: Use `MutableDict` or `MutableList` from `sqlalchemy.ext.mutable` with validation on write, or validate JSON structure on deserialization.

---

## Low Severity

### LOW-1: `response_model=dict` on Tenant Portal Endpoints

**Files**: `backend/app/routers/tenant_portal.py`
**Risk**: Using `dict` as response model provides no API documentation or validation. FastAPI's OpenAPI schema generation can't document these endpoints properly.

**Recommendation**: Define proper Pydantic schemas for tenant portal responses.

---

### LOW-2: Inconsistent Error Response Format

**Files**: `backend/app/errors.py`, various routers
**Risk**: Some endpoints raise `HTTPException` directly without going through the standardized error handler. Response format varies between `{error, detail, status}` and `{detail}`.

**Recommendation**: Ensure all errors go through the centralized error handlers in `errors.py`.

---

### LOW-3: Hardcoded Status Colors in Frontend

**Files**: `frontend/src/pages/RentCollection.jsx:10-16`
**Risk**: Status-to-color mapping is hardcoded in component. Adding new statuses requires code changes.

**Recommendation**: Extract to a shared constants file or configuration.

---

### LOW-4: No Loading States in Frontend Pages

**Files**: All frontend page components
**Risk**: Data fetch operations have no loading indicators. Users see empty pages until data loads.

**Recommendation**: Add loading spinners/skeletons for async data loading.

---

### LOW-5: No Error Boundaries in Frontend

**Files**: `frontend/src/App.jsx`
**Risk**: A JavaScript error in any component will crash the entire app with no fallback UI.

**Recommendation**: Add React error boundary components around route groups.

---

### LOW-6: Test Database Not Cleaned Up Properly

**Files**: `backend/tests/conftest.py:21-25`
**Risk**: The `setup_tables` fixture uses `drop_all` after each test, but the test database file (`tests_test.db`) persists on disk between test runs.

**Recommendation**: Use `:memory:` database for tests or delete the file between runs.

---

## Test Coverage Gaps

The existing test suite (`test_api.py`) covers basic CRUD operations but lacks:
- Auth brute-force / rate limiting tests
- Tenant portal token validation tests
- File upload security tests (path traversal, extension bypass)
- Dashboard aggregation edge cases
- Concurrent access tests
- Input validation / malformed data tests
- Error response format consistency tests

---

## Summary Table

| Severity | Count | Key Issues |
|----------|-------|------------|
| Critical | 3 | Default JWT secret, debug endpoint, login path mismatch |
| High | 5 | datetime deprecation, no auth rate limiting, string dates, predictable tokens, window.location |
| Medium | 6 | Client-side filtering, no input validation, local file storage, no migrations, permissive CORS, JSON validation |
| Low | 6 | Response models, error format, hardcoded colors, loading states, error boundaries, test DB cleanup |
