# app/services/course_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.course import Course
from app.models.registration import Registration # Import Registration model
from app.schemas.course import CourseCreateRequest, CourseUpdateRequest
from uuid import UUID
from typing import List, Optional

class CourseService:
    """Handles course CRUD operations."""

    @staticmethod
    def create_course(db: Session, request: CourseCreateRequest) -> Course:
        """Create a new course."""
        # Optional: Check if course name already exists
        existing = db.query(Course).filter(Course.course_name == request.course_name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A course with this name already exists."
            )

        new_course = Course(
            course_name=request.course_name,
            description=request.description,
            amount=request.amount,
            welcome_note=request.welcome_note,
            is_active=True # Default to active
        )
        db.add(new_course)
        db.commit()
        db.refresh(new_course)
        return new_course

    @staticmethod
    def update_course(
        db: Session, course_id: UUID, request: CourseUpdateRequest
    ) -> Course:
        """Update an existing course."""
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

        # Update only fields that were sent (exclude_unset=True)
        update_data = request.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(course, field, value)

        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def get_course(db: Session, course_id: UUID) -> Course:
        """Get a single course by ID."""
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return course

    @staticmethod
    def get_all_courses(
        db: Session, active_only: bool = False
    ) -> List[Course]:
        """
        Get all courses.
        If active_only=True, filters out deleted/inactive courses.
        """
        query = db.query(Course)
        
        if active_only:
            query = query.filter(Course.is_active == True)
            
        return query.order_by(Course.created_at.desc()).all()

    @staticmethod
    def delete_course(db: Session, course_id: UUID) -> None:
        """
        Hard delete a course.
        Permanently removes the record from the database.
        """
        course = db.query(Course).filter(Course.id == course_id).first()
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        
        # --- NEW LOGIC: Remove related registrations first ---
        # This deletes all student registrations associated with this course
        # to prevent foreign key constraint errors or orphaned data.
        db.query(Registration).filter(Registration.course_id == course_id).delete(synchronize_session=False)

        # ⚠️ HARD DELETE: Removes the row completely
        db.delete(course)
        db.commit()