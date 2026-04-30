"""Pydantic schemas for request/response validation.

Field names match the frontend TypeScript types (src/lib/api-types.ts).
Column names map to the SQLAlchemy model attributes via aliases where needed.
"""

from datetime import date
from typing import Optional, List

from pydantic import BaseModel, Field


# =====================
# Auth
# =====================

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: str
    password: str = Field(..., min_length=6)


class UserOut(BaseModel):
    id: str
    name: Optional[str] = None
    email: str
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


# =====================
# Units
# =====================

class UnitCreate(BaseModel):
    unit_number: str = Field(..., alias="unit_number")
    type: str = Field(..., min_length=1)
    rent_amount: float = Field(..., gt=0)
    security_deposit: float = Field(..., ge=0)
    name: str = ""
    floor: float = 0
    area: float = 0
    features: str = ""
    description: str = ""


class UnitUpdate(BaseModel):
    type: Optional[str] = None
    status: Optional[str] = None
    rent_amount: Optional[float] = None
    security_deposit: Optional[float] = None
    name: Optional[str] = None
    floor: Optional[float] = None
    area: Optional[float] = None
    features: Optional[str] = None
    description: Optional[str] = None


class UnitOut(BaseModel):
    id: str
    unit_number: str
    type: str
    status: str
    rent_amount: float
    security_deposit: float
    name: str = ""
    floor: float = 0
    area: float = 0
    features: str = ""
    description: str = ""
    created_at: str
    updated_at: str = ""

    class Config:
        from_attributes = True


# =====================
# Tenants
# =====================

class TenantCreate(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: str
    phone: Optional[str] = ""
    emergency_contact: Optional[str] = None
    unit_id: Optional[str] = None


class TenantUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    unit_id: Optional[str] = None


class TenantOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    unit_id: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


# =====================
# Leases
# =====================

class LeaseCreate(BaseModel):
    tenant_id: str
    unit_id: str
    start_date: str  # ISO date string (YYYY-MM-DD)
    end_date: str
    rent_amount: float = Field(..., gt=0)


class LeaseUpdate(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    rent_amount: Optional[float] = None
    status: Optional[str] = None


class LeaseOut(BaseModel):
    id: str
    tenant_id: str
    unit_id: str
    start_date: str
    end_date: str
    monthly_rent: float
    deposit_amount: float
    status: str
    tenant_access: str = ""
    created_at: str

    class Config:
        from_attributes = True


class LeaseOutWithRelations(BaseModel):
    id: str
    tenant_id: str
    unit_id: str
    start_date: str
    end_date: str
    monthly_rent: float
    deposit_amount: float
    status: str
    tenant_access: str = ""
    created_at: str
    tenant: Optional[TenantOut] = None
    unit: Optional[UnitOut] = None

    class Config:
        from_attributes = True


# =====================
# Payments
# =====================

class PaymentCreate(BaseModel):
    unit_id: str
    lease_id: Optional[str] = None
    amount: float = Field(..., gt=0)
    date: str  # ISO date string
    due_date: str
    status: str = "pending"
    payment_method: str = ""


class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    date: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None


class PaymentOut(BaseModel):
    id: str
    unit_id: str
    lease_id: Optional[str] = None
    amount: float
    date: str
    due_date: str
    status: str
    payment_method: str
    created_at: str

    class Config:
        from_attributes = True


class RentSummary(BaseModel):
    expected: float
    collected: float
    pending: float
    overdue: float
    partial: float = 0


# =====================
# Expenses
# =====================

class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category: str = "Other"
    description: str = ""
    date: str
    receipt_url: Optional[str] = None
    unit_id: Optional[str] = None


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    receipt_url: Optional[str] = None
    unit_id: Optional[str] = None


class ExpenseOut(BaseModel):
    id: str
    unit_id: Optional[str] = None
    amount: float
    category: str
    description: str
    date: str
    status: str
    receipt_url: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


# =====================
# Maintenance
# =====================

class MaintenanceCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = ""
    priority: str = "medium"
    unit_id: str = Field(..., min_length=1)


class MaintenanceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    cost: Optional[float] = None


class MaintenanceOut(BaseModel):
    id: str
    unit_id: str
    tenant_id: Optional[str] = None
    title: str
    description: str
    priority: str
    status: str
    cost: Optional[float] = None
    created_at: str
    updated_at: str = ""

    class Config:
        from_attributes = True


# =====================
# Dashboard
# =====================

class DashboardData(BaseModel):
    unit_counts: dict
    occupancy_rate: float
    monthly_revenue: dict
    expenses: dict
    recent_activities: list
    upcoming_expirations: list


class UpcomingExpiration(BaseModel):
    id: str
    unit_number: str
    tenant_name: str
    end_date: str
    days_until_expiry: int


# =====================
# Tenant Portal
# =====================

class MaintenanceCreatePortal(BaseModel):
    title: str
    description: str
    priority: str = "medium"


class ShareLinkResult(BaseModel):
    token: str
    link: str


# =====================
# Notices
# =====================

class NoticeCreate(BaseModel):
    title: str
    message: str
    type: str = "general"
    status: str = "active"
    unit_id: Optional[str] = None
    tenant_id: Optional[str] = None


class NoticeOut(BaseModel):
    id: str
    unit_id: Optional[str] = None
    tenant_id: Optional[str] = None
    title: str
    message: str
    type: str
    status: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
