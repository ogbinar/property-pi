from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, dashboard, rent, expenses, leases

app = FastAPI(
    title="Property-Pi",
    description="Small-scale property management API",
    version="0.1.0",
)

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
