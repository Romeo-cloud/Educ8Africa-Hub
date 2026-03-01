# app/services/registration_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.registration import Registration, RegistrationStatus, StudentProfile
from app.models.course import Course
from app.models.user import User
from app.schemas.registration import CourseSelectRequest, StudentProfileRequest
from uuid import UUID
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class RegistrationService:
    @staticmethod
    def select_course(
        db: Session, user: User, request: CourseSelectRequest
    ) -> Registration:
        """
        Register a user for a course.
        Saves 'referral_code' from request into 'referral_code_used' column.
        """
        # 1. Check if course exists
        course = db.query(Course).filter(Course.id == request.course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

        # 2. Check for existing active registration (PENDING or PAID)
        existing_reg = (
            db.query(Registration)
            .filter(
                Registration.user_id == user.id,
                Registration.course_id == request.course_id,
                Registration.status.in_([RegistrationStatus.PENDING, RegistrationStatus.PAID])
            )
            .first()
        )

        # If pending, update the referral code if a new one is provided
        if existing_reg:
            if existing_reg.status == RegistrationStatus.PENDING and request.referral_code:
                # Validate code logic could go here
                existing_reg.referral_code_used = request.referral_code
                existing_reg.referrer_name = request.referrer_name
                db.commit()
                db.refresh(existing_reg)
            return existing_reg

        # 3. Validate Referral Code (Optional Logic)
        valid_referral_code = None
        if request.referral_code:
            # Case-insensitive check to see if code exists
            referrer = (
                db.query(User)
                .filter(User.referral_code == request.referral_code)
                .first()
            )
            
            if referrer:
                if referrer.id == user.id:
                    logger.warning(f"User {user.id} attempted self-referral")
                else:
                    valid_referral_code = request.referral_code
            else:
                # Code doesn't exist. We choose to ignore it rather than crash.
                logger.warning(f"Invalid referral code provided: {request.referral_code}")

        # 4. Create New Registration
        # CRITICAL: We map 'request.referral_code' to the DB column 'referral_code_used'
        new_registration = Registration(
            user_id=user.id,
            course_id=course.id,
            status=RegistrationStatus.PENDING,
            referrer_name=request.referrer_name,
            referral_code_used=valid_referral_code, 
            created_at=datetime.utcnow()
        )

        db.add(new_registration)
        db.commit()
        db.refresh(new_registration)

        return new_registration

    @staticmethod
    def create_or_update_profile(
        db: Session, user: User, request: StudentProfileRequest
    ) -> StudentProfile:
        """Create or update student profile."""
        profile = (
            db.query(StudentProfile)
            .filter(StudentProfile.user_id == user.id)
            .first()
        )

        if profile:
            # Update existing
            for key, value in request.model_dump(exclude_unset=True).items():
                setattr(profile, key, value)
        else:
            # Create new
            profile = StudentProfile(
                user_id=user.id,
                **request.model_dump()
            )
            db.add(profile)

        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def get_user_registrations(db: Session, user_id: UUID) -> list[Registration]:
        """Get all registrations for a user."""
        return (
            db.query(Registration)
            .filter(Registration.user_id == user_id)
            .order_by(Registration.created_at.desc())
            .all()
        )