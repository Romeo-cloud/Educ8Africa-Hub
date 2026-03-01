# app/routers/admin.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.schemas.course import (
    CourseCreateRequest,
    CourseUpdateRequest,
    CourseResponse,
    CourseListResponse,
)
from app.schemas.dashboard import AdminDashboardResponse
from app.schemas.user import UserResponse, AssignRoleRequest
from app.services.course_service import CourseService
from app.services.export_service import ExportService
from app.services.referral_service import ReferralService
from app.utils.dependencies import get_current_admin
from app.utils.referral_code import generate_referral_code
from app.models.user import User, UserRole
from app.models.payment import Payment, PaymentStatus
from app.models.registration import Registration, RegistrationStatus
from app.models.course import Course
from app.models.referral import Referral
from uuid import UUID
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ─── Course Management ─────────────────────────────────────────

@router.post("/courses", response_model=CourseResponse, status_code=201)
def create_course(
    request: CourseCreateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new course (Admin only)."""
    course = CourseService.create_course(db, request)
    return CourseResponse.model_validate(course)


@router.put("/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: UUID,
    request: CourseUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update an existing course (Admin only)."""
    course = CourseService.update_course(db, course_id, request)
    return CourseResponse.model_validate(course)


@router.get("/courses", response_model=CourseListResponse)
def admin_list_courses(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all courses including inactive (Admin only)."""
    courses = CourseService.get_all_courses(db, active_only=False)
    return CourseListResponse(
        courses=[CourseResponse.model_validate(c) for c in courses],
        total=len(courses),
    )


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: UUID,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Soft-delete (deactivate) a course (Admin only)."""
    CourseService.delete_course(db, course_id)
    return {"message": "Course deactivated successfully"}


# ─── User Management ───────────────────────────────────────────

@router.get("/users", response_model=list[UserResponse])
def list_users(
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all registered users, optionally filtered by role (Admin only)."""
    query = db.query(User).filter(User.role != UserRole.ADMIN)

    if role:
        query = query.filter(User.role == role)

    users = query.order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get a specific user's details (Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserResponse.model_validate(user)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def assign_role(
    user_id: UUID,
    request: AssignRoleRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot change an admin's role")

    # Promoting to Ambassador → generate referral code
    if request.role == UserRole.AMBASSADOR and user.role != UserRole.AMBASSADOR:
        referral_code = generate_referral_code(user.full_name)
        while db.query(User).filter(User.referral_code == referral_code).first():
            referral_code = generate_referral_code(user.full_name)
        user.referral_code = referral_code

    # Demoting from Ambassador → remove referral code
    elif request.role == UserRole.USER and user.role == UserRole.AMBASSADOR:
        user.referral_code = None
        user.referral_count = 0
        user.referral_earnings = 0.0

    # ✅ Just assign directly - no need for UserRole(request.role.value)
    user.role = request.role
    
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)

@router.get("/ambassadors", response_model=list[UserResponse])
def list_ambassadors(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all ambassadors with their referral codes (Admin only)."""
    ambassadors = (
        db.query(User)
        .filter(User.role == UserRole.AMBASSADOR)
        .order_by(User.created_at.desc())
        .all()
    )
    return [UserResponse.model_validate(u) for u in ambassadors]


# ─── Payments ───────────────────────────────────────────────────

class AdminPaymentResponse(BaseModel):
    id: UUID
    user: str
    course: str
    amount: float
    reference: str
    status: str
    date: datetime

    class Config:
        from_attributes = True

class AdminPaymentListResponse(BaseModel):
    payments: List[AdminPaymentResponse]
    total: int

@router.get("/payments", response_model=AdminPaymentListResponse)
def admin_list_payments(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all payments (Admin only)."""
    payments = (
        db.query(Payment)
        .order_by(Payment.created_at.desc())
        .all()
    )

    response_data = []
    for p in payments:
        user = db.query(User).filter(User.id == p.user_id).first()
        course = db.query(Course).filter(Course.id == p.course_id).first() if p.course_id else None
        
        status_str = p.status.value if hasattr(p.status, "value") else str(p.status)
        
        response_data.append(
            AdminPaymentResponse(
                id=p.id,
                user=user.full_name if user else "Unknown User",
                course=course.course_name if course else "Unlinked Payment",
                amount=p.amount,
                reference=p.reference,
                status=status_str,
                date=p.created_at
            )
        )

    return AdminPaymentListResponse(
        payments=response_data,
        total=len(response_data)
    )


# ─── Dashboard ──────────────────────────────────────────────────

@router.get("/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get admin dashboard statistics."""
    total_users = db.query(User).filter(User.role == UserRole.USER).count()
    total_ambassadors = db.query(User).filter(User.role == UserRole.AMBASSADOR).count()

    total_students = (
        db.query(Registration)
        .filter(Registration.status == RegistrationStatus.PAID)
        .distinct(Registration.user_id)
        .count()
    )

    total_revenue = (
        db.query(func.coalesce(func.sum(Payment.amount), 0.0))
        .filter(Payment.status == PaymentStatus.SUCCESS)
        .scalar()
    )

    total_referrals = db.query(Referral).count()
    total_courses = db.query(Course).count()

    # Course statistics
    courses = db.query(Course).all()
    course_stats = []
    for course in courses:
        enrolled = (
            db.query(Registration)
            .filter(
                Registration.course_id == course.id,
                Registration.status == RegistrationStatus.PAID,
            )
            .count()
        )
        revenue = (
            db.query(func.coalesce(func.sum(Payment.amount), 0.0))
            .filter(
                Payment.course_id == course.id,
                Payment.status == PaymentStatus.SUCCESS,
            )
            .scalar()
        )
        course_stats.append(
            {
                "course_id": str(course.id),
                "course_name": course.course_name,
                "amount": course.amount,
                "enrolled_students": enrolled,
                "revenue": float(revenue),
                "is_active": course.is_active,
            }
        )

    # Recent payments
    recent_payments_q = (
        db.query(Payment)
        .order_by(Payment.created_at.desc())
        .limit(10)
        .all()
    )
    recent_payments = []
    for p in recent_payments_q:
        user = db.query(User).filter(User.id == p.user_id).first()
        course = db.query(Course).filter(Course.id == p.course_id).first()
        recent_payments.append(
            {
                "payment_id": str(p.id),
                "student_name": user.full_name if user else "",
                "course_name": course.course_name if course else "",
                "amount": p.amount,
                "status": p.status.value if hasattr(p.status, "value") else str(p.status),
                "created_at": str(p.created_at),
            }
        )

    # Recent registrations
    recent_regs_q = (
        db.query(Registration)
        .order_by(Registration.created_at.desc())
        .limit(10)
        .all()
    )
    recent_registrations = []
    for r in recent_regs_q:
        user = db.query(User).filter(User.id == r.user_id).first()
        course = db.query(Course).filter(Course.id == r.course_id).first()
        recent_registrations.append(
            {
                "registration_id": str(r.id),
                "student_name": user.full_name if user else "",
                "course_name": course.course_name if course else "",
                "status": r.status.value if hasattr(r.status, "value") else str(r.status),
                "created_at": str(r.created_at),
            }
        )

    return AdminDashboardResponse(
        total_users=total_users,
        total_ambassadors=total_ambassadors,
        total_students=total_students,
        total_revenue=float(total_revenue),
        total_referrals=total_referrals,
        total_courses=total_courses,
        course_statistics=course_stats,
        recent_payments=recent_payments,
        recent_registrations=recent_registrations,
    )


# ─── Referrals ──────────────────────────────────────────────────

@router.get("/referrals")
def admin_list_referrals(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all referrals (Admin only)."""
    return ReferralService.get_all_referrals(db)


# ─── Exports ────────────────────────────────────────────────────

@router.get("/export/students")
def export_students(
    format: str = Query("csv", regex="^(csv|excel)$"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Export students data as CSV or Excel (Admin only)."""
    return ExportService.export_students(db, format)


@router.get("/export/payments")
def export_payments(
    format: str = Query("csv", regex="^(csv|excel)$"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Export payments data as CSV or Excel (Admin only)."""
    return ExportService.export_payments(db, format)


@router.get("/export/referrals")
def export_referrals(
    format: str = Query("csv", regex="^(csv|excel)$"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Export referrals data as CSV or Excel (Admin only)."""
    return ExportService.export_referrals(db, format)