from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import find_or_404
from app.models import MaintenanceRequest
from app.schemas import MaintenanceCreate, MaintenanceUpdate, MaintenanceOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])


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


@router.get("/", response_model=list[MaintenanceOut])
@router.get("", response_model=list[MaintenanceOut])
async def get_maintenance(
    unit_id: str | None = Query(None),
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    query = db.query(MaintenanceRequest)
    if unit_id:
        query = query.filter(MaintenanceRequest.unit_id == unit_id)
    requests = query.order_by(MaintenanceRequest.created_at.desc()).all()
    return [_maintenance_to_out(r) for r in requests]


@router.get("/{request_id}", response_model=MaintenanceOut)
async def get_maintenance_request(request_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    req = find_or_404(db, MaintenanceRequest, request_id, "Maintenance request")
    return _maintenance_to_out(req)


@router.post("/", response_model=MaintenanceOut, status_code=status.HTTP_201_CREATED)
async def create_maintenance(payload: MaintenanceCreate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    req = MaintenanceRequest(
        unit_id=payload.unit_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return _maintenance_to_out(req)


@router.put("/{request_id}", response_model=MaintenanceOut)
async def update_maintenance(request_id: str, payload: MaintenanceUpdate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    req = find_or_404(db, MaintenanceRequest, request_id, "Maintenance request")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(req, field, value)

    db.commit()
    db.refresh(req)
    return _maintenance_to_out(req)


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_maintenance(request_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    req = find_or_404(db, MaintenanceRequest, request_id, "Maintenance request")
    db.delete(req)
    db.commit()
