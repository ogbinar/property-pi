import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.auth import hash_password, create_access_token


TEST_DB = "sqlite:///./tests_test.db"
engine = create_engine(TEST_DB, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Yields a test DB session and overrides get_db for the HTTP client."""
    db = TestingSessionLocal()
    try:
        def override_get_db():
            yield db
        app.dependency_overrides[get_db] = override_get_db
        yield db
    finally:
        db.close()
        app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def admin_token():
    return create_access_token({"sub": "test-admin-id", "email": "admin@example.com", "name": "Admin"})


@pytest.fixture
def tenant_token():
    return create_access_token({"sub": "test-tenant-id", "email": "tenant@example.com", "name": "Tenant"})


@pytest.fixture
async def client(admin_token, db_session):
    transport = ASGITransport(app=app)
    ac = AsyncClient(transport=transport, base_url="http://test")
    ac.headers.update({"Authorization": f"Bearer {admin_token}"})
    try:
        yield ac
    finally:
        await ac.aclose()
