# Implementation Plan: Property-Pi Fixes

## Priority Order

Fixes are ordered by severity. Each fix is self-contained with a clear before/after description.

---

## Phase 1: Critical Fixes (Security)

### Fix 1: Enforce Non-Default JWT Secret
**Issue**: CRIT-1
**File**: `backend/app/config.py`

**Changes**:
- In `Settings.model_post_init` (or `__init__`), check if `jwt_secret` equals the default value
- If default is detected in non-test environment, raise `ValueError` with instructions to set `JWT_SECRET`
- Alternatively: auto-generate a secure secret on first run if environment variable is not set, and warn in logs

**Before**:
```python
jwt_secret: str = "property-pi-jwt-secret-change-in-production"
```

**After**:
```python
def model_post_init(self, __context):
    if self.jwt_secret == "property-pi-jwt-secret-change-in-production" and self.environment != "test":
        import secrets
        self.jwt_secret = secrets.token_urlsafe(64)
        warnings.warn(
            "Using auto-generated JWT secret. Set JWT_SECRET environment variable for production!"
        )
```

---

### Fix 2: Remove Debug Endpoint
**Issue**: CRIT-2
**File**: `backend/app/routers/health.py`

**Changes**:
- Remove the `/debug/headers` endpoint entirely
- If debug functionality is needed, gate behind `DEBUG=True` env var + admin auth

**Before**:
```python
@router.get("/debug/headers")
async def debug_headers(request: Request):
    return dict(request.headers)
```

**After**: Removed.

---

### Fix 3: Fix Frontend Login Endpoint Path
**Issue**: CRIT-3
**File**: `frontend/src/pages/Login.jsx`

**Changes**:
- Change `/auth/login` to `/api/auth/login` to match backend router prefix
- Verify Register.jsx also uses correct path (`/api/auth/register`)
- Define API endpoint constants in a shared file to prevent future mismatches

**Before** (Login.jsx):
```javascript
const resp = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
```

**After**:
```javascript
const resp = await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
```

---

## Phase 2: High Severity Fixes

### Fix 4: Replace `datetime.utcnow()` with `datetime.now(timezone.utc)`
**Issue**: HIGH-1
**File**: `backend/app/models.py`

**Changes**:
- Import `timezone` from `datetime`
- Replace `datetime.utcnow().isoformat()` with `datetime.now(timezone.utc).isoformat()`

**Before**:
```python
def _now() -> str:
    return datetime.utcnow().isoformat()
```

**After**:
```python
from datetime import datetime, timezone

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
```

---

### Fix 5: Add Rate Limiting to Auth Endpoints
**Issue**: HIGH-2
**File**: `backend/app/routers/auth.py`

**Changes**:
- Import `rate_limit` from `app.main`
- Apply `@rate_limit.limit("5/minute")` to login and register endpoints
- Consider stricter limits for login (e.g., "3/minute")

**Before**:
```python
@router.post("/login")
async def login(...):
```

**After**:
```python
@router.post("/login")
@rate_limit.limit("5/minute")
async def login(request: Request, ...):
```

---

### Fix 6: Proper Date Handling in Queries
**Issue**: HIGH-3
**File**: `backend/app/routers/payments.py`, `backend/app/routers/dashboard.py`

**Changes**:
- Parse date strings to `datetime.date` objects before comparison
- Use `func.strftime('%Y-%m-%d', Payment.date)` for SQL-level date extraction when filtering string-stored dates
- Or: convert date columns to proper `Date` type (requires migration)

**Short-term fix** (parse before comparison):
```python
from datetime import datetime

if start_date:
    start = datetime.fromisoformat(start_date).date()
    payments = payments.filter(
        func.strftime('%Y-%m-%d', Payment.date) >= start.isoformat()
    )
```

---

### Fix 7: Add Token Expiration to Tenant Portal
**Issue**: HIGH-4
**File**: `backend/app/models.py`, `backend/app/routers/leases.py`, `backend/app/routers/tenant_portal.py`

**Changes**:
- Add `tenant_access_expires_at: Mapped[str]` field to Lease model
- When generating share link, set expiration to 365 days from now
- In `_get_lease_with_token`, check expiration and reject expired tokens

**New field in Lease model**:
```python
tenant_access_expires_at: Mapped[str] = mapped_column(String, nullable=True)
```

**Token generation**:
```python
lease.tenant_access = secrets.token_urlsafe(32)
lease.tenant_access_expires_at = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()
```

**Token validation**:
```python
if not lease or lease.tenant_access != token:
    raise HTTPException(status_code=401, detail="Invalid or expired tenant link")
if lease.tenant_access_expires_at and lease.tenant_access_expires_at < _now():
    raise HTTPException(status_code=401, detail="Tenant link has expired")
```

---

### Fix 8: Replace `window.location.href` with React Router Navigation
**Issue**: HIGH-5
**Files**: All frontend page components using `window.location.href`

**Changes**:
- Import `useNavigate` from `react-router-dom` in each affected component
- Replace `window.location.href = '/path'` with `navigate('/path')`
- For JSX onclick handlers, use `<Link to="/path">` instead of `<a href="/path">`

