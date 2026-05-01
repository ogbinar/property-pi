import os
import warnings
from pathlib import Path
from typing import List

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

_DEFAULT_JWT_SECRET = "property-pi-jwt-secret-change-in-production"


def _default_db_url() -> str:
    """Resolve database path relative to project root."""
    project_db = PROJECT_ROOT / "property_pi.db"
    if project_db.exists() and project_db.stat().st_size > 0:
        return f"sqlite:///{project_db}"
    backend_db = Path(__file__).resolve().parent.parent / "property_pi.db"
    if backend_db.exists():
        return f"sqlite:///{backend_db}"
    return f"sqlite:///{project_db}"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    db_url: str = Field(
        default=_default_db_url(),
        alias="DATABASE_URL",
    )
    jwt_secret: str = Field(
        default=_DEFAULT_JWT_SECRET,
        alias="SECRET_KEY",
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=120, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    fastapi_port: int = 8000
    allowed_origins: str = Field(default="http://localhost:3000,http://localhost:5173", alias="ALLOWED_ORIGINS")

    model_config = {"env_file": ".env", "extra": "ignore", "populate_by_name": True}

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @model_validator(mode="after")
    def check_jwt_secret(self):
        """Warn if JWT secret is still the default (not overridden by env)."""
        jwt_secret_env = os.environ.get("JWT_SECRET") or os.environ.get("SECRET_KEY")
        if jwt_secret_env is None and self.jwt_secret == _DEFAULT_JWT_SECRET:
            warnings.warn(
                "Using default JWT secret. Set JWT_SECRET or SECRET_KEY env var for production security.",
                RuntimeWarning,
                stacklevel=2,
            )
        return self


settings = Settings()
