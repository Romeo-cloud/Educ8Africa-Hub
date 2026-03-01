# app/schemas/referral.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class ReferralResponse(BaseModel):
    id: UUID
    referrer_id: UUID
    referred_user_id: UUID
    course_id: UUID
    commission: float
    is_paid: bool
    created_at: datetime
    referred_user_name: Optional[str] = None
    course_name: Optional[str] = None

    class Config:
        from_attributes = True


class ReferralSummary(BaseModel):
    total_referrals: int
    total_commission: float
    paid_commission: float
    unpaid_commission: float
    referrals: list[ReferralResponse]