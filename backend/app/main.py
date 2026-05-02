import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# Initialize database and seed default admin user
from app.db_init import init_db
from app.database import SessionLocal
from app import models, auth as auth_module
init_db()

# Create default admin only if explicitly enabled (development mode)
CREATE_DEFAULT_ADMIN = os.environ.get("CREATE_DEFAULT_ADMIN", "false").lower() == "true"
if CREATE_DEFAULT_ADMIN:
    with SessionLocal() as db:
        existing = db.query(models.User).filter(models.User.email == "admin@propertypi.com").first()
        if not existing:
            admin_password = os.environ.get("DEFAULT_ADMIN_PASSWORD", "admin123")
            admin = models.User(
                name="Admin",
                email="admin@propertypi.com",
                password_hash=auth_module.hash_password(admin_password),
                role="landlord",
            )
            db.add(admin)
            db.commit()
            print(f"⚠️  Default admin created with password: {admin_password}")

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
