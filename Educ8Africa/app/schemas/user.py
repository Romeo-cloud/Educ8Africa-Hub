# app/schemas/user.py
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole
import re


# ─── Auth Requests ───────────────────────────────────────────────

class UserSignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str
    password: str

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v.strip()

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"[^\d+]", "", v)
        if len(cleaned) < 10:
            raise ValueError("Phone number must be at least 10 digits")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError(
                "Password must contain at least one uppercase letter"
            )
        if not re.search(r"[a-z]", v):
            raise ValueError(
                "Password must contain at least one lowercase letter"
            )
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


# ─── Admin: Role Assignment ─────────────────────────────────────

class AssignRoleRequest(BaseModel):
    """Admin uses this to assign USER or AMBASSADOR role."""
    role: UserRole

    @field_validator("role")
    @classmethod
    def prevent_admin_assignment(cls, v: UserRole) -> UserRole:
        if v == UserRole.ADMIN:
            raise ValueError("Cannot assign admin role through this endpoint")
        return v


# ─── Responses ───────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone_number: str
    referral_code: Optional[str] = None  # Only ambassadors have this
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SignupResponse(BaseModel):
    message: str
    user: UserResponse


# ─── Dashboard ───────────────────────────────────────────────────

class DashboardResponse(BaseModel):
    welcome_message: str
    full_name: str
    email: str
    role: str
    referral_code: Optional[str] = None  # None for normal users
    total_courses_enrolled: int
    enrolled_courses: List[dict]         # Course details

    class Config:
        from_attributes = True