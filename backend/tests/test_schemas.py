"""Unit tests for Pydantic schemas in app/schemas.py."""

import pytest
from pydantic import ValidationError

from app.schemas import (
    UserCreate, UserOut, Token, LoginRequest,
    UnitCreate, UnitUpdate, UnitOut,
    TenantCreate, TenantUpdate, TenantOut,
    LeaseCreate, LeaseUpdate, LeaseOut, LeaseOutWithRelations,
    PaymentCreate, PaymentUpdate, PaymentOut, RentSummary,
    ExpenseCreate, ExpenseUpdate, ExpenseOut,
    MaintenanceCreate, MaintenanceUpdate, MaintenanceOut,
    DashboardData, UpcomingExpiration,
    MaintenanceCreatePortal, ShareLinkResult,
    NoticeCreate, NoticeOut,
)


class TestUserCreate:
    def test_valid(self):
        u = UserCreate(name="John", email="john@example.com", password="secret123")
        assert u.name == "John"
        assert u.password == "secret123"

    def test_empty_name_raises(self):
        with pytest.raises(ValidationError):
            UserCreate(name="", email="j@x.com", password="secret123")

    def test_short_password_raises(self):
        with pytest.raises(ValidationError):
            UserCreate(name="John", email="j@x.com", password="short")

    def test_missing_name_raises(self):
        with pytest.raises(ValidationError):
            UserCreate(email="j@x.com", password="secret123")

    def test_missing_email_raises(self):
        with pytest.raises(ValidationError):
            UserCreate(name="John", password="secret123")


class TestUnitCreate:
    def test_valid(self):
        u = UnitCreate(unit_number="101", type="1BR", rent_amount=1200, security_deposit=1200)
        assert u.type == "1BR"
        assert u.rent_amount == 1200

    def test_zero_rent_raises(self):
        with pytest.raises(ValidationError):
            UnitCreate(unit_number="101", type="1BR", rent_amount=0, security_deposit=1200)

    def test_negative_rent_raises(self):
        with pytest.raises(ValidationError):
            UnitCreate(unit_number="101", type="1BR", rent_amount=-100, security_deposit=1200)

    def test_negative_deposit_raises(self):
        with pytest.raises(ValidationError):
            UnitCreate(unit_number="101", type="1BR", rent_amount=1000, security_deposit=-100)

    def test_zero_deposit_allowed(self):
        u = UnitCreate(unit_number="101", type="1BR", rent_amount=1000, security_deposit=0)
        assert u.security_deposit == 0

    def test_defaults(self):
        u = UnitCreate(unit_number="101", type="1BR", rent_amount=1000, security_deposit=500)
        assert u.name == ""
        assert u.floor == 0
        assert u.area == 0
        assert u.features == ""
        assert u.description == ""


class TestUnitUpdate:
    def test_all_optional(self):
        u = UnitUpdate()
        assert u.type is None

    def test_partial_update(self):
        u = UnitUpdate(rent_amount=1500)
        assert u.rent_amount == 1500
        assert u.type is None


class TestTenantCreate:
    def test_valid(self):
        t = TenantCreate(first_name="John", last_name="Doe", email="john@example.com")
        assert t.first_name == "John"

    def test_empty_first_name_raises(self):
        with pytest.raises(ValidationError):
            TenantCreate(first_name="", last_name="Doe", email="j@x.com")

    def test_empty_last_name_raises(self):
        with pytest.raises(ValidationError):
            TenantCreate(first_name="John", last_name="", email="j@x.com")


class TestLeaseCreate:
    def test_valid(self):
        l = LeaseCreate(tenant_id="t1", unit_id="u1", start_date="2026-01-01", end_date="2026-12-31", rent_amount=1500)
        assert l.rent_amount == 1500

    def test_zero_rent_raises(self):
        with pytest.raises(ValidationError):
            LeaseCreate(tenant_id="t1", unit_id="u1", start_date="2026-01-01", end_date="2026-12-31", rent_amount=0)


class TestPaymentCreate:
    def test_valid(self):
        p = PaymentCreate(unit_id="u1", amount=1200, date="2026-01-01", due_date="2026-01-15")
        assert p.status == "pending"
        assert p.payment_method == ""

    def test_zero_amount_raises(self):
        with pytest.raises(ValidationError):
            PaymentCreate(unit_id="u1", amount=0, date="2026-01-01", due_date="2026-01-15")


class TestExpenseCreate:
    def test_valid(self):
        e = ExpenseCreate(amount=250, category="Maintenance", date="2026-01-01")
        assert e.category == "Maintenance"
        assert e.description == ""

    def test_default_category(self):
        e = ExpenseCreate(amount=100, date="2026-01-01")
        assert e.category == "Other"

    def test_zero_amount_raises(self):
        with pytest.raises(ValidationError):
            ExpenseCreate(amount=0, date="2026-01-01")


class TestMaintenanceCreate:
    def test_valid(self):
        m = MaintenanceCreate(title="Leaky pipe", unit_id="u1")
        assert m.priority == "medium"
        assert m.description == ""

    def test_empty_title_raises(self):
        with pytest.raises(ValidationError):
            MaintenanceCreate(title="", unit_id="u1")

    def test_empty_unit_id_raises(self):
        with pytest.raises(ValidationError):
            MaintenanceCreate(title="Leaky pipe", unit_id="")


class TestNoticeCreate:
    def test_valid(self):
        n = NoticeCreate(title="Rent Increase", message="Rent will increase next month")
        assert n.type == "general"
        assert n.status == "active"

    def test_custom_type(self):
        n = NoticeCreate(title="Notice", message="msg", type="maintenance")
        assert n.type == "maintenance"
