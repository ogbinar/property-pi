"""Dashboard aggregation endpoint — fetches from PocketBase and computes summary."""

from datetime import datetime, timedelta

from fastapi import APIRouter
import httpx
from app.config import settings

router = APIRouter()


@router.get("/api/fastapi/dashboard")
async def get_dashboard():
    """Aggregated dashboard data from PocketBase."""
    async with httpx.AsyncClient() as client:
        # Fetch all units
        units_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/units/records",
            params={"perPage": "100"},
        )
        units = units_resp.json()

        # Fetch all payments for current month
        now = datetime.now()
        month_start = now.replace(day=1).strftime("%Y-%m-%d")
        next_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1)
        payments_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/payments/records",
            params={
                "filter": f'date >= "{month_start}" && date < "{next_month.strftime("%Y-%m-%d")}"'
            },
        )
        payments = payments_resp.json()

        # Fetch all expenses for current month
        expenses_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/expenses/records",
            params={
                "filter": f'date >= "{month_start}" && date < "{next_month.strftime("%Y-%m-%d")}"'
            },
        )
        expenses = expenses_resp.json()

        # Fetch all leases
        leases_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/leases/records",
            params={"perPage": "100"},
        )
        leases = leases_resp.json()

    # Compute aggregation
    unit_counts = {
        "total": len(units),
        "occupied": 0,
        "vacant": 0,
        "maintenance": 0,
        "under_renovation": 0,
    }
    for u in units:
        st = u.get("status", "")
        if st == "occupied":
            unit_counts["occupied"] += 1
        elif st == "vacant":
            unit_counts["vacant"] += 1
        elif st == "maintenance":
            unit_counts["maintenance"] += 1
        elif st in ("under_renovation", "underRenovation"):
            unit_counts["under_renovation"] += 1

    occupancy_rate = (
        (unit_counts["occupied"] / unit_counts["total"] * 100)
        if unit_counts["total"] > 0
        else 0
    )

    monthly_revenue = {
        "expected": sum(l.get("monthlyRent", 0) for l in leases),
        "collected": sum(p.get("amount", 0) for p in payments if p.get("status") == "paid"),
    }

    expenses_by_category: dict[str, float] = {}
    for e in expenses:
        cat = e.get("category", "Other")
        expenses_by_category[cat] = expenses_by_category.get(cat, 0) + e.get("amount", 0)

    expenses_total = sum(e.get("amount", 0) for e in expenses)
    net_profit = monthly_revenue["collected"] - expenses_total

    # Upcoming expirations (within 60 days)
    expirations = []
    for l in leases:
        end_date = datetime.strptime(l["endDate"], "%Y-%m-%d")
        days_until = (end_date - now).days
        if 0 < days_until <= 60:
            expirations.append(
                {
                    "unit_number": "",
                    "tenant_name": "",
                    "end_date": l["endDate"],
                    "days_until_expiry": days_until,
                }
            )

    return {
        "unit_counts": unit_counts,
        "occupancy_rate": round(occupancy_rate, 1),
        "monthly_revenue": monthly_revenue,
        "expenses": {
            "total": expenses_total,
            "net_profit": net_profit,
            "by_category": expenses_by_category,
        },
        "recent_activities": [],
        "upcoming_expirations": expirations,
    }
