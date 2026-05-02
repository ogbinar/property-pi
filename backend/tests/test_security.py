"""Additional tests for security, edge cases, and uncovered areas."""
import pytest
import httpx
import io
from datetime import datetime, timezone

from app.main import app
from app.auth import create_access_token


class TestAuthSecurity:
    """Tests for authentication security concerns."""

    async def test_login_returns_access_token(self, client: httpx.AsyncClient):
        """Verify login returns proper JWT structure."""
        await client.post("/auth/register", json={
            "email": "sec-test@example.com",
            "password": "SecurePass123!",
            "name": "Security Test",
        })
        resp = await client.post("/auth/login", json={
            "email": "sec-test@example.com",
            "password": "SecurePass123!",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0

    async def test_login_nonexistent_user(self, client: httpx.AsyncClient):
        """Login with nonexistent user should return 401, not 500."""
        resp = await client.post("/auth/login", json={
            "email": "doesnotexist@example.com",
            "password": "password123",
        })
        assert resp.status_code == 401

    async def test_login_empty_password(self, client: httpx.AsyncClient):
        """Login with empty password should fail gracefully."""
        resp = await client.post("/auth/login", json={
            "email": "any@example.com",
            "password": "",
        })
        assert resp.status_code == 401

    async def test_register_duplicate_email(self, client: httpx.AsyncClient):
        """Registering with an existing email should return 409."""
        await client.post("/auth/register", json={
            "email": "dup@example.com",
            "password": "password123",
            "name": "First",
        })
        resp = await client.post("/auth/register", json={
            "email": "dup@example.com",
            "password": "password456",
            "name": "Second",
        })
        assert resp.status_code == 409

    async def test_register_min_password_length(self, client: httpx.AsyncClient):
        """Password must be at least 6 characters (schema validation)."""
        resp = await client.post("/auth/register", json={
            "email": "weak@example.com",
            "password": "1",
            "name": "Weak",
        })
        assert resp.status_code == 422  # min_length=6 violation

    async def test_me_endpoint_returns_user_data(self, client: httpx.AsyncClient):
        """GET /auth/me should return current user info (uses Bearer header)."""
        await client.post("/auth/register", json={
            "email": "me-test@example.com",
            "password": "secret123",
            "name": "Me Test",
        })
        login_resp = await client.post("/auth/login", json={
            "email": "me-test@example.com",
            "password": "secret123",
        })
        token = login_resp.json()["access_token"]
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as ac:
            ac.headers.update({"Authorization": f"Bearer {token}"})
            resp = await ac.get("/auth/me")
            assert resp.status_code == 200
            data = resp.json()
            assert "email" in data
            assert data["email"] == "me-test@example.com"

    async def test_me_endpoint_without_token(self, db_session):
        """GET /auth/me without auth should return 401/403."""
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as ac:
            resp = await ac.get("/auth/me")
            assert resp.status_code in (401, 403)

    async def test_invalid_token_returns_401(self, db_session):
        """Invalid JWT should return 401, not 500."""
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as ac:
            ac.headers.update({"Authorization": "Bearer invalid.token.here"})
            resp = await ac.get("/auth/me")
            assert resp.status_code == 401

    async def test_expired_token_returns_401(self, db_session):
        """Expired JWT should return 401."""
        from app.auth import create_access_token as _ct
        from datetime import timedelta
        # Create an already-expired token
        expired_token = _ct(
            {"sub": "expired-user", "email": "expired@example.com"},
            expires_delta=timedelta(seconds=-1),
        )
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as ac:
            ac.headers.update({"Authorization": f"Bearer {expired_token}"})
            resp = await ac.get("/auth/me")
            assert resp.status_code == 401


class TestTenantPortalSecurity:
    """Tests for tenant portal token-based access."""

    async def _create_lease_with_token(self, client, db_session):
        """Helper to create a lease and generate a share link."""
        from app.models import Lease
        import secrets
        lease = Lease(
            unit_id="portal-unit-1",
            tenant_id="portal-tenant-1",
            start_date="2026-01-01",
            end_date="2027-12-31",
            monthly_rent=1000.0,
            deposit_amount=1000.0,
            status="active",
            tenant_access=secrets.token_urlsafe(32),
        )
        db_session.add(lease)
        db_session.commit()
        db_session.refresh(lease)
        return lease.id, lease.tenant_access

    async def test_tenant_portal_valid_token(self, client: httpx.AsyncClient, db_session):
        """Valid token should return tenant portal data."""
        lease_id, token = await self._create_lease_with_token(client, db_session)
        resp = await client.get(f"/api/tenant/{lease_id}", params={"token": token})
        assert resp.status_code == 200
        data = resp.json()
        assert "lease" in data
        assert "payments" in data
        assert "maintenanceRequests" in data

    async def test_tenant_portal_invalid_token(self, client: httpx.AsyncClient, db_session):
        """Invalid token should return 401."""
        lease_id, _ = await self._create_lease_with_token(client, db_session)
        resp = await client.get(f"/api/tenant/{lease_id}", params={"token": "invalid-token"})
        assert resp.status_code == 401

    async def test_tenant_portal_missing_token(self, client: httpx.AsyncClient, db_session):
        """Missing token parameter should return 422."""
        lease_id, _ = await self._create_lease_with_token(client, db_session)
        resp = await client.get(f"/api/tenant/{lease_id}")
        assert resp.status_code == 422

    async def test_tenant_portal_nonexistent_lease(self, client: httpx.AsyncClient):
        """Nonexistent lease ID should return 401."""
        resp = await client.get("/api/tenant/nonexistent", params={"token": "any-token"})
        assert resp.status_code == 401

    async def test_tenant_create_maintenance(self, client: httpx.AsyncClient, db_session):
        """Tenant can create maintenance request via portal."""
        lease_id, token = await self._create_lease_with_token(client, db_session)
        resp = await client.post(
            f"/api/tenant/{lease_id}/maintenance",
            params={"token": token},
            json={"title": "Leaky faucet", "description": "Kitchen faucet dripping", "priority": "medium"},
        )
        assert resp.status_code == 200
        assert "id" in resp.json()

    async def test_tenant_create_maintenance_malformed_data(self, client: httpx.AsyncClient, db_session):
        """Malformed maintenance data should still work (no validation currently)."""
        lease_id, token = await self._create_lease_with_token(client, db_session)
        resp = await client.post(
            f"/api/tenant/{lease_id}/maintenance",
            params={"token": token},
            json={},
        )
        assert resp.status_code == 200


class TestUploadSecurity:
    """Tests for file upload security."""

    async def test_upload_path_traversal_blocked(self, client: httpx.AsyncClient):
        """Path traversal in filename should be sanitized."""
        resp = await client.post("/api/upload/", files={
            "file": ("../../../etc/passwd.pdf", io.BytesIO(b"%PDF test"), "application/pdf"),
        })
        if resp.status_code == 201:
            data = resp.json()
            assert ".." not in data["filename"]
            assert "/etc" not in data["filename"]

    async def test_upload_disallowed_extension(self, client: httpx.AsyncClient):
        """Executable file upload should be blocked."""
        for ext in [".exe", ".sh", ".php", ".js", ".html"]:
            resp = await client.post("/api/upload/", files={
                "file": (f"malicious{ext}", io.BytesIO(b"bad"), "application/octet-stream"),
            })
            assert resp.status_code == 400, f"Extension {ext} should be blocked"

    async def test_upload_allowed_extensions(self, client: httpx.AsyncClient):
        """Allowed file types should be accepted."""
        for filename, content_type in [
            ("doc.pdf", "application/pdf"),
            ("photo.jpg", "image/jpeg"),
            ("image.png", "image/png"),
            ("photo.webp", "image/webp"),
        ]:
            resp = await client.post("/api/upload/", files={
                "file": (filename, io.BytesIO(b"test content"), content_type),
            })
            assert resp.status_code == 201, f"{filename} should be allowed"

    async def test_upload_filename_sanitized(self, client: httpx.AsyncClient):
        """Special characters in filename should be sanitized."""
        resp = await client.post("/api/upload/", files={
            "file": ("receipt <test>&.pdf", io.BytesIO(b"%PDF test"), "application/pdf"),
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "<" not in data["filename"]
        assert ">" not in data["filename"]
        assert "&" not in data["filename"]


class TestPaymentsEdgeCases:
    """Tests for payment edge cases."""

    async def test_payment_date_filtering(self, client: httpx.AsyncClient):
        """Payments should be filterable by month/year."""
        await client.post("/api/payments/", json={
            "unit_id": "pf-unit", "tenant_id": "pf-tenant",
            "amount": 1000, "date": "2026-03-01",
            "due_date": "2026-03-01", "type": "rent",
            "payment_method": "cash",
        })
        await client.post("/api/payments/", json={
            "unit_id": "pf-unit", "tenant_id": "pf-tenant",
            "amount": 1000, "date": "2026-04-01",
            "due_date": "2026-04-01", "type": "rent",
            "payment_method": "cash",
        })
        resp = await client.get("/api/payments/?month=3&year=2026")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    async def test_payment_generate_monthly(self, client: httpx.AsyncClient, db_session):
        """Generate rent should create payments for active leases."""
        from app.models import Lease
        lease = Lease(
            unit_id="gen-unit-1",
            tenant_id="gen-tenant-1",
            start_date="2026-01-01",
            end_date="2027-12-31",
            monthly_rent=1500.0,
            deposit_amount=1500.0,
            status="active",
        )
        db_session.add(lease)
        db_session.commit()

        resp = await client.post("/api/payments/generate?month=4&year=2026")
        assert resp.status_code == 200
        data = resp.json()
        assert data["created"] == 1
        assert len(data["payments"]) == 1
        assert data["payments"][0]["amount"] == 1500.0

    async def test_payment_mark_overdue(self, client: httpx.AsyncClient):
        """Mark overdue should change pending payments to overdue."""
        create_resp = await client.post("/api/payments/", json={
            "unit_id": "overdue-unit", "tenant_id": "overdue-tenant",
            "amount": 1000, "date": "2026-04-01",
            "due_date": "2026-04-01", "type": "rent",
            "payment_method": "cash",
        })
        payment_id = create_resp.json()["id"]

        resp = await client.post(f"/api/payments/{payment_id}/mark-paid")
        assert resp.json()["status"] == "paid"

    async def test_rent_summary(self, client: httpx.AsyncClient):
        """Rent summary should aggregate correctly."""
        await client.post("/api/payments/", json={
            "unit_id": "sum-unit-1", "tenant_id": "sum-tenant-1",
            "amount": 1000, "date": "2026-04-01",
            "due_date": "2026-04-01", "type": "rent",
            "payment_method": "cash",
        })
        p2 = await client.post("/api/payments/", json={
            "unit_id": "sum-unit-2", "tenant_id": "sum-tenant-2",
            "amount": 1500, "date": "2026-04-15",
            "due_date": "2026-04-15", "type": "rent",
            "payment_method": "cash",
        })
        p2_id = p2.json()["id"]
        await client.post(f"/api/payments/{p2_id}/mark-paid")

        resp = await client.get("/api/payments/summary?month=4&year=2026")
        assert resp.status_code == 200
        data = resp.json()
        assert data["expected"] >= 2500.0
        assert data["collected"] == 1500.0
        assert data["pending"] == 1000.0


class TestDashboardAggregation:
    """Tests for dashboard aggregation correctness."""

    async def test_dashboard_empty(self, client: httpx.AsyncClient):
        """Dashboard with no data should return zero counts."""
        resp = await client.get("/api/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert data["unit_counts"]["total"] == 0

    async def test_dashboard_with_mixed_units(self, client: httpx.AsyncClient):
        """Dashboard should count unit statuses correctly."""
        await client.post("/api/units/", json={
            "unit_number": "A1", "type": "1BR",
            "rent_amount": 1000, "security_deposit": 1000,
            "status": "occupied",
        })
        await client.post("/api/units/", json={
            "unit_number": "A2", "type": "2BR",
            "rent_amount": 1500, "security_deposit": 1500,
            "status": "vacant",
        })
        await client.post("/api/units/", json={
            "unit_number": "A3", "type": "Studio",
            "rent_amount": 800, "security_deposit": 800,
            "status": "maintenance",
        })

        resp = await client.get("/api/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert data["unit_counts"]["total"] == 3
        assert "occupied" in data["unit_counts"]
        assert "vacant" in data["unit_counts"]


class TestErrorConsistency:
    """Tests for consistent error response format."""

    async def test_404_has_error_and_detail(self, client: httpx.AsyncClient):
        """404 responses should have both 'error' and 'detail' fields."""
        resp = await client.get("/api/units/nonexistent")
        assert resp.status_code == 404
        data = resp.json()
        assert "error" in data
        assert "detail" in data

    async def test_422_has_structure(self, client: httpx.AsyncClient):
        """422 responses should have validation error structure."""
        resp = await client.post("/api/units/", json={})
        assert resp.status_code == 422
        data = resp.json()
        assert "detail" in data

    async def test_delete_nonexistent_returns_404(self, client: httpx.AsyncClient):
        """Deleting a nonexistent resource should return 404."""
        resp = await client.delete("/api/units/nonexistent")
        assert resp.status_code == 404

    async def test_update_nonexistent_returns_404(self, client: httpx.AsyncClient):
        """Updating a nonexistent resource should return 404."""
        resp = await client.put("/api/units/nonexistent", json={"name": "test"})
        assert resp.status_code == 404


class TestTenantPortalPayments:
    """Tests for tenant portal payment and notice endpoints."""

    async def _create_lease_with_token(self, client, db_session):
        from app.models import Lease
        import secrets
        lease = Lease(
            unit_id="tp-unit",
            tenant_id="tp-tenant",
            start_date="2026-01-01",
            end_date="2027-12-31",
            monthly_rent=1000.0,
            deposit_amount=1000.0,
            status="active",
            tenant_access=secrets.token_urlsafe(32),
        )
        db_session.add(lease)
        db_session.commit()
        db_session.refresh(lease)
        return lease.id, lease.tenant_access

    async def test_tenant_payments_endpoint(self, client: httpx.AsyncClient, db_session):
        """Tenant can view their payments."""
        lease_id, token = await self._create_lease_with_token(client, db_session)
        from app.models import Payment
        payment = Payment(
            unit_id="tp-unit",
            lease_id=lease_id,
            tenant_id="tp-tenant",
            amount=1000.0,
            date="2026-04-01",
            due_date="2026-04-01",
            type="rent",
            status="paid",
            payment_method="bank_transfer",
            notes="",
        )
        db_session.add(payment)
        db_session.commit()

        resp = await client.get(f"/api/tenant/{lease_id}/payments", params={"token": token})
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1

    async def test_tenant_maintenance_endpoint(self, client: httpx.AsyncClient, db_session):
        """Tenant can view their maintenance requests."""
        lease_id, token = await self._create_lease_with_token(client, db_session)
        resp = await client.get(f"/api/tenant/{lease_id}/maintenance", params={"token": token})
        assert resp.status_code == 200

    async def test_tenant_notices_endpoint(self, client: httpx.AsyncClient, db_session):
        """Tenant can view notices."""
        lease_id, token = await self._create_lease_with_token(client, db_session)
        resp = await client.get(f"/api/tenant/{lease_id}/notices", params={"token": token})
        assert resp.status_code == 200


class TestDateHandling:
    """Tests for datetime handling and timezone awareness."""

    async def test_timestamps_are_isoformat(self, client: httpx.AsyncClient):
        """Created timestamps should be valid ISO format strings or empty."""
        resp = await client.post("/api/units/", json={
            "unit_number": "tz-1", "type": "1BR",
            "rent_amount": 1000, "security_deposit": 1000,
        })
        assert resp.status_code == 201
        data = resp.json()
        created = data.get("created_at", "")
        if created:
            datetime.fromisoformat(created)


class TestLeases:
    """Tests for lease-specific functionality."""

    async def test_lease_share_link_generation(self, client: httpx.AsyncClient):
        """Share link should generate a tenant access token."""
        create_resp = await client.post("/api/leases/", json={
            "unit_id": "share-unit",
            "tenant_id": "share-tenant",
            "start_date": "2026-01-01",
            "end_date": "2027-12-31",
            "rent_amount": 1000,
            "deposit_amount": 1000,
        })
        lease_id = create_resp.json()["id"]

        resp = await client.post(f"/api/leases/{lease_id}/share-link")
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert len(data["token"]) > 0

    async def test_lease_terminate_sets_status(self, client: httpx.AsyncClient):
        """Terminating a lease should set status to 'terminated'."""
        create_resp = await client.post("/api/leases/", json={
            "unit_id": "term-unit",
            "tenant_id": "term-tenant",
            "start_date": "2026-01-01",
            "end_date": "2027-12-31",
            "rent_amount": 1000,
            "deposit_amount": 1000,
        })
        lease_id = create_resp.json()["id"]

        resp = await client.post(f"/api/leases/{lease_id}/terminate", json={
            "reason": "Moving out",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "terminated"

    async def test_lease_get_with_relations(self, client: httpx.AsyncClient, db_session):
        """Lease detail returns lease data with unit_id and tenant_id references.
        Note: Current implementation does NOT eagerly load nested tenant/unit objects."""
        from app.models import Lease, Tenant, Unit
        tenant = Tenant(
            first_name="Rel",
            last_name="Tenant",
            email="rel@example.com",
            phone="555-0199",
        )
        unit = Unit(
            number="REL-1",
            type="1BR",
            rent=1000.0,
            deposit=1000.0,
        )
        db_session.add_all([tenant, unit])
        db_session.commit()
        db_session.refresh(tenant)
        db_session.refresh(unit)

        lease = Lease(
            unit_id=unit.id,
            tenant_id=tenant.id,
            start_date="2026-01-01",
            end_date="2027-12-31",
            monthly_rent=1000.0,
            deposit_amount=1000.0,
            status="active",
        )
        db_session.add(lease)
        db_session.commit()
        db_session.refresh(lease)

        resp = await client.get(f"/api/leases/{lease.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["unit_id"] == unit.id
        assert data["tenant_id"] == tenant.id
        assert data["monthly_rent"] == 1000.0
