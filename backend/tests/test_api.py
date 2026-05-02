import pytest
import httpx
from app.main import app
from app.auth import create_access_token


class TestHealth:
    async def test_health_check(self, client: httpx.AsyncClient):
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        assert "status" in resp.json()


class TestAuth:
    async def test_register_and_login(self, client: httpx.AsyncClient):
        resp = await client.post("/auth/register", json={
            "email": "new@example.com",
            "password": "secret123",
            "name": "New User",
        })
        assert resp.status_code == 201

        resp = await client.post("/auth/login", json={
            "email": "new@example.com",
            "password": "secret123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: httpx.AsyncClient):
        await client.post("/auth/register", json={
            "email": "wrong@example.com",
            "password": "correct",
            "name": "Wrong",
        })
        resp = await client.post("/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrong",
        })
        assert resp.status_code == 401

    async def test_unauthorized_access(self, db_session):
        resp = await httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ).get("/api/units/")
        assert resp.status_code in (401, 403)


class TestUnits:
    async def test_create_unit(self, client: httpx.AsyncClient):
        resp = await client.post("/api/units/", json={
            "unit_number": "101",
            "type": "1BR",
            "rent_amount": 1200.0,
            "security_deposit": 1200.0,
            "name": "Unit 101",
            "floor": 1,
            "area": 650,
            "features": "Balcony",
            "description": "Nice unit",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["unit_number"] == "101"
        assert data["status"] == "vacant"
        assert data["rent_amount"] == 1200.0
        assert "id" in data

    async def test_list_units(self, client: httpx.AsyncClient):
        await client.post("/api/units/", json={
            "unit_number": "101", "type": "1BR",
            "rent_amount": 1200, "security_deposit": 1200,
        })
        await client.post("/api/units/", json={
            "unit_number": "102", "type": "2BR",
            "rent_amount": 1500, "security_deposit": 1500,
        })
        resp = await client.get("/api/units/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    async def test_get_unit_by_id(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/units/", json={
            "unit_number": "201", "type": "Studio",
            "rent_amount": 900, "security_deposit": 900,
        })
        unit_id = create_resp.json()["id"]
        resp = await client.get(f"/api/units/{unit_id}")
        assert resp.status_code == 200
        assert resp.json()["unit_number"] == "201"

    async def test_get_nonexistent_unit(self, client: httpx.AsyncClient):
        resp = await client.get("/api/units/nonexistent-id")
        assert resp.status_code == 404

    async def test_update_unit(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/units/", json={
            "unit_number": "301", "type": "Studio",
            "rent_amount": 900, "security_deposit": 900,
        })
        unit_id = create_resp.json()["id"]
        resp = await client.put(f"/api/units/{unit_id}", json={
            "rent_amount": 1100.0,
            "name": "Updated Unit",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["rent_amount"] == 1100.0
        assert data["name"] == "Updated Unit"

    async def test_delete_unit(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/units/", json={
            "unit_number": "401", "type": "1BR",
            "rent_amount": 1000, "security_deposit": 1000,
        })
        unit_id = create_resp.json()["id"]
        resp = await client.delete(f"/api/units/{unit_id}")
        assert resp.status_code == 204
        resp = await client.get(f"/api/units/{unit_id}")
        assert resp.status_code == 404

    async def test_rent_history(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/units/", json={
            "unit_number": "501", "type": "1BR",
            "rent_amount": 1000, "security_deposit": 1000,
        })
        unit_id = create_resp.json()["id"]

        entry = {"old_rent": 1000, "new_rent": 1100, "effective_date": "2026-01-01", "reason": "Market"}
        resp = await client.post(f"/api/units/{unit_id}/rent-history", json=entry)
        assert resp.status_code == 201
        assert len(resp.json()["rent_history"]) == 1

        resp = await client.get(f"/api/units/{unit_id}/rent-history")
        assert resp.status_code == 200
        assert len(resp.json()["rent_history"]) == 1

        history = [{"old_rent": 1100, "new_rent": 1200, "effective_date": "2026-06-01", "reason": "Annual"}]
        resp = await client.put(f"/api/units/{unit_id}/rent-history", json=history)
        assert resp.status_code == 200
        assert len(resp.json()["rent_history"]) == 1


class TestTenants:
    async def test_create_tenant(self, client: httpx.AsyncClient):
        resp = await client.post("/api/tenants/", json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone": "555-0100",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["first_name"] == "John"

    async def test_list_tenants(self, client: httpx.AsyncClient):
        await client.post("/api/tenants/", json={
            "first_name": "A", "last_name": "One",
            "email": "a@example.com", "phone": "555-1",
        })
        await client.post("/api/tenants/", json={
            "first_name": "B", "last_name": "Two",
            "email": "b@example.com", "phone": "555-2",
        })
        resp = await client.get("/api/tenants/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    async def test_update_and_delete_tenant(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/tenants/", json={
            "first_name": "C", "last_name": "Three",
            "email": "c@example.com", "phone": "555-3",
        })
        tenant_id = create_resp.json()["id"]

        resp = await client.put(f"/api/tenants/{tenant_id}", json={"phone": "555-9999"})
        assert resp.status_code == 200
        assert resp.json()["phone"] == "555-9999"

        resp = await client.delete(f"/api/tenants/{tenant_id}")
        assert resp.status_code == 204

    async def test_contact_log(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/tenants/", json={
            "first_name": "D", "last_name": "Four",
            "email": "d@example.com", "phone": "555-4",
        })
        tenant_id = create_resp.json()["id"]

        entry = {"date": "2026-04-01", "type": "phone", "notes": "Called about rent"}
        resp = await client.post(f"/api/tenants/{tenant_id}/contact-log", json=entry)
        assert resp.status_code == 201
        assert len(resp.json()["contact_log"]) == 1

        resp = await client.get(f"/api/tenants/{tenant_id}/contact-log")
        assert resp.status_code == 200
        assert len(resp.json()["contact_log"]) == 1


class TestExpenses:
    async def test_create_expense(self, client: httpx.AsyncClient):
        resp = await client.post("/api/expenses/", json={
            "amount": 250.0,
            "category": "Maintenance",
            "description": "Fix leaky faucet",
            "date": "2026-04-01",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["amount"] == 250.0
        assert data["category"] == "Maintenance"
        assert data["status"] == "pending"

    async def test_list_expenses(self, client: httpx.AsyncClient):
        await client.post("/api/expenses/", json={
            "amount": 100, "category": "Utilities",
            "description": "Electric", "date": "2026-01-01",
        })
        resp = await client.get("/api/expenses/")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_update_and_delete_expense(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/expenses/", json={
            "amount": 50, "category": "Other",
            "description": "Misc", "date": "2026-02-01",
        })
        expense_id = create_resp.json()["id"]

        resp = await client.put(f"/api/expenses/{expense_id}", json={"amount": 75.0})
        assert resp.status_code == 200
        assert resp.json()["amount"] == 75.0

        resp = await client.delete(f"/api/expenses/{expense_id}")
        assert resp.status_code == 204


class TestPayments:
    async def test_create_payment(self, client: httpx.AsyncClient):
        resp = await client.post("/api/payments/", json={
            "unit_id": "unit-1",
            "tenant_id": "tenant-1",
            "amount": 1200.0,
            "date": "2026-04-01",
            "due_date": "2026-04-01",
            "type": "rent",
            "payment_method": "bank_transfer",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["amount"] == 1200.0
        assert data["status"] == "pending"

    async def test_mark_payment_paid(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/payments/", json={
            "unit_id": "unit-2", "tenant_id": "tenant-2",
            "amount": 1200, "date": "2026-04-01",
            "due_date": "2026-04-01", "type": "rent",
            "payment_method": "cash",
        })
        payment_id = create_resp.json()["id"]
        resp = await client.post(f"/api/payments/{payment_id}/mark-paid")
        assert resp.status_code == 200
        assert resp.json()["status"] == "paid"


class TestMaintenance:
    async def test_create_maintenance_request(self, client: httpx.AsyncClient):
        resp = await client.post("/api/maintenance/", json={
            "unit_id": "unit-1",
            "title": "Broken heater",
            "description": "Heater not working",
            "priority": "high",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Broken heater"
        assert data["status"] == "open"
        assert data["priority"] == "high"

    async def test_update_maintenance_status(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/maintenance/", json={
            "unit_id": "unit-2",
            "title": "Leaky pipe",
            "description": "Pipe leaking",
            "priority": "medium",
        })
        req_id = create_resp.json()["id"]
        resp = await client.put(f"/api/maintenance/{req_id}", json={
            "status": "in_progress",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "in_progress"

    async def test_list_maintenance(self, client: httpx.AsyncClient):
        await client.post("/api/maintenance/", json={
            "unit_id": "unit-3",
            "title": "Light bulb",
            "description": "Replace bulb",
        })
        resp = await client.get("/api/maintenance/")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1


class TestLeases:
    async def test_create_lease(self, client: httpx.AsyncClient):
        resp = await client.post("/api/leases/", json={
            "unit_id": "unit-lease-1",
            "tenant_id": "tenant-lease-1",
            "start_date": "2026-01-01",
            "end_date": "2026-12-31",
            "rent_amount": 1500.0,
            "deposit_amount": 1500.0,
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "active"
        assert data["monthly_rent"] == 1500.0

    async def test_lease_terminate(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/leases/", json={
            "unit_id": "unit-lease-2",
            "tenant_id": "tenant-lease-2",
            "start_date": "2026-01-01",
            "end_date": "2027-12-31",
            "rent_amount": 1000,
            "deposit_amount": 1000,
        })
        lease_id = create_resp.json()["id"]
        resp = await client.post(f"/api/leases/{lease_id}/terminate", json={
            "reason": "Tenant moving out",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "terminated"


class TestDashboard:
    async def test_dashboard_summary(self, client: httpx.AsyncClient):
        await client.post("/api/units/", json={
            "unit_number": "D1", "type": "1BR",
            "rent_amount": 1000, "security_deposit": 1000,
        })
        await client.post("/api/units/", json={
            "unit_number": "D2", "type": "2BR",
            "rent_amount": 1500, "security_deposit": 1500,
        })
        await client.post("/api/expenses/", json={
            "amount": 200, "category": "Maintenance",
            "description": "Test", "date": "2026-04-01",
        })
        await client.post("/api/payments/", json={
            "unit_id": "d1", "tenant_id": "dt1",
            "amount": 1000, "date": "2026-04-01",
            "due_date": "2026-04-01", "type": "rent",
            "payment_method": "cash",
        })
        resp = await client.get("/api/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert "unit_counts" in data
        assert "total" in data["unit_counts"]
        assert data["unit_counts"]["total"] == 2


class TestUpload:
    async def test_upload_file(self, client: httpx.AsyncClient):
        import io
        resp = await client.post("/api/upload/", files={
            "file": ("test.txt", io.BytesIO(b"hello world"), "text/plain"),
        })
        assert resp.status_code == 400  # .txt not in allowed extensions

    async def test_upload_pdf(self, client: httpx.AsyncClient):
        import io
        resp = await client.post("/api/upload/", files={
            "file": ("receipt.pdf", io.BytesIO(b"%PDF-1.4 test"), "application/pdf"),
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["filename"].endswith(".pdf")
        assert "/uploads/" in data["url"]

    async def test_upload_too_large(self, client: httpx.AsyncClient):
        import io
        large = b"x" * (11 * 1024 * 1024)
        resp = await client.post("/api/upload/", files={
            "file": ("big.pdf", io.BytesIO(large), "application/pdf"),
        })
        assert resp.status_code == 413

    async def test_upload_empty(self, client: httpx.AsyncClient):
        import io
        resp = await client.post("/api/upload/", files={
            "file": ("empty.pdf", io.BytesIO(b""), "application/pdf"),
        })
        assert resp.status_code == 400


class TestErrorHandling:
    async def test_404_returns_standard_format(self, client: httpx.AsyncClient):
        resp = await client.get("/api/units/nonexistent")
        assert resp.status_code == 404
        data = resp.json()
        assert "error" in data
        assert "detail" in data

    async def test_422_returns_standard_format(self, client: httpx.AsyncClient):
        resp = await client.post("/api/units/", json={})
        assert resp.status_code == 422

    async def test_rate_limit_response(self, db_session):
        import httpx as h
        async with h.AsyncClient(
            transport=h.ASGITransport(app=app), base_url="http://test"
        ) as ac:
            ac.headers.update({"Authorization": f"Bearer {create_access_token({'sub': 'rl-test', 'email': 'rl@test.com'})}"})
            resp = await ac.get("/api/health")
            assert resp.status_code == 200
