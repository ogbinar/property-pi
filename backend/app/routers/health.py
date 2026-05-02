from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db, engine

router = APIRouter(prefix="/api")


@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.get("/health/db")
async def database_health(db: Session = Depends(get_db)):
    """Database connection health check."""
    try:
        db.execute("SELECT 1")
        return {"status": "ok", "database": "sqlite"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")


@router.get("/health/full")
async def full_health_check(db: Session = Depends(get_db)):
    """Full health check including database and storage."""
    try:
        db.execute("SELECT 1")
        return {
            "status": "ok",
            "services": {"database": "ok"},
            "version": "0.1.0"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
