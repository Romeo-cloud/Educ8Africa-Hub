# app/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dashboard import UserDashboardResponse, CourseInfo, PaymentInfo
from app.schemas.referral import ReferralSummary
from app.models.user import User
from app.models.registration import Registration, RegistrationStatus
from app.models.payment import Payment, PaymentStatus
from app.models.course import Course
from app.services.referral_service import ReferralService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=UserDashboardResponse)
def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get user dashboard data with enriched statistics.

    - User profile info (id, name, email, phone, role)
    - Registered courses with status (paid/pending)
    - Payment history with status
    - Statistics: total enrolled, paid count, pending count, total paid
    - Referral code, count, and earnings
    - Welcome notes from paid courses
    """
    # Get registered courses
    registrations = (
        db.query(Registration)
        .filter(Registration.user_id == current_user.id)
        .all()
    )

    registered_courses = []
    paid_courses_count = 0
    pending_courses_count = 0
    total_paid = 0.0
    welcome_notes = []

    for reg in registrations:
        course = db.query(Course).filter(Course.id == reg.course_id).first()
        if course:
            status_value = reg.status.value if hasattr(reg.status, "value") else str(reg.status)
            
            registered_courses.append(
                CourseInfo(
                    registration_id=str(reg.id),
                    course_id=str(course.id),
                    course_name=course.course_name,
                    amount=course.amount,
                    status=status_value,
                    registered_at=str(reg.created_at),
                )
            )
            
            # Count statistics
            if reg.status == RegistrationStatus.PAID:
                paid_courses_count += 1
                total_paid += course.amount
                if course.welcome_note:
                    welcome_notes.append(
                        {
                            "course_name": course.course_name,
                            "welcome_note": course.welcome_note,
                        }
                    )
            elif reg.status == RegistrationStatus.PENDING:
                pending_courses_count += 1

    # Get payment history
    payments = (
        db.query(Payment)
        .filter(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .all()
    )

    payment_history = []
    for p in payments:
        course = db.query(Course).filter(Course.id == p.course_id).first()
        status_value = p.status.value if hasattr(p.status, "value") else str(p.status)
        
        payment_history.append(
            PaymentInfo(
                payment_id=str(p.id),
                course_name=course.course_name if course else "",
                amount=p.amount,
                reference=p.reference,
                status=status_value,
                paid_at=str(p.paid_at) if p.paid_at else None,
            )
        )

    # Get referral info
    referral_data = ReferralService.get_user_referrals(db, current_user.id)

    return UserDashboardResponse(
        user_id=str(current_user.id),
        user_name=current_user.full_name,
        email=current_user.email,
        phone_number=current_user.phone_number,
        role=current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
        referral_code=current_user.referral_code,
        total_courses_enrolled=len(registrations),
        paid_courses_count=paid_courses_count,
        pending_courses_count=pending_courses_count,
        total_paid=total_paid,
        registered_courses=registered_courses,
        payment_history=payment_history,
        referral_count=referral_data["total_referrals"],
        referral_earnings=referral_data["total_commission"],
        welcome_notes=welcome_notes,
    )


@router.get("/referrals", response_model=ReferralSummary)
def get_referral_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed referral summary for the current user."""
    data = ReferralService.get_user_referrals(db, current_user.id)
    return ReferralSummary(**data)
