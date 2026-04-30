"""SQLAlchemy models — must match Drizzle ORM column names in the SQLite database."""

import uuid
from datetime import date, datetime

from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, foreign

from app.database import Base


def _uuid():
    return str(uuid.uuid4())


def _now():
    return datetime.utcnow()


def _empty_str():
    return ""


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default="landlord", nullable=False)
    created_at = Column(String, default=_empty_str, nullable=False)
    updated_at = Column(String, default=_empty_str, nullable=False)

    tenants = relationship("Tenant", back_populates="user", foreign_keys="Tenant.user_id")


class Unit(Base):
    __tablename__ = "units"

    id = Column(String, primary_key=True, default=_uuid)
    number = Column(String, nullable=False)  # matches Drizzle column 'number'
    name = Column(String, default=_empty_str, nullable=False)
    floor = Column(Float, default=0, nullable=False)
    area = Column(Float, default=0, nullable=False)
    type = Column(String, nullable=True)
    rent = Column(Float, nullable=False, default=0)  # matches Drizzle column 'rent'
    deposit = Column(Float, nullable=False, default=0)  # matches Drizzle column 'deposit'
    status = Column(String, default="vacant", nullable=False)
    features = Column(String, default=_empty_str, nullable=False)
    description = Column(String, default=_empty_str, nullable=False)
    rent_history = Column(Text, default="[]")
    created_at = Column(String, default=_empty_str, nullable=False)
    updated_at = Column(String, default=_empty_str, nullable=False)

    tenants = relationship("Tenant", back_populates="unit", foreign_keys="Tenant.unit_id")
    leases = relationship("Lease", back_populates="unit", foreign_keys="Lease.unit_id")
    expenses = relationship("Expense", back_populates="unit", foreign_keys="Expense.unit_id")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="unit", foreign_keys="MaintenanceRequest.unit_id")


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, default=_uuid)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, default=_empty_str, nullable=False)
    unit_id = Column(String, ForeignKey("units.id"), nullable=True)
    move_in_date = Column(String, default=_empty_str, nullable=False)
    move_out_date = Column(String, nullable=True)
    status = Column(String, default="active", nullable=False)
    notes = Column(String, default=_empty_str, nullable=False)
    contact_log = Column(Text, default="[]")
    created_at = Column(String, default=_empty_str, nullable=False)
    updated_at = Column(String, default=_empty_str, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    emergency_contact = Column(String, nullable=True)

    unit = relationship("Unit", back_populates="tenants", foreign_keys="Tenant.unit_id")
    user = relationship("User", back_populates="tenants", foreign_keys="Tenant.user_id")
    leases = relationship("Lease", back_populates="tenant", foreign_keys="Lease.tenant_id")


class Lease(Base):
    __tablename__ = "leases"

    id = Column(String, primary_key=True, default=_uuid)
    unit_id = Column(String, ForeignKey("units.id"), nullable=False)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    monthly_rent = Column(Float, default=0, nullable=False)
    deposit_amount = Column(Float, default=0, nullable=False)
    status = Column(String, default="active", nullable=False)
    tenant_access = Column(String, default=_empty_str, nullable=False)
    created_at = Column(String, default=_empty_str, nullable=False)
    updated_at = Column(String, default=_empty_str, nullable=False)

    unit = relationship("Unit", back_populates="leases", foreign_keys="Lease.unit_id")
    tenant = relationship("Tenant", back_populates="leases", foreign_keys="Lease.tenant_id")
    payments = relationship("Payment", back_populates="lease", foreign_keys="Payment.lease_id")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=_uuid)
    unit_id = Column(String, nullable=False)
    tenant_id = Column(String, nullable=False)  # matches Drizzle column
    lease_id = Column(String, ForeignKey("leases.id"), nullable=True)
    amount = Column(Float, default=0, nullable=False)
    date = Column(String, nullable=False)
    due_date = Column(String, nullable=False)
    type = Column(String, default="rent", nullable=False)  # matches Drizzle column
    status = Column(String, default="pending", nullable=False)
    payment_method = Column(String, default=_empty_str, nullable=False)
    notes = Column(String, default=_empty_str, nullable=False)
    created_at = Column(String, default=_empty_str, nullable=False)
    updated_at = Column(String, default=_empty_str, nullable=False)

    lease = relationship("Lease", back_populates="payments", foreign_keys="Payment.lease_id")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, default=_uuid)
    unit_id = Column(String, ForeignKey("units.id"), nullable=True)
    amount = Column(Float, default=0, nullable=False)
    category = Column(String, default="Other", nullable=False)
    description = Column(Text, default=_empty_str, nullable=False)
    date = Column(String, nullable=False)
    status = Column(String, default="pending", nullable=False)
    file_url = Column(String, nullable=True)
    created_at = Column(String, default=_empty_str, nullable=False)
    updated_at = Column(String, default=_empty_str, nullable=False)

    unit = relationship("Unit", back_populates="expenses", foreign_keys="Expense.unit_id")


class MaintenanceRequest(Base):
    __tablename__ = "maintenance"

    id = Column(String, primary_key=True, default=_uuid)
    unit_id = Column(String, ForeignKey("units.id"), nullable=False)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, default=_empty_str, nullable=False)
    priority = Column(String, default="medium", nullable=False)
    status = Column(String, default="open", nullable=False)
    cost = Column(Float, nullable=True)
    created_at = Column(String, default=_empty_str, nullable=False)
    updated_at = Column(String, default=_empty_str, nullable=False)

    unit = relationship("Unit", back_populates="maintenance_requests", foreign_keys="MaintenanceRequest.unit_id")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(String, primary_key=True, default=_uuid)
    unit_id = Column(String, nullable=True)
    tenant_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="general", nullable=False)
    status = Column(String, default="draft", nullable=False)
    created_at = Column(String, default=_empty_str, nullable=False)
    updated_at = Column(String, default=_empty_str, nullable=False)



