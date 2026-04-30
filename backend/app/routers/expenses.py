from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import find_or_404
from app.models import Expense
from app.schemas import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


def _expense_to_out(expense: Expense) -> dict:
    return {
        "id": expense.id,
        "unit_id": expense.unit_id,
        "amount": float(expense.amount),
        "category": expense.category or "Other",
        "description": expense.description or "",
        "date": expense.date,
        "status": expense.status,
        "receipt_url": expense.file_url,
        "created_at": expense.created_at or "",
    }


@router.get("/", response_model=list[ExpenseOut])
@router.get("", response_model=list[ExpenseOut])
async def get_expenses(
    category: str | None = Query(None),
    unit_id: str | None = Query(None),
    db: Session = Depends(get_db),
    _current_user: dict = Depends(get_current_user),
):
    query = db.query(Expense)
    if category:
        query = query.filter(Expense.category == category)
    if unit_id:
        query = query.filter(Expense.unit_id == unit_id)
    expenses = query.order_by(Expense.date.desc()).all()
    return [_expense_to_out(e) for e in expenses]


@router.get("/{expense_id}", response_model=ExpenseOut)
async def get_expense(expense_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    expense = find_or_404(db, Expense, expense_id)
    return _expense_to_out(expense)


@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
async def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    expense = Expense(
        amount=payload.amount,
        category=payload.category,
        description=payload.description,
        date=payload.date,
        file_url=payload.receipt_url,
        unit_id=payload.unit_id,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return _expense_to_out(expense)


@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(expense_id: str, payload: ExpenseUpdate, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    expense = find_or_404(db, Expense, expense_id)

    update_data = payload.model_dump(exclude_unset=True)
    field_map = {
        "receipt_url": "file_url",
    }
    for field, value in update_data.items():
        model_field = field_map.get(field, field)
        if value is not None:
            setattr(expense, model_field, value)

    db.commit()
    db.refresh(expense)
    return _expense_to_out(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(expense_id: str, db: Session = Depends(get_db), _current_user: dict = Depends(get_current_user)):
    expense = find_or_404(db, Expense, expense_id)
    db.delete(expense)
    db.commit()
