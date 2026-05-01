"""Integration tests for dashboard router endpoints."""

import pytest
from app.database import get_db, Base
from app import models


class TestDashboard:
    async def test_dashboard_empty(self, client):
        """Dashboard returns valid data even with no records."""
        resp = await client.get("/api/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert "unit_counts" in data
        assert "occupancy_rate" in data
        assert "monthly_revenue" in data
        assert "expenses" in data
        assert "upcoming_expirations" in data
        assert data["unit_counts"]["total"] == 0
        assert data["occupancy_rate"] == 0

    async def test_dashboard_with_units(self, client, db_session):
        """Dashboard calculates unit counts correctly."""
        db = db_session
        unit1 = models.Unit(id="dash-unit-1", number="101", type="1BR", rent=1200, deposit=1200, status="occupied")
        unit2 = models.Unit(id="dash-unit-2", number="102", type="2BR", rent=1500, deposit=1500, status="vacant")
        unit3 = models.Unit(id="dash-unit-3", number="103", type="Studio", rent=800, deposit=800, status="maintenance")
        db.add_all([unit1, unit2, unit3])
        db.commit()

        resp = await client.get("/api/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert data["unit_counts"]["total"] == 3
        assert data["unit_counts"]["occupied"] == 1
        assert data["unit_counts"]["vacant"] == 1
        assert data["unit_counts"]["maintenance"] == 1
        assert data["occupancy_rate"] == 33.3

    async def test_dashboard_with_payments(self, client, db_session):
        """Dashboard calculates collected revenue from payments."""
        db = db_session
        # Add a unit and active lease for expected revenue
        unit = models.Unit(id="dash-pay-unit", number="201", type="1BR", rent=1000, deposit=1000, status="occupied")
        db.add(unit)
        lease = models.Lease(
            id="dash-lease-1",
            tenant_id="dash-tenant-1",
            unit_id="dash-pay-unit",
            start_date="2025-01-01",
            end_date="2026-01-01",
            monthly_rent=1000,
            status="active",
        )
        db.add(lease)

        # Add a tenant (required by Payment.tenant_id)
        tenant = models.Tenant(
            id="dash-tenant-1",
            first_name="Test",
            last_name="Tenant",
            email="test@example.com",
            unit_id="dash-pay-unit",
        )
        db.add(tenant)

        # Add a payment this month
        payment = models.Payment(
            id="dash-payment-1",
            unit_id="dash-pay-unit",
            tenant_id="dash-tenant-1",
            lease_id="dash-lease-1",
            amount=1000,
            date="2026-05-01",
            due_date="2026-05-01",
            status="paid",
        )
        db.add(payment)
        db.commit()

        resp = await client.get("/api/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert data["monthly_revenue"]["expected"] == 1000
        assert data["monthly_revenue"]["collected"] == 1000

    async def test_dashboard_with_expenses(self, client, db_session):
        """Dashboard calculates expenses and net profit."""
        db = db_session
        expense = models.Expense(
            id="dash-expense-1",
            unit_id="dash-unit-1",
            amount=200,
            category="Repairs",
            date="2026-05-01",
            status="paid",
        )
        db.add(expense)
        db.commit()

        resp = await client.get("/api/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert data["expenses"]["total"] == 200
        assert "by_category" in data["expenses"]
