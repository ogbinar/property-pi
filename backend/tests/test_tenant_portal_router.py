"""Integration tests for tenant portal router endpoints."""

import pytest
from app.database import get_db, Base
from app import models


class TestTenantPortal:
    async def test_portal_invalid_token(self, client):
        """Returns 401 for invalid tenant token."""
        resp = await client.get("/api/tenant/nonexistent-lease?token=invalid")
        assert resp.status_code == 401  # invalid token raises 401

    async def test_portal_with_valid_token(self, client, db_session):
        """Returns portal data for valid lease with token."""
        db = db_session
        # Create tenant
        tenant = models.Tenant(
            id="portal-tenant-1",
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            phone="555-0000",
            unit_id="portal-unit-1",
        )
        db.add(tenant)

        # Create unit
        unit = models.Unit(
            id="portal-unit-1",
            number="301",
            type="2BR",
            rent=1500,
            deposit=1500,
            status="occupied",
        )
        db.add(unit)

        # Create lease with access token
        lease = models.Lease(
            id="portal-lease-1",
            tenant_id="portal-tenant-1",
            unit_id="portal-unit-1",
            start_date="2025-01-01",
            end_date="2026-12-31",
            monthly_rent=1500,
            status="active",
            tenant_access="valid-token-123",
        )
        db.add(lease)
        db.commit()

        resp = await client.get("/api/tenant/portal-lease-1?token=valid-token-123")
        assert resp.status_code == 200
        data = resp.json()
        assert data["lease"]["tenant_id"] == "portal-tenant-1"
        assert data["lease"]["unit_id"] == "portal-unit-1"
        assert data["lease"]["monthly_rent"] == 1500
        assert "tenant" in data["lease"]
        assert "unit" in data["lease"]
        assert data["lease"]["tenant"]["first_name"] == "Alice"
        assert data["lease"]["unit"]["unit_number"] == "301"
        assert isinstance(data["payments"], list)
        assert isinstance(data["maintenanceRequests"], list)

    async def test_portal_maintenance_creation(self, client, db_session):
        """Tenant can create maintenance requests."""
        db = db_session
        tenant = models.Tenant(
            id="portal-maint-tenant",
            first_name="Bob",
            last_name="Jones",
            email="bob@example.com",
            unit_id="portal-maint-unit",
        )
        db.add(tenant)
        unit = models.Unit(
            id="portal-maint-unit",
            number="402",
            type="1BR",
            rent=1200,
            deposit=1200,
        )
        db.add(unit)
        lease = models.Lease(
            id="portal-maint-lease",
            tenant_id="portal-maint-tenant",
            unit_id="portal-maint-unit",
            start_date="2025-01-01",
            end_date="2026-01-01",
            monthly_rent=1200,
            status="active",
            tenant_access="maint-token",
        )
        db.add(lease)
        db.commit()

        resp = await client.post(
            "/api/tenant/portal-maint-lease/maintenance?token=maint-token",
            json={"title": "Leaky faucet", "description": "Kitchen sink", "priority": "high"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data

    async def test_portal_get_payments(self, client, db_session):
        """Tenant can view their payment history."""
        db = db_session
        tenant = models.Tenant(
            id="portal-pay-tenant",
            first_name="Carol",
            last_name="White",
            email="carol@example.com",
            unit_id="portal-pay-unit",
        )
        db.add(tenant)
        unit = models.Unit(
            id="portal-pay-unit",
            number="501",
            type="Studio",
            rent=900,
            deposit=900,
        )
        db.add(unit)
        lease = models.Lease(
            id="portal-pay-lease",
            tenant_id="portal-pay-tenant",
            unit_id="portal-pay-unit",
            start_date="2025-01-01",
            end_date="2026-01-01",
            monthly_rent=900,
            status="active",
            tenant_access="pay-token",
        )
        db.add(lease)
        payment = models.Payment(
            id="portal-pay-1",
            unit_id="portal-pay-unit",
            tenant_id="portal-pay-tenant",
            lease_id="portal-pay-lease",
            amount=900,
            date="2025-06-01",
            due_date="2025-06-01",
            status="paid",
        )
        db.add(payment)
        db.commit()

        resp = await client.get("/api/tenant/portal-pay-lease/payments?token=pay-token")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["amount"] == 900
        assert data[0]["status"] == "paid"

    async def test_portal_get_maintenance(self, client, db_session):
        """Tenant can view their maintenance requests."""
        db = db_session
        tenant = models.Tenant(
            id="portal-main-tenant",
            first_name="Dave",
            last_name="Brown",
            email="dave@example.com",
            unit_id="portal-main-unit",
        )
        db.add(tenant)
        unit = models.Unit(
            id="portal-main-unit",
            number="601",
            type="2BR",
            rent=1800,
            deposit=1800,
        )
        db.add(unit)
        lease = models.Lease(
            id="portal-main-lease",
            tenant_id="portal-main-tenant",
            unit_id="portal-main-unit",
            start_date="2025-01-01",
            end_date="2026-01-01",
            monthly_rent=1800,
            status="active",
            tenant_access="main-token",
        )
        db.add(lease)
        maint = models.MaintenanceRequest(
            id="portal-main-1",
            unit_id="portal-main-unit",
            tenant_id="portal-main-tenant",
            title="Broken heater",
            description="No heat in winter",
            priority="urgent",
            status="open",
        )
        db.add(maint)
        db.commit()

        resp = await client.get("/api/tenant/portal-main-lease/maintenance?token=main-token")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["title"] == "Broken heater"
        assert data[0]["priority"] == "urgent"

    async def test_portal_get_notices(self, client, db_session):
        """Tenant can view notices for their lease."""
        db = db_session
        tenant = models.Tenant(
            id="portal-not-tenant",
            first_name="Eve",
            last_name="Davis",
            email="eve@example.com",
            unit_id="portal-not-unit",
        )
        db.add(tenant)
        unit = models.Unit(
            id="portal-not-unit",
            number="701",
            type="3BR",
            rent=2500,
            deposit=2500,
        )
        db.add(unit)
        lease = models.Lease(
            id="portal-not-lease",
            tenant_id="portal-not-tenant",
            unit_id="portal-not-unit",
            start_date="2025-01-01",
            end_date="2026-01-01",
            monthly_rent=2500,
            status="active",
            tenant_access="not-token",
        )
        db.add(lease)
        notice = models.Notice(
            id="portal-not-1",
            tenant_id="portal-not-tenant",
            unit_id="portal-not-unit",
            title="Building Maintenance",
            message="Elevator will be down on Monday",
            type="general",
            status="active",
        )
        db.add(notice)
        db.commit()

        resp = await client.get("/api/tenant/portal-not-lease/notices?token=not-token")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["title"] == "Building Maintenance"

    async def test_portal_wrong_token(self, client, db_session):
        """Returns 401 for wrong token."""
        db = db_session
        tenant = models.Tenant(
            id="portal-wrong-tenant",
            first_name="Frank",
            last_name="Miller",
            email="frank@example.com",
            unit_id="portal-wrong-unit",
        )
        db.add(tenant)
        unit = models.Unit(
            id="portal-wrong-unit",
            number="801",
            type="1BR",
            rent=1000,
            deposit=1000,
        )
        db.add(unit)
        lease = models.Lease(
            id="portal-wrong-lease",
            tenant_id="portal-wrong-tenant",
            unit_id="portal-wrong-unit",
            start_date="2025-01-01",
            end_date="2026-01-01",
            monthly_rent=1000,
            status="active",
            tenant_access="correct-token",
        )
        db.add(lease)
        db.commit()

        resp = await client.get("/api/tenant/portal-wrong-lease?token=wrong-token")
        assert resp.status_code == 401  # invalid token
