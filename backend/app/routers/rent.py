"""Rent automation endpoints — monthly generation and overdue marking."""

from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from app.config import settings

router = APIRouter()


class GenerateRentRequest(BaseModel):
    month: int
    year: int


class MarkOverdueResponse(BaseModel):
    marked: int


@router.post("/api/fastapi/rent/generate")
async def generate_monthly_rent(req: GenerateRentRequest):
    """Create payment records for all active leases for the target month."""
    async with httpx.AsyncClient() as client:
        # Find all active leases
        leases_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/leases/records",
            params={"filter": "status == 'active'"},
        )
        leases = leases_resp.json()

        # Calculate target month date range
        month_start = f"{req.year}-{req.month:02d}-01"
        month_end = f"{req.year}-{req.month:02d}-31"

        # Check which payments already exist for this month
        existing_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/payments/records",
            params={"filter": f"date >= '{month_start}' && date <= '{month_end}'"},
        )
        existing = existing_resp.json()
        existing_dates = set((p.get("unit"), p.get("date")) for p in existing)

        created = []
        for lease in leases:
            target_date = f"{req.year}-{req.month:02d}-01"
            due_date = f"{req.year}-{req.month:02d}-05"

            if (lease.get("unit"), target_date) not in existing_dates:
                # Create payment
                payment_data = {
                    "unit": lease["unit"],
                    "tenant": lease["tenant"],
                    "lease": lease["id"],
                    "amount": lease.get("monthlyRent", 0),
                    "date": target_date,
                    "dueDate": due_date,
                    "status": "pending",
                    "type": "rent",
                    "paymentMethod": "",
                    "notes": "",
                }
                resp = await client.post(
                    f"{settings.pocketbase_url}/api/collections/payments/records",
                    json=payment_data,
                )
                if resp.status_code == 200:
                    created.append(resp.json())

        return created


@router.post("/api/fastapi/rent/mark-overdue", response_model=MarkOverdueResponse)
async def mark_overdue_payments():
    """Mark all pending payments past due date as overdue."""
    async with httpx.AsyncClient() as client:
        now = datetime.now().strftime("%Y-%m-%d")
        # Find all pending payments with dueDate < now
        payments_resp = await client.get(
            f"{settings.pocketbase_url}/api/collections/payments/records",
            params={"filter": f"status == 'pending' && dueDate < '{now}'"},
        )
        payments = payments_resp.json()

        marked = 0
        for payment in payments:
            await client.patch(
                f"{settings.pocketbase_url}/api/collections/payments/records/{payment['id']}",
                json={"status": "overdue"},
            )
            marked += 1

        return {"marked": marked}
