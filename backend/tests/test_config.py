"""Unit tests for app/config.py Settings class."""

import os
import pytest
import warnings

from app.config import Settings, _DEFAULT_JWT_SECRET


class TestSettings:
    def test_default_db_url(self):
        s = Settings()
        assert "sqlite" in s.db_url

    def test_custom_db_url_from_env(self):
        s = Settings(DATABASE_URL="postgresql://localhost/testdb")
        assert s.db_url == "postgresql://localhost/testdb"

    def test_default_jwt_secret(self):
        # When no env var is set, uses the default
        old_env = os.environ.pop("SECRET_KEY", None)
        old_env2 = os.environ.pop("JWT_SECRET", None)
        try:
            s = Settings()
            assert s.jwt_secret == _DEFAULT_JWT_SECRET
        finally:
            if old_env:
                os.environ["SECRET_KEY"] = old_env
            if old_env2:
                os.environ["JWT_SECRET"] = old_env2

    def test_custom_jwt_secret_from_env(self):
        old_secret = os.environ.get("SECRET_KEY")
        try:
            os.environ["SECRET_KEY"] = "custom-secret-key-123"
            s = Settings()
            assert s.jwt_secret == "custom-secret-key-123"
        finally:
            if old_secret:
                os.environ["SECRET_KEY"] = old_secret
            else:
                os.environ.pop("SECRET_KEY", None)

    def test_jwt_algorithm(self):
        s = Settings()
        assert s.jwt_algorithm == "HS256"

    def test_default_access_token_expire_minutes(self):
        s = Settings()
        assert s.access_token_expire_minutes == 120

    def test_custom_access_token_expire_minutes(self):
        s = Settings(ACCESS_TOKEN_EXPIRE_MINUTES=60)
        assert s.access_token_expire_minutes == 60

    def test_default_fastapi_port(self):
        s = Settings()
        assert s.fastapi_port == 8000

    def test_default_allowed_origins(self):
        s = Settings()
        assert s.allowed_origins == "http://localhost:3000,http://localhost:5173"

    def test_custom_allowed_origins(self):
        s = Settings(ALLOWED_ORIGINS="http://localhost:5173,http://example.com")
        assert s.allowed_origins == "http://localhost:5173,http://example.com"

    def test_origins_list_single(self):
        s = Settings()
        assert s.origins_list == ["http://localhost:3000", "http://localhost:5173"]

    def test_origins_list_multiple(self):
        s = Settings(ALLOWED_ORIGINS="http://localhost:3000, http://example.com , http://test.com")
        assert s.origins_list == ["http://localhost:3000", "http://example.com", "http://test.com"]

    def test_origins_list_filters_empty(self):
        s = Settings(ALLOWED_ORIGINS="http://localhost:3000, , http://example.com")
        assert s.origins_list == ["http://localhost:3000", "http://example.com"]

    def test_jwt_secret_warning_fires(self):
        old_env = os.environ.pop("SECRET_KEY", None)
        old_env2 = os.environ.pop("JWT_SECRET", None)
        try:
            with warnings.catch_warnings(record=True) as w:
                warnings.simplefilter("always")
                Settings()
                assert len(w) == 1
                assert issubclass(w[0].category, RuntimeWarning)
                assert "jwt" in str(w[0].message).lower() and "default" in str(w[0].message).lower()
        finally:
            if old_env:
                os.environ["SECRET_KEY"] = old_env
            if old_env2:
                os.environ["JWT_SECRET"] = old_env2

    def test_jwt_secret_suppressed_when_env_set(self):
        old_env = os.environ.get("SECRET_KEY")
        try:
            os.environ["SECRET_KEY"] = "custom-key"
            with warnings.catch_warnings(record=True) as w:
                warnings.simplefilter("always")
                Settings()
                jwt_warnings = [x for x in w if "jwt" in str(x.message).lower()]
                assert len(jwt_warnings) == 0
        finally:
            if old_env:
                os.environ["SECRET_KEY"] = old_env
            else:
                os.environ.pop("SECRET_KEY", None)
