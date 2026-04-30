import json

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import find_or_404
from app.models import Tenant
from app.schemas import TenantCreate, TenantUpdate, TenantOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/tenants", tags=["tenants"])


def _tenant_to_out(tenant: Tenant) -> dict:
    return {
        "id": tenant.id,
        "first_name": tenant.first_name,
        "last_name": tenant.last_name,
        "email": tenant.email,
        "phone": tenant.phone if tenant.phone else None,
        "emergency_contact": tenant.emergency_contact,
        "unit_id": tenant.unit_id,
        "contact_log": _parse_json(tenant.contact_log),
        "created_at": tenant.created_at or "",
    }


def _parse_json(text: str):
    if not text:
        return []
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return []


def _set_json(tenant, field_name: str, value):
    setattr(tenant, field_name, json.dumps(value))


@router.get("/", response_model=list[TenantOut])
@router.get("", response_model=list[TenantOut])
async def get_tenants(db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    tenants = db.query(Tenant).order_by(Tenant.first_name, Tenant.last_name).all()
    return [_tenant_to_out(t) for t in tenants]


@router.get("/{tenant_id}", response_model=TenantOut)
async def get_tenant(tenant_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    tenant = find_or_404(db, Tenant, tenant_id)
    return _tenant_to_out(tenant)


@router.post("/", response_model=TenantOut, status_code=status.HTTP_201_CREATED)
async def create_tenant(payload: TenantCreate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    tenant = Tenant(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        phone=payload.phone or "",
        emergency_contact=payload.emergency_contact,
        unit_id=payload.unit_id,
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return _tenant_to_out(tenant)


@router.put("/{tenant_id}", response_model=TenantOut)
async def update_tenant(tenant_id: str, payload: TenantUpdate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    tenant = find_or_404(db, Tenant, tenant_id)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(tenant, field, value)

    db.commit()
    db.refresh(tenant)
    return _tenant_to_out(tenant)


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(tenant_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    tenant = find_or_404(db, Tenant, tenant_id)
    db.delete(tenant)
    db.commit()


# =====================
# Contact Log (JSON field on Tenant)
# =====================

@router.post("/{tenant_id}/contact-log", status_code=status.HTTP_201_CREATED)
async def add_contact_log(
    tenant_id: str,
    entry: dict,
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    """Append a contact log entry to a tenant's contact_log JSON field.

    Expected entry format:
    {
        "contact_type": "email",
        "notes": "Discussed lease renewal",
        "date": "2026-04-30"
    }
    """
    tenant = find_or_404(db, Tenant, tenant_id)

    log = _parse_json(tenant.contact_log)
    log.append(entry)
    _set_json(tenant, "contact_log", log)
    db.commit()
    return {"contact_log": log}


@router.get("/{tenant_id}/contact-log")
async def get_contact_log(
    tenant_id: str,
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    """Get the contact log for a tenant."""
    tenant = find_or_404(db, Tenant, tenant_id)
    return {"contact_log": _parse_json(tenant.contact_log)}


@router.put("/{tenant_id}/contact-log", status_code=status.HTTP_200_OK)
async def set_contact_log(
    tenant_id: str,
    log: list,
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    """Replace the entire contact log for a tenant."""
    tenant = find_or_404(db, Tenant, tenant_id)
    _set_json(tenant, "contact_log", log)
    db.commit()
    return {"contact_log": log}
