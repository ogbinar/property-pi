from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    pocketbase_url: str = "http://localhost:8090"
    pocketbase_admin_token: str = ""
    fastapi_port: int = 8000

    class Config:
        env_file = ".env"
        env_prefix = "BACKEND_"


settings = Settings()
