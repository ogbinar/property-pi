"""Unit tests for app/auth.py functions."""

import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt as jose_jwt

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    get_current_user_from_token,
)
from app.config import settings


class TestHashPassword:
    def test_hash_returns_string(self):
        result = hash_password("mysecret")
        assert isinstance(result, str)
        assert len(result) > 20

    def test_hash_is_unique_per_call(self):
        h1 = hash_password("same_password")
        h2 = hash_password("same_password")
        assert h1 != h2

    def test_verify_password_correct(self):
        hashed = hash_password("correct_password")
        assert verify_password("correct_password", hashed) is True

    def test_verify_password_wrong(self):
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_verify_password_empty(self):
        hashed = hash_password("not_empty")
        assert verify_password("", hashed) is False


class TestCreateAccessToken:
    def test_token_is_string(self):
        token = create_access_token({"sub": "user-1", "email": "u@x.com"})
        assert isinstance(token, str)

    def test_token_decodes_correctly(self):
        token = create_access_token({"sub": "user-1", "email": "u@x.com", "name": "User"})
        payload = jose_jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        assert payload["sub"] == "user-1"
        assert payload["email"] == "u@x.com"
        assert payload["name"] == "User"

    def test_token_has_exp_and_iat(self):
        token = create_access_token({"sub": "user-1"})
        payload = jose_jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        assert "exp" in payload
        assert "iat" in payload

    def test_token_expires_within_expected_range(self):
        token = create_access_token({"sub": "user-1"})
        payload = jose_jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        iat = datetime.fromtimestamp(payload["iat"], tz=timezone.utc)
        delta = exp - iat
        assert delta.total_seconds() == pytest.approx(
            settings.access_token_expire_minutes * 60, abs=5
        )

    def test_custom_expires_delta(self):
        token = create_access_token({"sub": "user-1"}, expires_delta=timedelta(hours=1))
        payload = jose_jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        iat = datetime.fromtimestamp(payload["iat"], tz=timezone.utc)
        delta = exp - iat
        assert delta.total_seconds() == pytest.approx(3600, abs=5)


class TestDecodeAccessToken:
    def test_valid_token(self):
        token = create_access_token({"sub": "user-1", "email": "u@x.com"})
        payload = decode_access_token(token)
        assert payload["sub"] == "user-1"

    def test_invalid_token_raises_401(self):
        with pytest.raises(Exception) as exc_info:
            decode_access_token("invalid.token.here")
        assert exc_info.value.status_code == 401

    def test_empty_token_raises_401(self):
        with pytest.raises(Exception) as exc_info:
            decode_access_token("")
        assert exc_info.value.status_code == 401

    def test_tampered_token_raises_401(self):
        token = create_access_token({"sub": "user-1"})
        parts = token.split(".")
        tampered = parts[0] + "." + parts[1] + ".tampered_signature"
        with pytest.raises(Exception) as exc_info:
            decode_access_token(tampered)
        assert exc_info.value.status_code == 401

    def test_token_missing_sub_decodes_successfully(self):
        # decode_access_token just decodes — it doesn't check for sub
        to_encode = {"email": "u@x.com", "name": "User"}
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)
        to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
        token = jose_jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        payload = decode_access_token(token)
        assert payload["email"] == "u@x.com"
        assert payload.get("sub") is None


class TestGetCurrentUserFromToken:
    def test_valid_token_returns_user(self):
        token = create_access_token({"sub": "user-1", "email": "u@x.com", "name": "User"})
        user = get_current_user_from_token(token)
        assert user["id"] == "user-1"
        assert user["email"] == "u@x.com"
        assert user["name"] == "User"

    def test_invalid_token_raises_401(self):
        with pytest.raises(Exception) as exc_info:
            get_current_user_from_token("invalid.token.here")
        assert exc_info.value.status_code == 401

    def test_token_missing_sub_raises_401(self):
        to_encode = {"email": "u@x.com"}
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)
        to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
        token = jose_jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        with pytest.raises(Exception) as exc_info:
            get_current_user_from_token(token)
        assert exc_info.value.status_code == 401
