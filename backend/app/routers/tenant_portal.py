from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from datetime import datetime

from app.database import get_db
from app.auth import get_current_user
from app.models import Lease, Payment, MaintenanceRequest, Tenant, Unit, Notice
from app.schemas import (
    LeaseOut, LeaseOutWithRelations, TenantOut, PaymentOut,
    MaintenanceOut as MaintenanceRequestOut, NoticeOut, UserOut
)

router = APIRouter(prefix="/api/tenant", tags=["tenant-portal"])


def _payment_to_out(payment: Payment) -> dict:
    return {
        "id": payment.id,
        "unit_id": payment.unit_id,
        "lease_id": payment.lease_id,
        "amount": float(payment.amount),
        "date": payment.date,
        "due_date": payment.due_date,
        "status": payment.status,
        "payment_method": payment.payment_method or "",
        "created_at": payment.created_at or "",
    }


def _maintenance_to_out(mr: MaintenanceRequest) -> dict:
    return {
        "id": mr.id,
        "unit_id": mr.unit_id,
        "tenant_id": mr.tenant_id,
        "title": mr.title,
        "description": mr.description or "",
        "priority": mr.priority,
        "status": mr.status,
        "cost": float(mr.cost) if mr.cost else None,
        "created_at": mr.created_at or "",
        "updated_at": mr.updated_at or "",
    }


def _get_lease_with_token(lease_id: str, token: str, db: Session):
    """Validate tenant access token and return lease."""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease or lease.tenant_access != token:
        raise HTTPException(status_code=401, detail="Invalid or expired tenant link")
    return lease


@router.get("/{lease_id}", response_model=dict)
async def get_tenant_portal(
    lease_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    lease = _get_lease_with_token(lease_id, token, db)

    payments = db.query(Payment).filter(Payment.lease_id == lease_id).all()
    payments_out = [_payment_to_out(p) for p in payments]

    maint = db.query(MaintenanceRequest).filter(
        and_(
            MaintenanceRequest.unit_id == lease.unit_id,
            or_(
                MaintenanceRequest.tenant_id == lease.tenant_id,
                MaintenanceRequest.tenant_id == None
            )
        )
    ).all()
    maint_out = [_maintenance_to_out(m) for m in maint]

    tenant = db.query(Tenant).filter(Tenant.id == lease.tenant_id).first()
    unit = db.query(Unit).filter(Unit.id == lease.unit_id).first()

    tenant_data = {
        "id": tenant.id,
        "first_name": tenant.first_name,
        "last_name": tenant.last_name,
        "email": tenant.email,
    } if tenant else None

    unit_data = {
        "id": unit.id,
        "unit_number": unit.number,
        "type": unit.type,
    } if unit else None

    return {
        "lease": {
            "id": lease.id,
            "unit_id": lease.unit_id,
            "tenant_id": lease.tenant_id,
            "start_date": lease.start_date,
            "end_date": lease.end_date,
            "monthly_rent": float(lease.monthly_rent or 0),
            "deposit_amount": float(lease.deposit_amount or 0),
            "status": lease.status,
            "tenant": tenant_data,
            "unit": unit_data,
        },
        "payments": payments_out,
        "maintenanceRequests": maint_out,
    }


@router.post("/{lease_id}/maintenance")
async def create_tenant_maintenance(
    lease_id: str,
    data: dict,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    lease = _get_lease_with_token(lease_id, token, db)

    id = f"maint_{datetime.now().timestamp()*1000:.0f}"
    maint = MaintenanceRequest(
        id=id,
        unit_id=lease.unit_id,
        tenant_id=lease.tenant_id,
        title=data.get('title', ''),
        description=data.get('description', ''),
        priority=data.get('priority', 'medium'),
        status='open',
        cost=None,
    )
    db.add(maint)
    db.commit()
    db.refresh(maint)
    return {"id": maint.id}


@router.get("/{lease_id}/payments", response_model=List[PaymentOut])
async def get_tenant_payments(
    lease_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    lease = _get_lease_with_token(lease_id, token, db)
    payments = db.query(Payment).filter(Payment.lease_id == lease_id).all()
    return [_payment_to_out(p) for p in payments]


@router.get("/{lease_id}/maintenance", response_model=List[MaintenanceRequestOut])
async def get_tenant_maintenance(
    lease_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    lease = _get_lease_with_token(lease_id, token, db)
    maint = db.query(MaintenanceRequest).filter(
        and_(
            MaintenanceRequest.unit_id == lease.unit_id,
            or_(
                MaintenanceRequest.tenant_id == lease.tenant_id,
                MaintenanceRequest.tenant_id == None
            )
        )
    ).all()
    return [_maintenance_to_out(m) for m in maint]


@router.get("/{lease_id}/notices", response_model=List[NoticeOut])
async def get_tenant_notices(
    lease_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    lease = _get_lease_with_token(lease_id, token, db)
    notices = db.query(Notice).filter(
        or_(
            and_(
                Notice.tenant_id == lease.tenant_id,
                Notice.status == "active"
            ),
            and_(
                Notice.unit_id == lease.unit_id,
                Notice.status == "active"
            ),
            and_(
                Notice.tenant_id == None,
                Notice.unit_id == None,
                Notice.status == "active"
            )
        )
    ).order_by(Notice.created_at.desc()).all()
    return notices
