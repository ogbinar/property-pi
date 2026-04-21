"""Health check endpoint — verifies PocketBase connectivity."""

from fastapi import APIRouter
import httpx
from app.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Check that PocketBase is reachable."""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{settings.pocketbase_url}/api/collections/units/records",
                params={"perPage": "1"},
            )
            if resp.status_code == 200:
                return {"status": "ok", "pocketbase": "connected"}
        except Exception:
            return {"status": "degraded", "pocketbase": "unreachable"}
    return {"status": "ok"}
