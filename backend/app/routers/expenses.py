"""Expense reporting endpoint with category breakdown and net profit."""

from datetime import datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from app.config import settings

router = APIRouter()


class ExpenseReportResponse(BaseModel):
    total: float
    net_profit: float
    by_category: dict


@router.get("/api/fastapi/expenses/report")
async def expense_report(
    category: str = None,
    unit_id: str = None,
    month: int = None,
    year: int = None,
):
    """Expense report with category breakdown and net profit."""
    async with httpx.AsyncClient() as client:
        filter_parts = []
        if category:
            filter_parts.append(f'category == "{category}"')

        if month and year:
            month_start = f"{year}-{month:02d}-01"
            next_month = (datetime(year, month, 1) + timedelta(days=32)).replace(day=1)
            filter_parts.append(
                f'date >= "{month_start}" && date < "{next_month.strftime("%Y-%m-%d")}"'
            )

        filter_str = " && ".join(filter_parts) if filter_parts else "1 == 1"

        expenses_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/expenses/records",
            params={"filter": filter_str},
        )
        expenses = expenses_resp.json()

        # Fetch revenue to calculate net profit
        payments_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/payments/records",
            params={"filter": "status == 'paid'"},
        )
        payments = payments_resp.json()
        revenue = sum(p.get("amount", 0) for p in payments)

        total = sum(e.get("amount", 0) for e in expenses)
        by_category: dict[str, float] = {}
        for e in expenses:
            cat = e.get("category", "Other")
            by_category[cat] = by_category.get(cat, 0) + e.get("amount", 0)

        return {
            "total": total,
            "net_profit": revenue - total,
            "by_category": by_category,
        }
