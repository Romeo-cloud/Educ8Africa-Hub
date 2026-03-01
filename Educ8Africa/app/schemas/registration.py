# app/schemas/registration.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime, date


class CourseSelectRequest(BaseModel):
    course_id: UUID
    referrer_name: Optional[str] = None
    referral_code: Optional[str] = None


class StudentProfileRequest(BaseModel):
    # Personal information
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

    # Academic information
    highest_education: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[str] = None

    # Guardian information
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_email: Optional[EmailStr] = None
    guardian_relationship: Optional[str] = None


class RegistrationResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID
    status: str
    referrer_name: Optional[str]
    referral_code_used: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class StudentProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    date_of_birth: Optional[date]
    gender: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    highest_education: Optional[str]
    institution: Optional[str]
    graduation_year: Optional[str]
    guardian_name: Optional[str]
    guardian_phone: Optional[str]
    guardian_email: Optional[str]
    guardian_relationship: Optional[str]

    class Config:
        from_attributes = True