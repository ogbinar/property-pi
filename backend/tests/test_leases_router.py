"""Integration tests for leases router endpoints."""

import pytest
import httpx
from app.main import app
from app.auth import create_access_token, hash_password
from app.database import get_db, Base
from app import models


@pytest.fixture
def _seed_lease_test_data(db_session):
    """Seed test DB with units, tenants, and leases for lease tests."""
    db = models.SessionLocal() if hasattr(models, 'SessionLocal') else None

    # Use the conftest db_session override to get the test DB
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    engine = create_engine("sqlite:///./tests_test.db", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Create test unit
        unit = models.Unit(
            id="lease-test-unit-1",
            number="101",
            type="1BR",
            rent=1200,
            deposit=1200,
            status="vacant",
        )
        db.add(unit)

        # Create test tenant
        tenant = models.Tenant(
            id="lease-test-tenant-1",
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone="555-1234",
            emergency_contact="Jane Doe",
            unit_id="lease-test-unit-1",
        )
        db.add(tenant)
        db.commit()
    finally:
        db.close()


class TestLeaseCRUD:
    async def test_create_lease(self, client: httpx.AsyncClient):
        resp = await client.post("/api/leases/", json={
            "tenant_id": "lease-test-tenant-1",
            "unit_id": "lease-test-unit-1",
            "start_date": "2025-01-01",
            "end_date": "2026-01-01",
            "rent_amount": 1200,
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["tenant_id"] == "lease-test-tenant-1"
        assert data["unit_id"] == "lease-test-unit-1"
        assert data["status"] == "active"
        assert data["monthly_rent"] == 1200

    async def test_get_leases(self, client: httpx.AsyncClient):
        leases = await client.get("/api/leases/")
        assert leases.status_code == 200
        assert isinstance(leases.json(), list)

    async def test_get_lease_by_id(self, client: httpx.AsyncClient):
        # Create a lease first
        create_resp = await client.post("/api/leases/", json={
            "tenant_id": "lease-test-tenant-1",
            "unit_id": "lease-test-unit-1",
            "start_date": "2025-01-01",
            "end_date": "2026-01-01",
            "rent_amount": 1200,
        })
        lease_id = create_resp.json()["id"]

        get_resp = await client.get(f"/api/leases/{lease_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == lease_id

    async def test_get_lease_with_relations(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/leases/", json={
            "tenant_id": "lease-test-tenant-1",
            "unit_id": "lease-test-unit-1",
            "start_date": "2025-01-01",
            "end_date": "2026-01-01",
            "rent_amount": 1200,
        })
        lease_id = create_resp.json()["id"]

        resp = await client.get(f"/api/leases/{lease_id}/with-relations")
        assert resp.status_code == 200
        data = resp.json()
        assert "tenant" in data
        assert "unit" in data

    async def test_update_lease(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/leases/", json={
            "tenant_id": "lease-test-tenant-1",
            "unit_id": "lease-test-unit-1",
            "start_date": "2025-01-01",
            "end_date": "2026-01-01",
            "rent_amount": 1200,
        })
        lease_id = create_resp.json()["id"]

        resp = await client.put(f"/api/leases/{lease_id}", json={
            "end_date": "2027-01-01",
        })
        assert resp.status_code == 200
        assert resp.json()["end_date"] == "2027-01-01"

    async def test_delete_lease(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/leases/", json={
            "tenant_id": "lease-test-tenant-1",
            "unit_id": "lease-test-unit-1",
            "start_date": "2025-01-01",
            "end_date": "2026-01-01",
            "rent_amount": 1200,
        })
        lease_id = create_resp.json()["id"]

        resp = await client.delete(f"/api/leases/{lease_id}")
        assert resp.status_code == 204

        # Verify deleted
        get_resp = await client.get(f"/api/leases/{lease_id}")
        assert get_resp.status_code == 404

    async def test_lease_not_found(self, client: httpx.AsyncClient):
        resp = await client.get("/api/leases/nonexistent-id")
        assert resp.status_code == 404

    async def test_terminate_lease(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/leases/", json={
            "tenant_id": "lease-test-tenant-1",
            "unit_id": "lease-test-unit-1",
            "start_date": "2025-01-01",
            "end_date": "2026-01-01",
            "rent_amount": 1200,
        })
        lease_id = create_resp.json()["id"]

        resp = await client.post(f"/api/leases/{lease_id}/terminate")
        assert resp.status_code == 200
        assert resp.json()["status"] == "terminated"

    async def test_share_link(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/leases/", json={
            "tenant_id": "lease-test-tenant-1",
            "unit_id": "lease-test-unit-1",
            "start_date": "2025-01-01",
            "end_date": "2026-01-01",
            "rent_amount": 1200,
        })
        lease_id = create_resp.json()["id"]

        resp = await client.post(f"/api/leases/{lease_id}/share-link")
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert "link" in data
        assert f"leaseId={lease_id}" in data["link"]
