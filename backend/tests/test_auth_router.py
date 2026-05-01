"""Integration tests for auth router endpoints."""

import pytest
import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.auth import create_access_token, hash_password
from app.database import Base, get_db
from app import models


# Create a separate in-memory DB for auth router tests
_auth_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_auth_engine)
AuthSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_auth_engine)


@pytest.fixture
def _auth_db():
    """Seed the auth test DB with a user matching the conftest admin_token."""
    db = AuthSessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.id == "test-admin-id").first()
        if not existing:
            user = models.User(
                id="test-admin-id",
                name="Admin",
                email="admin@example.com",
                password_hash=hash_password("testpass123"),
                role="landlord",
            )
            db.add(user)
            db.commit()
    finally:
        db.close()


def _override_get_db():
    def gen():
        db = AuthSessionLocal()
        try:
            yield db
        finally:
            db.close()
    return gen


class TestAuthMe:
    async def test_me_with_bearer_token(self, client: httpx.AsyncClient, _auth_db):
        app.dependency_overrides[get_db] = _override_get_db()
        try:
            resp = await client.get("/api/auth/me")
            assert resp.status_code == 200
            data = resp.json()
            assert data["email"] == "admin@example.com"
            assert data["id"] == "test-admin-id"
        finally:
            app.dependency_overrides.clear()

    async def test_me_with_query_param_token(self, client: httpx.AsyncClient, _auth_db):
        app.dependency_overrides[get_db] = _override_get_db()
        try:
            token = create_access_token({"sub": "test-admin-id", "email": "admin@example.com", "name": "Admin"})
            resp = await client.get(f"/api/auth/me?token={token}")
            assert resp.status_code == 200
            data = resp.json()
            assert data["email"] == "admin@example.com"
        finally:
            app.dependency_overrides.clear()

    async def test_me_with_invalid_query_param_token(self):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
            resp = await c.get("/api/auth/me?token=invalid.token.here")
            assert resp.status_code == 401

    async def test_me_no_auth(self):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
            resp = await c.get("/api/auth/me")
            assert resp.status_code == 401

    async def test_me_with_unknown_user_token(self):
        """Token with valid sub but no corresponding user in DB."""
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
            token = create_access_token({"sub": "nonexistent-user", "email": "unknown@example.com", "name": "Unknown"})
            resp = await c.get(f"/api/auth/me?token={token}")
            assert resp.status_code == 404
