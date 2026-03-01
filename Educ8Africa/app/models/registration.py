# app/models/registration.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Date
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class RegistrationStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    course_id = Column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False, index=True
    )
    status = Column(
        SAEnum(RegistrationStatus),
        default=RegistrationStatus.PENDING,
        nullable=False,
    )
    referrer_name = Column(String(255), nullable=True)
    referral_code_used = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="registrations")
    course = relationship("Course", back_populates="registrations")

    def __repr__(self):
        return f"<Registration user={self.user_id} course={self.course_id}>"


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Personal information
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)

    # Academic information
    highest_education = Column(String(100), nullable=True)
    institution = Column(String(255), nullable=True)
    graduation_year = Column(String(4), nullable=True)

    # Guardian information
    guardian_name = Column(String(255), nullable=True)
    guardian_phone = Column(String(20), nullable=True)
    guardian_email = Column(String(255), nullable=True)
    guardian_relationship = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="student_profile")

    def __repr__(self):
        return f"<StudentProfile user={self.user_id}>"