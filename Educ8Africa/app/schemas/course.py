# app/schemas/course.py
from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.course import Course # Assuming your SQLAlchemy model is here
from fastapi import HTTPException


class CourseCreateRequest(BaseModel):
    course_name: str
    description: Optional[str] = None
    amount: float
    welcome_note: Optional[str] = None

    @field_validator("course_name")
    @classmethod
    def validate_course_name(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError("Course name must be at least 3 characters")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v



def delete_course(db: Session, course_id: UUID) -> bool:
    # 1. Find the course
    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        return False

    # 2. Check for dependencies (Optional but Recommended)
    # If your course has enrollments/payments, deleting it might cause SQL errors 
    # or data loss. You might want to prevent deletion if students are enrolled.
    # if course.enrollments: 
    #     raise HTTPException(status_code=400, detail="Cannot delete course with active enrollments.")

    # 3. Delete and Commit
    try:
        db.delete(course)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete course: {str(e)}")


class CourseUpdateRequest(BaseModel):
    course_name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    welcome_note: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v


class CourseResponse(BaseModel):
    id: UUID
    course_name: str
    description: Optional[str]
    amount: float
    welcome_note: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    courses: list[CourseResponse]
    total: int