import json

from fastapi import APIRouter, Depends, Body, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import find_or_404
from app.models import Unit
from app.schemas import UnitCreate, UnitUpdate, UnitOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/units", tags=["units"])


def _unit_to_out(unit: Unit) -> dict:
    return {
        "id": unit.id,
        "unit_number": unit.number,
        "type": unit.type or "",
        "status": unit.status,
        "rent_amount": float(unit.rent),
        "security_deposit": float(unit.deposit),
        "name": unit.name or "",
        "floor": float(unit.floor) if unit.floor else 0,
        "area": float(unit.area) if unit.area else 0,
        "features": unit.features or "",
        "description": unit.description or "",
        "rent_history": _parse_json(unit.rent_history),
        "created_at": unit.created_at or "",
        "updated_at": unit.updated_at or "",
    }


def _parse_json(text: str):
    if not text:
        return []
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return []


def _set_json(unit, field_name: str, value):
    setattr(unit, field_name, json.dumps(value))


@router.get("/{unit_id}", response_model=UnitOut)
async def get_unit(unit_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    unit = find_or_404(db, Unit, unit_id)
    return _unit_to_out(unit)


@router.get("/", response_model=list[UnitOut])
@router.get("", response_model=list[UnitOut])
async def get_units(db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    units = db.query(Unit).all()
    return [_unit_to_out(u) for u in units]


@router.post("/", response_model=UnitOut, status_code=status.HTTP_201_CREATED)
async def create_unit(payload: UnitCreate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    unit = Unit(
        number=payload.unit_number,
        type=payload.type,
        rent=payload.rent_amount,
        deposit=payload.security_deposit,
        name=payload.name,
        floor=payload.floor,
        area=payload.area,
        features=payload.features,
        description=payload.description,
        status="vacant",
    )
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return _unit_to_out(unit)


@router.put("/{unit_id}", response_model=UnitOut)
async def update_unit(unit_id: str, payload: UnitUpdate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    unit = find_or_404(db, Unit, unit_id)

    update_data = payload.model_dump(exclude_unset=True)
    field_map = {
        "rent_amount": "rent",
        "security_deposit": "deposit",
    }
    for field, value in update_data.items():
        model_field = field_map.get(field, field)
        if value is not None:
            setattr(unit, model_field, value)

    db.commit()
    db.refresh(unit)
    return _unit_to_out(unit)


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_unit(unit_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    unit = find_or_404(db, Unit, unit_id)
    db.delete(unit)
    db.commit()


# =====================
# Rent History (JSON field on Unit)
# =====================

@router.post("/{unit_id}/rent-history", status_code=status.HTTP_201_CREATED)
async def add_rent_history(
    unit_id: str,
    entry: dict,
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    """Append a rent history entry to a unit's rent_history JSON field.

    Expected entry format:
    {
        "old_rent": 1200,
        "new_rent": 1300,
        "effective_date": "2026-01-01",
        "reason": "Market adjustment"
    }
    """
    unit = find_or_404(db, Unit, unit_id)

    history = _parse_json(unit.rent_history)
    history.append(entry)
    _set_json(unit, "rent_history", history)
    db.commit()
    return {"rent_history": history}


@router.get("/{unit_id}/rent-history")
async def get_rent_history(
    unit_id: str,
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    """Get the rent history for a unit."""
    unit = find_or_404(db, Unit, unit_id)
    return {"rent_history": _parse_json(unit.rent_history)}


@router.put("/{unit_id}/rent-history", status_code=status.HTTP_200_OK)
async def set_rent_history(
    unit_id: str,
    history: list = Body(...),
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    """Replace the entire rent history for a unit."""
    unit = find_or_404(db, Unit, unit_id)
    _set_json(unit, "rent_history", history)
    db.commit()
    return {"rent_history": history}