**Before**:
```javascript
window.location.href = '/units';
```

**After**:
```javascript
const navigate = useNavigate();
navigate('/units');
```

---

## Phase 3: Medium Severity Fixes

### Fix 9: Server-Side Pagination and Filtering
**Issue**: MED-1
**Files**: All backend list endpoints, all frontend list pages

**Changes**:
- Add `page`, `limit`, `search`, `sort_by`, `sort_order` query parameters to list endpoints
- Implement `offset()` and `limit()` in SQLAlchemy queries
- Add search filtering with `ilike` for text fields
- Update frontend to pass query parameters and render pagination controls

**Example (units endpoint)**:
```python
@router.get("/")
async def list_units(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = db.query(Unit)
    if search:
        query = query.filter(or_(
            Unit.number.ilike(f"%{search}%"),
            Unit.name.ilike(f"%{search}%"),
        ))
    if status:
        query = query.filter(Unit.status == status)
    total = query.count()
    units = query.offset((page - 1) * limit).limit(limit).all()
    return {"items": [_to_out(u) for u in units], "total": total, "page": page, "limit": limit}
```

---

### Fix 10: Input Validation on Tenant Portal
**Issue**: MED-2
**File**: `backend/app/routers/tenant_portal.py`

**Changes**:
- Create a Pydantic schema for maintenance request creation
- Replace `data: dict` with typed schema parameter

**New schema**:
```python
class TenantMaintenanceCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(default="", max_length=2000)
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
```

---

### Fix 11: Cloud Storage for File Uploads
**Issue**: MED-3
**File**: `backend/app/routers/upload.py`

**Changes**:
- Abstract file storage behind an interface
- Implement local filesystem storage (current) and S3 storage (production)
- Select storage backend via environment variable

**Note**: This is a larger change. For now, document the limitation and ensure uploads directory is volume-mounted in production Docker deployment.

---

### Fix 12: Introduce Alembic Migrations
**Issue**: MED-4
**Files**: `backend/` (new files)

**Changes**:
- Initialize Alembic: `alembic init alembic`
- Configure `alembic.ini` and `env.py` to use existing database URL
- Create initial migration from current schema
- Update startup to run `alembic upgrade head` instead of `Base.metadata.create_all()`

---

### Fix 13: Restrict CORS Configuration
**Issue**: MED-5
**File**: `backend/app/main.py`

**Changes**:
- Specify allowed methods explicitly: `["GET", "POST", "PUT", "DELETE", "OPTIONS"]`
- Specify allowed headers explicitly: `["Content-Type", "Authorization", "Accept"]`
- Remove `allow_headers=["*"]`

---

### Fix 14: JSON Field Validation
**Issue**: MED-6
**File**: `backend/app/models.py`

**Changes**:
- Add property setters that validate JSON on assignment
- Use try/except around `json.loads()` to catch malformed JSON
- Return empty list/dict as fallback for corrupted data

---

## Phase 4: Low Severity (Quality of Life)

### Fix 15: Proper Response Models for Tenant Portal
**Issue**: LOW-1
**File**: `backend/app/routers/tenant_portal.py`

**Changes**: Define Pydantic schemas matching the actual response structure and use them as `response_model`.

---

### Fix 16: Consistent Error Response Format
**Issue**: LOW-2
**Files**: Various routers

**Changes**: Audit all `raise HTTPException` calls and ensure they use the standardized format from `errors.py`.

---

### Fix 17: Extract Status Colors to Shared Constants
**Issue**: LOW-3
**File**: `frontend/src/pages/RentCollection.jsx`

**Changes**: Move status color mapping to `frontend/src/constants.js` or similar shared file.

---

### Fix 18: Loading States
**Issue**: LOW-4
**Files**: All frontend page components

**Changes**: Add `isLoading` state to data fetch operations. Show skeleton/spinner while loading.

---

### Fix 19: Error Boundaries
**Issue**: LOW-5
**File**: `frontend/src/App.jsx`

**Changes**: Create an `ErrorBoundary` component class. Wrap route groups with error boundaries.

---

### Fix 20: In-Memory Test Database
**Issue**: LOW-6
**File**: `backend/tests/conftest.py`

**Changes**: Change test database URL to `sqlite:///:memory:` for faster, cleaner tests.

---

## Execution Order

1. **Phase 1** (Critical) — Fix immediately, these are security risks
2. **Phase 2** (High) — Fix next, these affect correctness and user experience
3. **Phase 3** (Medium) — Plan and implement incrementally
4. **Phase 4** (Low) — Nice to have, implement as time permits

## Estimated Effort

| Phase | Estimated Time | Complexity |
|-------|---------------|------------|
| Phase 1 (Critical) | 1-2 hours | Low |
| Phase 2 (High) | 4-6 hours | Medium |
| Phase 3 (Medium) | 1-2 days | High (pagination is large) |
| Phase 4 (Low) | 2-3 hours | Low |
