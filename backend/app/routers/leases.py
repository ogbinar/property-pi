"""Lease expiry detection endpoint — returns leases ending within 60 days with urgency levels."""

from datetime import datetime

from fastapi import APIRouter
import httpx
from app.config import settings

router = APIRouter()


@router.get("/api/fastapi/leases/expiring")
async def get_expiring_leases():
    """Return leases ending within 60 days with urgency levels."""
    async with httpx.AsyncClient() as client:
        leases_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/leases/records",
            params={"filter": "status == 'active'", "perPage": "100"},
        )
        leases = leases_resp.json()

    now = datetime.now()
    result = []

    for lease in leases:
        end_date = datetime.strptime(lease["endDate"], "%Y-%m-%d")
        days_until = (end_date - now).days

        if days_until <= 60:
            if days_until <= 15:
                urgency = "critical"
            elif days_until <= 30:
                urgency = "warning"
            else:
                urgency = "upcoming"

            result.append(
                {
                    "id": lease["id"],
                    "unit_number": "",
                    "tenant_name": "",
                    "end_date": lease["endDate"],
                    "days_until_expiry": days_until,
                    "urgency": urgency,
                }
            )

    return sorted(result, key=lambda x: x["days_until_expiry"])
