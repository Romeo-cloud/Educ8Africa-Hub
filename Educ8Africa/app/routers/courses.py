# app/routers/courses.py
from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.schemas.course import (
    CourseResponse, 
    CourseListResponse, 
    CourseCreateRequest, 
    CourseUpdateRequest
)
from app.services.course_service import CourseService

# Import your auth dependency here
# from app.api.deps import get_current_admin_user 

router = APIRouter(prefix="/api/courses", tags=["Courses"])

@router.get("", response_model=CourseListResponse)
def list_courses(
    active_only: bool = False, # Set to True for public pages, False for Admin
    db: Session = Depends(get_db)
):
    """
    List courses.
    - Admin: Can see all courses (active and inactive).
    - Public: Should pass ?active_only=true
    """
    courses = CourseService.get_all_courses(db, active_only=active_only)
    return CourseListResponse(
        courses=[CourseResponse.model_validate(c) for c in courses],
        total=len(courses),
    )

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: UUID, db: Session = Depends(get_db)):
    """Get details of a specific course."""
    course = CourseService.get_course(db, course_id)
    return CourseResponse.model_validate(course)

@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    request: CourseCreateRequest,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_admin_user) # Uncomment to protect
):
    """
    Create a new course.
    (Admin only)
    """
    course = CourseService.create_course(db, request)
    return CourseResponse.model_validate(course)

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: UUID,
    request: CourseUpdateRequest,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_admin_user) # Uncomment to protect
):
    """
    Update an existing course.
    (Admin only)
    """
    course = CourseService.update_course(db, course_id, request)
    return CourseResponse.model_validate(course)

from fastapi import Response # Ensure Response is imported

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_admin_user) # Uncomment to protect
):
    """
    Hard delete a course.
    Returns 204 No Content on success.
    (Admin only)
    """
    CourseService.delete_course(db, course_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)