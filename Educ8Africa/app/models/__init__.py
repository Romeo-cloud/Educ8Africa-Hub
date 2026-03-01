# app/models/__init__.py
from app.models.user import User
from app.models.course import Course
from app.models.registration import Registration, StudentProfile
from app.models.payment import Payment
from app.models.referral import Referral

__all__ = [
    "User",
    "Course",
    "Registration",
    "StudentProfile",
    "Payment",
    "Referral",
]