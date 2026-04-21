from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from starlette.requests import Request

from app.config import settings
from app.routers import health, dashboard, rent, expenses, leases

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="Property-Pi",
    description="Small-scale property management API",
    version="0.1.0",
)

# Exception handler for rate limiting
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Try again later."}
    )

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# CORS — allow the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers — only reporting/automation, not CRUD
app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(rent.router)
app.include_router(expenses.router)
app.include_router(leases.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
