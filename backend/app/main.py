import os
from pathlib import Path

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from starlette.requests import Request

from app.config import settings
from app.routers import health, auth, units, tenants, leases, payments, expenses, maintenance, dashboard, tenant_portal, upload
from app.errors import register_exception_handlers

app = FastAPI(
    title="Property-Pi",
    description="Small-scale property management API",
    version="0.1.0",
)

# Register global exception handlers
register_exception_handlers(app)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limited = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"error": "rate_limit_exceeded", "detail": "Rate limit exceeded. Try again later."}
    )

# CORS — read origins from settings
origins = settings.origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
from app.db_init import init_db
init_db()

# Serve uploaded files statically
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(units.router)
app.include_router(tenants.router)
app.include_router(leases.router)
app.include_router(payments.router)
app.include_router(expenses.router)
app.include_router(maintenance.router)
app.include_router(dashboard.router)
app.include_router(tenant_portal.router)
app.include_router(upload.router)


FRONTEND_DIST_DIR = Path(
    os.environ.get(
        "FRONTEND_DIST_DIR",
        Path(__file__).resolve().parents[2] / "frontend-dist",
    )
)
FRONTEND_INDEX = FRONTEND_DIST_DIR / "index.html"


def _has_duplicate_prefix(path: str) -> bool:
    parts = [segment for segment in path.split("/") if segment]
    return len(parts) >= 2 and parts[0] == parts[1]


@app.api_route(
    "/{path:path}",
    include_in_schema=False,
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def spa_fallback(path: str):
    """Serve the built SPA for client-side routes in production."""
    blocked_prefixes = ("api", "auth", "uploads", "docs", "openapi.json", "redoc", "health")
    if path.startswith(blocked_prefixes) or _has_duplicate_prefix(path):
        raise HTTPException(status_code=404, detail="Not Found")

    if not FRONTEND_INDEX.exists():
        raise HTTPException(status_code=404, detail="Not Found")

    candidate = FRONTEND_DIST_DIR / path if path else FRONTEND_INDEX
    if path and candidate.exists() and candidate.is_file():
        return FileResponse(candidate)

    return FileResponse(FRONTEND_INDEX)
