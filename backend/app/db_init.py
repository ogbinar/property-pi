from app.database import engine, Base
from app.models import *  # noqa: F401,F403 — ensures all models are registered


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
