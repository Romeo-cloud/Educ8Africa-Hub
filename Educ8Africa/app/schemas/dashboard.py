# app/schemas/dashboard.py
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class CourseInfo(BaseModel):
    """Simplified course info for user dashboard."""
    registration_id: str
    course_id: str
    course_name: str
    amount: float
    status: str  # "pending", "paid", "cancelled"
    registered_at: str


class PaymentInfo(BaseModel):
    """Simplified payment info for user dashboard."""
    payment_id: str
    course_name: str
    amount: float
    reference: str
    status: str  # "pending", "success", "failed"
    paid_at: Optional[str] = None


class UserDashboardResponse(BaseModel):
    user_id: str
    user_name: str
    email: str
    phone_number: str
    role: str
    referral_code: Optional[str] = None
    total_courses_enrolled: int
    paid_courses_count: int
    pending_courses_count: int
    total_paid: float
    registered_courses: List[CourseInfo]
    payment_history: List[PaymentInfo]
    referral_count: int
    referral_earnings: float
    welcome_notes: list[dict]


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_students: int
    total_revenue: float
    total_referrals: int
    total_courses: int
    course_statistics: list[dict]
    recent_payments: list[dict]
    recent_registrations: list[dict]
