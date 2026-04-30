from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List
from pydantic import BaseModel

from app.database import get_db
from app.auth import get_current_user
from app.models import Unit, Lease, Payment, Expense, Tenant


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class UnitCounts(BaseModel):
    total: int
    occupied: int
    vacant: int
    maintenance: int
    under_renovation: int


class MonthlyRevenue(BaseModel):
    expected: float
    collected: float


class ExpenseBreakdown(BaseModel):
    total: float
    net_profit: float
    by_category: dict


class ExpiringLease(BaseModel):
    id: str
    unit_number: str
    tenant_name: str
    end_date: str
    days_until_expiry: int


class DashboardData(BaseModel):
    unit_counts: UnitCounts
    occupancy_rate: float
    monthly_revenue: MonthlyRevenue
    expenses: ExpenseBreakdown
    upcoming_expirations: List[ExpiringLease] = []


@router.get("", response_model=DashboardData)
async def get_dashboard(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    first_day = today.replace(day=1)

    # Unit counts
    all_units = db.query(Unit).all()
    unit_counts = UnitCounts(
        total=len(all_units),
        occupied=len([u for u in all_units if u.status == 'occupied']),
        vacant=len([u for u in all_units if u.status == 'vacant']),
        maintenance=len([u for u in all_units if u.status == 'maintenance']),
        under_renovation=len([u for u in all_units if u.status == 'under_renovation']),
    )

    occupancy_rate = round((unit_counts.occupied / unit_counts.total * 100) if unit_counts.total > 0 else 0, 1)

    # Expected revenue from active leases
    active_leases = db.query(Lease).filter(Lease.status == 'active').all()
    expected = sum(float(l.monthly_rent or 0) for l in active_leases)

    # Collected payments this month (dates are strings in the DB)
    first_day_str = first_day.strftime('%Y-%m-%d')
    import datetime as dt
    last_day = first_day.replace(day=28) + dt.timedelta(days=7)
    last_day_str = last_day.strftime('%Y-%m-%d')
    monthly_payments = db.query(Payment).filter(
        Payment.date >= first_day_str,
        Payment.date <= last_day_str,
        Payment.status == 'paid',
    ).all()
    collected = sum(float(p.amount or 0) for p in monthly_payments)

    # Expenses total (all time, matching original behavior)
    all_expenses = db.query(Expense).all()
    expenses_total = sum(float(e.amount or 0) for e in all_expenses)

    by_category: dict = {}
    for e in all_expenses:
        cat = e.category or 'Other'
        by_category[cat] = by_category.get(cat, 0) + float(e.amount or 0)

    # Expiring leases (within 60 days)
    expirations = []
    for l in active_leases:
        if l.end_date:
            end_dt = datetime.strptime(l.end_date, '%Y-%m-%d').date() if isinstance(l.end_date, str) else l.end_date
            days_until = (end_dt - today).days
            if 0 <= days_until <= 60:
                tenant = db.query(Tenant).filter(Tenant.id == l.tenant_id).first()
                unit = db.query(Unit).filter(Unit.id == l.unit_id).first()
                tenant_name = f"{tenant.first_name} {tenant.last_name}" if tenant else 'Unknown'
                unit_number = unit.number if unit else 'Unknown'
                expirations.append(ExpiringLease(
                    id=l.id,
                    unit_number=unit_number,
                    tenant_name=tenant_name,
                    end_date=l.end_date,
                    days_until_expiry=days_until,
                ))

    return DashboardData(
        unit_counts=unit_counts,
        occupancy_rate=occupancy_rate,
        monthly_revenue=MonthlyRevenue(expected=expected, collected=collected),
        expenses=ExpenseBreakdown(total=expenses_total, net_profit=collected - expenses_total, by_category=by_category),
        upcoming_expirations=expirations,
    )
