# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Get the database URL from settings (handles Render URL conversion)
DATABASE_URL = settings.database_url

# Determine if we're in production (Render)
is_production = settings.ENVIRONMENT == "production"

# Create engine with appropriate settings for production
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_size": 10,
    "max_overflow": 20,
}

# Add SSL support for production (Render requires SSL)
if is_production:
    engine_kwargs["connect_args"] = {
        "sslmode": "require"
    }

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
