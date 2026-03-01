# app/routers/referral.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.referral import ReferralSummary
from app.services.referral_service import ReferralService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/referrals", tags=["Referrals"])


@router.get("", response_model=ReferralSummary)
def get_my_referrals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the current user's referral summary including:
    - Total referrals count
    - Total, paid, and unpaid commission
    - List of all referrals
    """
    data = ReferralService.get_user_referrals(db, current_user.id)
    return ReferralSummary(**data)
