"""Unit tests for app/errors.py functions."""

import pytest
from fastapi import HTTPException

from app.errors import not_found, bad_request, unauthorized, conflict, find_or_404
from app.models import Unit


class TestErrorBuilders:
    def test_not_found_with_id(self):
        result = not_found("Unit", "unit-123")
        assert result == {"error": "not_found", "detail": "Unit not found: unit-123"}

    def test_not_found_without_id(self):
        result = not_found("Tenant")
        assert result == {"error": "not_found", "detail": "Tenant not found"}

    def test_bad_request(self):
        result = bad_request("Invalid email format")
        assert result == {"error": "bad_request", "detail": "Invalid email format"}

    def test_unauthorized_default(self):
        result = unauthorized()
        assert result == {"error": "unauthorized", "detail": "Not authenticated"}

    def test_unauthorized_custom(self):
        result = unauthorized("Session expired")
        assert result == {"error": "unauthorized", "detail": "Session expired"}

    def test_conflict(self):
        result = conflict("Email already registered")
        assert result == {"error": "conflict", "detail": "Email already registered"}


class TestFindOr404:
    @pytest.fixture
    def unit_db_session(self, setup_tables):
        """Provides a standalone db session for error unit tests."""
        import sys
        from pathlib import Path
        sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from app.database import Base
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        yield db
        db.close()
        Base.metadata.drop_all(bind=engine)

    def test_find_existing(self, unit_db_session):
        unit = Unit(
            id="find-or-404-test",
            number="999",
            type="1BR",
            rent=1000,
            deposit=1000,
            status="vacant",
        )
        unit_db_session.add(unit)
        unit_db_session.commit()

        result = find_or_404(unit_db_session, Unit, "find-or-404-test", "Unit")
        assert result.id == "find-or-404-test"

    def test_find_missing_raises_404(self, unit_db_session):
        with pytest.raises(HTTPException) as exc_info:
            find_or_404(unit_db_session, Unit, "nonexistent-id", "Unit")
        assert exc_info.value.status_code == 404
        assert "nonexistent-id" in str(exc_info.value.detail)
