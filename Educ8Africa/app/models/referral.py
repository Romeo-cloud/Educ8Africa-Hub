# app/models/referral.py
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referrer_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    referred_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    course_id = Column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False
    )
    commission = Column(Float, nullable=False, default=0.0)
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    referrer = relationship(
        "User", foreign_keys=[referrer_id], back_populates="referrals_made"
    )
    referred_user = relationship(
        "User", foreign_keys=[referred_user_id], back_populates="referred_by"
    )

    def __repr__(self):
        return (
            f"<Referral referrer={self.referrer_id} "
            f"referred={self.referred_user_id}>"
        )