# app/models/course.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Float, nullable=False)
    welcome_note = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    registrations = relationship("Registration", back_populates="course")
    payments = relationship("Payment", back_populates="course")

    def __repr__(self):
        return f"<Course {self.course_name}>"