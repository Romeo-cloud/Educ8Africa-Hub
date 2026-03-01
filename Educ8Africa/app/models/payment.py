# app/models/payment.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    ABANDONED = "abandoned"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    course_id = Column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False, index=True
    )
    amount = Column(Float, nullable=False)
    reference = Column(String(100), unique=True, nullable=False, index=True)
    paystack_reference = Column(String(100), nullable=True)
    authorization_url = Column(String(500), nullable=True)
    status = Column(
        SAEnum(PaymentStatus),
        default=PaymentStatus.PENDING,
        nullable=False,
    )
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="payments")
    course = relationship("Course", back_populates="payments")

    def __repr__(self):
        return f"<Payment ref={self.reference} status={self.status}>"