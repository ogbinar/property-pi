from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import find_or_404
from app.models import Payment, Lease
from app.schemas import PaymentCreate, PaymentUpdate, PaymentOut, RentSummary
from app.auth import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


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


def _month_range(month: int, year: int) -> tuple[str, str]:
    start = f"{year}-{month:02d}-01"
    end = f"{year}-{month:02d}-31"
    return start, end


@router.get("/", response_model=list[PaymentOut])
@router.get("", response_model=list[PaymentOut])
async def get_payments(
    month: int = Query(1, ge=1, le=12),
    year: int = Query(2026, ge=2000),
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    start_str, end_str = _month_range(month, year)
    payments = (
        db.query(Payment)
        .filter(Payment.date >= start_str, Payment.date <= end_str)
        .order_by(Payment.date.desc())
        .all()
    )
    return [_payment_to_out(p) for p in payments]


@router.get("/summary", response_model=RentSummary)
async def get_rent_summary(
    month: int = Query(1, ge=1, le=12),
    year: int = Query(2026, ge=2000),
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    start_str, end_str = _month_range(month, year)
    payments = (
        db.query(Payment)
        .filter(Payment.date >= start_str, Payment.date <= end_str)
        .all()
    )

    expected = sum(float(p.amount) for p in payments)
    collected = sum(float(p.amount) for p in payments if p.status == "paid")
    pending = sum(float(p.amount) for p in payments if p.status == "pending")
    overdue = sum(float(p.amount) for p in payments if p.status == "overdue")

    return RentSummary(expected=expected, collected=collected, pending=pending, overdue=overdue)


@router.get("/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    payment = find_or_404(db, Payment, payment_id)
    return _payment_to_out(payment)


@router.post("/", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
async def create_payment(payload: PaymentCreate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    payment = Payment(
        unit_id=payload.unit_id,
        lease_id=payload.lease_id,
        tenant_id="",
        amount=payload.amount,
        date=payload.date,
        due_date=payload.due_date,
        type="rent",
        status=payload.status,
        payment_method=payload.payment_method,
        notes="",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return _payment_to_out(payment)


@router.put("/{payment_id}", response_model=PaymentOut)
async def update_payment(payment_id: str, payload: PaymentUpdate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    payment = find_or_404(db, Payment, payment_id)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(payment, field, value)

    db.commit()
    db.refresh(payment)
    return _payment_to_out(payment)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(payment_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    payment = find_or_404(db, Payment, payment_id)
    db.delete(payment)
    db.commit()


@router.post("/generate")
async def generate_rent(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    """Generate pending payments for all active leases in the given month."""
    leases = db.query(Lease).filter(Lease.status == "active").all()
    created = []
    for lease in leases:
        payment = Payment(
            unit_id=lease.unit_id,
            lease_id=lease.id,
            tenant_id="",
            amount=lease.monthly_rent,
            date=f"{year}-{month:02d}-01",
            due_date=f"{year}-{month:02d}-05",
            type="rent",
            status="pending",
            payment_method="",
            notes="",
        )
        db.add(payment)
        created.append(payment)
    db.commit()
    for p in created:
        db.refresh(p)
    return {"created": len(created), "payments": [_payment_to_out(p) for p in created]}


@router.post("/{payment_id}/mark-paid")
async def mark_paid(payment_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    payment = find_or_404(db, Payment, payment_id)
    payment.status = "paid"
    db.commit()
    db.refresh(payment)
    return _payment_to_out(payment)


@router.post("/mark-overdue")
async def mark_overdue(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    start_str, end_str = _month_range(month, year)
    payments = (
        db.query(Payment)
        .filter(Payment.date >= start_str, Payment.date <= end_str, Payment.status == "pending")
        .all()
    )
    for p in payments:
        p.status = "overdue"
    db.commit()
    return {"updated": len(payments)}
