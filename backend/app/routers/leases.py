import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import find_or_404
from app.models import Lease, Tenant, Unit
from app.schemas import LeaseCreate, LeaseUpdate, LeaseOut, LeaseOutWithRelations, TenantOut, UnitOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/leases", tags=["leases"])


def _lease_to_out(lease: Lease) -> dict:
    return {
        "id": lease.id,
        "tenant_id": lease.tenant_id,
        "unit_id": lease.unit_id,
        "start_date": lease.start_date,
        "end_date": lease.end_date,
        "monthly_rent": float(lease.monthly_rent),
        "deposit_amount": float(lease.deposit_amount),
        "status": lease.status,
        "tenant_access": lease.tenant_access or "",
        "created_at": lease.created_at or "",
    }


@router.get("/", response_model=list[LeaseOut])
@router.get("", response_model=list[LeaseOut])
async def get_leases(db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    leases = db.query(Lease).order_by(Lease.start_date.desc()).all()
    return [_lease_to_out(l) for l in leases]


@router.get("/{lease_id}", response_model=LeaseOut)
async def get_lease(lease_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    lease = find_or_404(db, Lease, lease_id)
    return _lease_to_out(lease)


@router.get("/{lease_id}/with-relations", response_model=LeaseOutWithRelations)
async def get_lease_with_relations(lease_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    lease = find_or_404(db, Lease, lease_id)

    tenant = db.query(Tenant).filter(Tenant.id == lease.tenant_id).first()
    unit = db.query(Unit).filter(Unit.id == lease.unit_id).first()

    tenant_data = None
    if tenant:
        tenant_data = TenantOut(
            id=tenant.id,
            first_name=tenant.first_name,
            last_name=tenant.last_name,
            email=tenant.email,
            phone=tenant.phone if tenant.phone else None,
            emergency_contact=tenant.emergency_contact,
            unit_id=tenant.unit_id,
            created_at=tenant.created_at or "",
        )

    unit_data = None
    if unit:
        unit_data = UnitOut(
            id=unit.id,
            unit_number=unit.number,
            type=unit.type or "",
            status=unit.status,
            rent_amount=float(unit.rent),
            security_deposit=float(unit.deposit),
            name=unit.name or "",
            floor=float(unit.floor) if unit.floor else 0,
            area=float(unit.area) if unit.area else 0,
            features=unit.features or "",
            description=unit.description or "",
            created_at=unit.created_at or "",
            updated_at=unit.updated_at or "",
        )

    return {
        **_lease_to_out(lease),
        "tenant": tenant_data,
        "unit": unit_data,
    }


@router.post("/", response_model=LeaseOut, status_code=status.HTTP_201_CREATED)
async def create_lease(payload: LeaseCreate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    lease = Lease(
        tenant_id=payload.tenant_id,
        unit_id=payload.unit_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        monthly_rent=payload.rent_amount,
        deposit_amount=0,
        status="active",
    )
    db.add(lease)
    db.commit()
    db.refresh(lease)
    return _lease_to_out(lease)


@router.put("/{lease_id}", response_model=LeaseOut)
async def update_lease(lease_id: str, payload: LeaseUpdate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    lease = find_or_404(db, Lease, lease_id)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(lease, field, value)

    db.commit()
    db.refresh(lease)
    return _lease_to_out(lease)


@router.delete("/{lease_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lease(lease_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    lease = find_or_404(db, Lease, lease_id)
    db.delete(lease)
    db.commit()


@router.post("/{lease_id}/terminate", response_model=LeaseOut)
async def terminate_lease(lease_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    lease = find_or_404(db, Lease, lease_id)
    lease.status = "terminated"
    db.commit()
    db.refresh(lease)
    return _lease_to_out(lease)


@router.post("/{lease_id}/share-link", response_model=dict)
async def share_tenant_link(lease_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    lease = find_or_404(db, Lease, lease_id)
    token = str(uuid.uuid4())
    lease.tenant_access = token
    db.commit()
    db.refresh(lease)
    return {"token": token, "link": f"/tenant-portal?leaseId={lease.id}&token={token}"}
