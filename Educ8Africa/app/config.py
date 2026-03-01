# app/config.py
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

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

    # Referral
    REFERRAL_COMMISSION_PERCENT: float = 10.0

    # Admin seed
    ADMIN_EMAIL: str = "admin@training.com"
    ADMIN_PASSWORD: str = "Admin@123456"
    ADMIN_FULL_NAME: str = "System Administrator"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()