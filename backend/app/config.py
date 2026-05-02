import os
import warnings
from pathlib import Path
from typing import List

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

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

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )

    @property
    def environment(self) -> str:
        return os.environ.get("ENVIRONMENT", "development")

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @model_validator(mode="after")
    def check_jwt_secret(self):
        """Validate JWT secret - error in production, warning in dev."""
        jwt_secret_env = os.environ.get("SECRET_KEY")
        is_default = jwt_secret_env is None and self.jwt_secret == _DEFAULT_JWT_SECRET
        env = os.environ.get("ENVIRONMENT", "development")
        
        if env == "production":
            if is_default:
                raise RuntimeError(
                    "Production requires non-default JWT secret. "
                    "Set SECRET_KEY environment variable. "
                    "Generate with: openssl rand -base64 32"
                )
        elif is_default:
            warnings.warn(
                "Using default JWT secret. Set SECRET_KEY for production security.",
                RuntimeWarning,
                stacklevel=2,
            )
        return self


settings = Settings()
