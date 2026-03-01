# app/services/referral_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.referral import Referral
from app.models.user import User
from app.models.course import Course
from app.config import settings
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class ReferralService:
    """Handles referral tracking and commission calculations."""

    @staticmethod
    def process_referral(
        db: Session,
        referral_code: str,
        referred_user_id: UUID,
        course_id: UUID,
        course_amount: float,
    ) -> Referral | None:
        """
        Process a referral and create commission record.
        """
        if not referral_code:
            return None

        # 1. Find the Referrer (Case Insensitive)
        referrer = (
            db.query(User)
            .filter(func.lower(User.referral_code) == referral_code.lower())
            .first()
        )

        if not referrer:
            logger.warning(f"Referral code '{referral_code}' invalid or not found.")
            return None

        # 2. Prevent Self-Referral
        if referrer.id == referred_user_id:
            logger.warning(f"Self-referral attempt by {referred_user_id}")
            return None

        # 3. Check for Duplicate Commission (Same referrer, same user, same course)
        existing = (
            db.query(Referral)
            .filter(
                Referral.referrer_id == referrer.id,
                Referral.referred_user_id == referred_user_id,
                Referral.course_id == course_id,
            )
            .first()
        )
        if existing:
            return existing

        # 4. Calculate Commission
        try:
            # Default to 10% if missing in settings
            commission_percent = getattr(settings, 'REFERRAL_COMMISSION_PERCENT', 10.0)
            commission = (commission_percent / 100.0) * course_amount

            referral = Referral(
                referrer_id=referrer.id,
                referred_user_id=referred_user_id,
                course_id=course_id,
                commission=commission,
                is_paid=False,
            )

            db.add(referral)
            
            # 5. Update Ambassador Stats
            # Using getattr/setattr to be safe if columns don't exist yet, though they should.
            current_count = getattr(referrer, 'referral_count', 0) or 0
            current_earnings = getattr(referrer, 'referral_earnings', 0.0) or 0.0
            
            referrer.referral_count = current_count + 1
            referrer.referral_earnings = current_earnings + commission

            db.commit()
            db.refresh(referral)
            
            logger.info(f"Referral credited to {referrer.email}. Amount: {commission}")
            return referral

        except Exception as e:
            logger.error(f"Error creating referral: {str(e)}")
            db.rollback()
            return None

    @staticmethod
    def get_user_referrals(db: Session, user_id: UUID) -> dict:
        """Get referral summary for a user."""
        referrals = (
            db.query(Referral)
            .filter(Referral.referrer_id == user_id)
            .order_by(Referral.created_at.desc())
            .all()
        )

        total_commission = sum(r.commission for r in referrals)
        paid_commission = sum(r.commission for r in referrals if r.is_paid)
        unpaid_commission = total_commission - paid_commission

        referral_details = []
        for r in referrals:
            referred_user = db.query(User).filter(User.id == r.referred_user_id).first()
            course = db.query(Course).filter(Course.id == r.course_id).first()
            
            referral_details.append(
                {
                    "id": str(r.id),
                    "referrer_id": str(r.referrer_id),
                    "referred_user_id": str(r.referred_user_id),
                    "course_id": str(r.course_id),
                    "commission": float(r.commission),
                    "is_paid": r.is_paid,
                    "created_at": r.created_at,
                    "referred_user_name": referred_user.full_name if referred_user else "Deleted User",
                    "course_name": course.course_name if course else "Unknown Course",
                }
            )

        return {
            "total_referrals": len(referrals),
            "total_commission": float(total_commission),
            "paid_commission": float(paid_commission),
            "unpaid_commission": float(unpaid_commission),
            "referrals": referral_details,
        }

    @staticmethod
    def get_all_referrals(db: Session) -> list[dict]:
        """Get all referrals (admin)."""
        from app.config import settings
        
        referrals = db.query(Referral).order_by(Referral.created_at.desc()).all()
        result = []
        for r in referrals:
            referrer = db.query(User).filter(User.id == r.referrer_id).first()
            referred = db.query(User).filter(User.id == r.referred_user_id).first()
            course = db.query(Course).filter(Course.id == r.course_id).first()

            # Calculate commission percentage based on course amount
            commission_percent = getattr(settings, 'REFERRAL_COMMISSION_PERCENT', 10.0)
            course_amount = float(course.amount) if course else 0
            calculated_percent = (r.commission / course_amount * 100) if course_amount > 0 else commission_percent

            result.append(
                {
                    "id": str(r.id),
                    "referrer_name": referrer.full_name if referrer else "Unknown",
                    "referrer_email": referrer.email if referrer else "Unknown",
                    "referred_user_name": referred.full_name if referred else "Unknown",
                    "referred_user_email": referred.email if referred else "Unknown",
                    "course_name": course.course_name if course else "Unknown",
                    "course_amount": course_amount,
                    "commission": float(r.commission),
                    "commission_percent": round(calculated_percent, 2),
                    "is_paid": r.is_paid,
                    "created_at": str(r.created_at),
                }
            )
        return result
