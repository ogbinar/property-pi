"""Integration tests for payments router endpoints."""

import pytest
import httpx
from app.main import app
from app.auth import create_access_token


class TestPaymentsSummary:
    async def test_rent_summary(self, client: httpx.AsyncClient):
        # Create some payments
        await client.post("/api/payments/", json={
            "unit_id": "u1", "lease_id": None,
            "amount": 1000, "date": "2026-01-05", "due_date": "2026-01-15",
            "status": "paid", "payment_method": "bank",
        })
        await client.post("/api/payments/", json={
            "unit_id": "u2", "lease_id": None,
            "amount": 1200, "date": "2026-01-05", "due_date": "2026-01-15",
            "status": "pending", "payment_method": "cash",
        })
        await client.post("/api/payments/", json={
            "unit_id": "u3", "lease_id": None,
            "amount": 800, "date": "2026-01-05", "due_date": "2026-01-15",
            "status": "overdue", "payment_method": "check",
        })

        resp = await client.get("/api/payments/summary?month=1&year=2026")
        assert resp.status_code == 200
        data = resp.json()
        assert data["expected"] == 3000.0
        assert data["collected"] == 1000.0
        assert data["pending"] == 1200.0
        assert data["overdue"] == 800.0

    async def test_rent_summary_empty_month(self, client: httpx.AsyncClient):
        resp = await client.get("/api/payments/summary?month=6&year=2026")
        assert resp.status_code == 200
        data = resp.json()
        assert data["expected"] == 0
        assert data["collected"] == 0


class TestPaymentsGet:
    async def test_get_payment_by_id(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/payments/", json={
            "unit_id": "u1", "lease_id": None,
            "amount": 1500, "date": "2026-01-05", "due_date": "2026-01-15",
            "status": "pending", "payment_method": "bank",
        })
        payment_id = create_resp.json()["id"]

        resp = await client.get(f"/api/payments/{payment_id}")
        assert resp.status_code == 200
        assert resp.json()["amount"] == 1500

    async def test_get_nonexistent_payment(self, client: httpx.AsyncClient):
        resp = await client.get("/api/payments/nonexistent-id")
        assert resp.status_code == 404


class TestPaymentsUpdateDelete:
    async def test_update_payment(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/payments/", json={
            "unit_id": "u1", "lease_id": None,
            "amount": 1000, "date": "2026-01-05", "due_date": "2026-01-15",
            "status": "pending", "payment_method": "bank",
        })
        payment_id = create_resp.json()["id"]

        resp = await client.put(f"/api/payments/{payment_id}", json={
            "amount": 1200, "status": "paid",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["amount"] == 1200
        assert data["status"] == "paid"

    async def test_delete_payment(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/payments/", json={
            "unit_id": "u1", "lease_id": None,
            "amount": 1000, "date": "2026-01-05", "due_date": "2026-01-15",
            "status": "pending", "payment_method": "bank",
        })
        payment_id = create_resp.json()["id"]

        resp = await client.delete(f"/api/payments/{payment_id}")
        assert resp.status_code == 204

        resp = await client.get(f"/api/payments/{payment_id}")
        assert resp.status_code == 404


class TestPaymentsGenerate:
    async def test_generate_rent(self, client: httpx.AsyncClient):
        # Create an active lease
        await client.post("/api/units/", json={
            "unit_number": "G1", "type": "1BR",
            "rent_amount": 1000, "security_deposit": 1000,
        })
        unit_resp = await client.get("/api/units/")
        unit_id = unit_resp.json()[0]["id"]

        await client.post("/api/tenants/", json={
            "first_name": "Gen", "last_name": "Tenant",
            "email": "gen@example.com", "phone": "555-0",
        })
        tenant_resp = await client.get("/api/tenants/")
        tenant_id = tenant_resp.json()[0]["id"]

        await client.post("/api/leases/", json={
            "unit_id": unit_id, "tenant_id": tenant_id,
            "start_date": "2026-01-01", "end_date": "2026-12-31",
            "rent_amount": 1000, "deposit_amount": 1000,
        })

        resp = await client.post("/api/payments/generate?month=2&year=2026")
        assert resp.status_code == 200
        data = resp.json()
        assert data["created"] >= 1

    async def test_generate_rent_no_active_leases(self, client: httpx.AsyncClient):
        resp = await client.post("/api/payments/generate?month=3&year=2026")
        assert resp.status_code == 200
        data = resp.json()
        assert data["created"] == 0


class TestPaymentsMarkOverdue:
    async def test_mark_overdue(self, client: httpx.AsyncClient):
        await client.post("/api/payments/", json={
            "unit_id": "u1", "lease_id": None,
            "amount": 1000, "date": "2026-01-05", "due_date": "2026-01-15",
            "status": "pending", "payment_method": "bank",
        })

        resp = await client.post("/api/payments/mark-overdue?month=1&year=2026")
        assert resp.status_code == 200
        data = resp.json()
        assert data["updated"] == 1

    async def test_mark_overdue_empty_month(self, client: httpx.AsyncClient):
        resp = await client.post("/api/payments/mark-overdue?month=12&year=2026")
        assert resp.status_code == 200
        data = resp.json()
        assert data["updated"] == 0


class TestPaymentsMonthFilter:
    async def test_filter_by_month(self, client: httpx.AsyncClient):
        await client.post("/api/payments/", json={
            "unit_id": "u1", "lease_id": None,
            "amount": 1000, "date": "2026-01-05", "due_date": "2026-01-15",
            "status": "pending", "payment_method": "bank",
        })
        await client.post("/api/payments/", json={
            "unit_id": "u2", "lease_id": None,
            "amount": 1200, "date": "2026-02-05", "due_date": "2026-02-15",
            "status": "pending", "payment_method": "bank",
        })

        resp = await client.get("/api/payments/?month=1&year=2026")
        assert resp.status_code == 200
        assert len(resp.json()) == 1
        assert resp.json()[0]["amount"] == 1000
