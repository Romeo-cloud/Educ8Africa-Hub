# app/config.py
from pydantic_settings import BaseSettings
from typing import Optional


def get_database_url(url: str) -> str:
    """
    Convert Render's PostgreSQL URL to SQLAlchemy compatible format.
    Render provides: postgres://user:pass@host:port/db
    SQLAlchemy needs: postgresql+psycopg2://user:pass@host:port/db
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    return url


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DATABASE_URL_RENDER: Optional[str] = None  # For Render's internal PostgreSQL

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Paystack
    PAYSTACK_SECRET_KEY: str
    PAYSTACK_PUBLIC_KEY: str = ""
    PAYSTACK_BASE_URL: str = "https://api.paystack.co"

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    EMAIL_FROM_NAME: str = "Training Platform"

    # App
    APP_NAME: str = "Training Registration System"
    APP_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Production settings
    ENVIRONMENT: str = "development"  # "production" or "development"

    # Referral
    REFERRAL_COMMISSION_PERCENT: float = 10.0

    # Admin seed
    ADMIN_EMAIL: str = "admin@training.com"
    ADMIN_PASSWORD: str = "Admin@123456"
    ADMIN_FULL_NAME: str = "System Administrator"

    @property
    def database_url(self) -> str:
        """Get the database URL, using Render's if available."""
        # Use Render's internal database URL if set (for production)
        if self.DATABASE_URL_RENDER:
            return get_database_url(self.DATABASE_URL_RENDER)
        # Otherwise use the regular DATABASE_URL
        return get_database_url(self.DATABASE_URL)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
