import httpx
import pytest

from app import main as main_module
from app.auth import hash_password
from app.main import app
from app.models import User


def _seed_admin(db, email="admin@propertypi.com", password="admin123"):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return existing

    admin = User(
        name="Admin",
        email=email,
        password_hash=hash_password(password),
        role="landlord",
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.mark.asyncio
async def test_vertical_admin_login_and_me(db_session):
    _seed_admin(db_session)

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        login = await client.post(
            "/auth/login",
            json={"email": "admin@propertypi.com", "password": "admin123"},
        )
        assert login.status_code == 200
        token = login.json()["access_token"]

        client.headers.update({"Authorization": f"Bearer {token}"})
        me = await client.get("/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == "admin@propertypi.com"


@pytest.mark.asyncio
async def test_vertical_property_lifecycle(db_session):
    _seed_admin(db_session)

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        login = await client.post(
            "/auth/login",
            json={"email": "admin@propertypi.com", "password": "admin123"},
        )
        token = login.json()["access_token"]
        client.headers.update({"Authorization": f"Bearer {token}"})

        unit = await client.post(
            "/api/units/",
            json={
                "unit_number": "E2E-101",
                "type": "1BR",
                "rent_amount": 1200,
                "security_deposit": 1200,
                "name": "Unit E2E 101",
                "floor": 1,
                "area": 650,
            },
        )
        assert unit.status_code == 201
        unit_id = unit.json()["id"]

        tenant = await client.post(
            "/api/tenants/",
            json={
                "first_name": "Eve",
                "last_name": "Tenant",
                "email": "eve@example.com",
                "phone": "555-0101",
            },
        )
        assert tenant.status_code == 201
        tenant_id = tenant.json()["id"]

        lease = await client.post(
            "/api/leases/",
            json={
                "unit_id": unit_id,
                "tenant_id": tenant_id,
                "start_date": "2026-05-08",
                "end_date": "2027-05-08",
                "rent_amount": 1200,
            },
        )
        assert lease.status_code == 201
        lease_id = lease.json()["id"]

        await client.put(f"/api/units/{unit_id}", json={"status": "occupied"})

        payment = await client.post(
            "/api/payments/",
            json={
                "unit_id": unit_id,
                "amount": 1200,
                "date": "2026-05-08",
                "due_date": "2026-05-08",
                "payment_method": "bank_transfer",
            },
        )
        assert payment.status_code == 201
        payment_id = payment.json()["id"]

        paid = await client.post(f"/api/payments/{payment_id}/mark-paid")
        assert paid.status_code == 200
        assert paid.json()["status"] == "paid"

        expense = await client.post(
            "/api/expenses/",
            json={
                "amount": 150,
                "category": "Maintenance",
                "description": "Fix leak",
                "date": "2026-05-08",
            },
        )
        assert expense.status_code == 201

        dashboard = await client.get("/api/dashboard")
        assert dashboard.status_code == 200
        data = dashboard.json()
        assert data["unit_counts"]["total"] == 1
        assert data["unit_counts"]["occupied"] == 1
        assert data["monthly_revenue"]["expected"] == 1200
        assert data["monthly_revenue"]["collected"] == 1200
        assert data["expenses"]["total"] == 150

        terminated = await client.post(f"/api/leases/{lease_id}/terminate")
        assert terminated.status_code == 200
        assert terminated.json()["status"] == "terminated"

        unit_after = await client.get(f"/api/units/{unit_id}")
        assert unit_after.status_code == 200
        assert unit_after.json()["status"] == "occupied"


@pytest.mark.asyncio
async def test_vertical_spa_fallback_and_blocked_paths(tmp_path, monkeypatch, db_session):
    frontend_dist = tmp_path / "frontend-dist"
    assets_dir = frontend_dist / "assets"
    assets_dir.mkdir(parents=True)
    (frontend_dist / "index.html").write_text("<html><body>Property Pi</body></html>")
    (assets_dir / "app.js").write_text("console.log('ok');")

    monkeypatch.setattr(main_module, "FRONTEND_DIST_DIR", frontend_dist)
    monkeypatch.setattr(main_module, "FRONTEND_INDEX", frontend_dist / "index.html")

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        root = await client.get("/")
        assert root.status_code == 200
        assert "Property Pi" in root.text

        login = await client.get("/login")
        assert login.status_code == 200
        assert "Property Pi" in login.text

        asset = await client.get("/assets/app.js")
        assert asset.status_code == 200
        assert "console.log" in asset.text

        blocked = await client.get("/api/made-up")
        assert blocked.status_code == 404
        assert blocked.json()["detail"] == "Not Found"

        api_health = await client.get("/api/health")
        assert api_health.status_code == 200


@pytest.mark.asyncio
async def test_vertical_stale_proxy_paths_are_normalized(tmp_path, monkeypatch, db_session):
    _seed_admin(db_session)

    frontend_dist = tmp_path / "frontend-dist"
    frontend_dist.mkdir(parents=True)
    (frontend_dist / "index.html").write_text("<html><body>Property Pi</body></html>")
    monkeypatch.setattr(main_module, "FRONTEND_DIST_DIR", frontend_dist)
    monkeypatch.setattr(main_module, "FRONTEND_INDEX", frontend_dist / "index.html")

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        api_health = await client.get("/api/api/health")
        assert api_health.status_code == 200

        legacy_health = await client.get("/health/health")
        assert legacy_health.status_code == 200

        login = await client.post(
            "/auth/auth/login",
            json={"email": "admin@propertypi.com", "password": "admin123"},
        )
        assert login.status_code == 200

        api_login = await client.post(
            "/api/api/auth/login",
            json={"email": "admin@propertypi.com", "password": "admin123"},
        )
        assert api_login.status_code == 200

        page = await client.get("/login/login")
        assert page.status_code == 200
        assert "Property Pi" in page.text
