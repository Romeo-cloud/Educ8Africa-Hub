# app/routers/registration.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.registration import (
    CourseSelectRequest,
    StudentProfileRequest,
    RegistrationResponse,
    StudentProfileResponse,
)
from app.services.registration_service import RegistrationService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api", tags=["Registration"]
)


@router.post(
    "/course/select",
    response_model=RegistrationResponse,
    status_code=201,
)
def select_course(
    request: CourseSelectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Register for a course.

    - Select a course to register for
    - Optionally provide referral code and referrer name
    - Validates referral code and prevents self-referral
    - Prevents duplicate registrations
    """
    registration = RegistrationService.select_course(db, current_user, request)
    return RegistrationResponse.model_validate(registration)


@router.post(
    "/student/profile",
    response_model=StudentProfileResponse,
)
def create_or_update_profile(
    request: StudentProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create or update student profile with detailed information.

    - Personal information
    - Academic information
    - Guardian information
    """
    profile = RegistrationService.create_or_update_profile(
        db, current_user, request
    )
    return StudentProfileResponse.model_validate(profile)


@router.get("/student/profile", response_model=StudentProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current student's profile."""
    from app.models.registration import StudentProfile
    from fastapi import HTTPException, status

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create your profile first.",
        )
    return StudentProfileResponse.model_validate(profile)


@router.get(
    "/registrations",
    response_model=list[RegistrationResponse],
)
def get_my_registrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all registrations for the current user."""
    registrations = RegistrationService.get_user_registrations(
        db, current_user.id
    )
    return [RegistrationResponse.model_validate(r) for r in registrations]