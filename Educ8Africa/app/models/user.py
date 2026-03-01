# app/models/user.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum as SAEnum, Boolean, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    USER = "user"
    AMBASSADOR = "ambassador"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Only ambassadors get a referral code — NULL for normal users
    referral_code = Column(String(20), unique=True, nullable=True, index=True)

    role = Column(
    SAEnum(UserRole, values_callable=lambda x: [e.value for e in x]),
    default=UserRole.USER,
    nullable=False,
    )
    is_active = Column(Boolean, default=True)

    # Ambassador stats
    referral_count = Column(Integer, default=0)
    referral_earnings = Column(Float, default=0.0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    registrations = relationship("Registration", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    student_profile = relationship(
        "StudentProfile", back_populates="user", uselist=False
    )
    referrals_made = relationship(
        "Referral",
        foreign_keys="Referral.referrer_id",
        back_populates="referrer",
    )
    referred_by = relationship(
        "Referral",
        foreign_keys="Referral.referred_user_id",
        back_populates="referred_user",
        uselist=False,
    )

    def __repr__(self):
        return f"<User {self.email} role={self.role.value}>"