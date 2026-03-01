# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.schemas.user import (
    UserSignupRequest,
    UserLoginRequest,
    SignupResponse,
    LoginResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# Profile update request schema
class ProfileUpdateRequest(BaseModel):
    full_name: str
    phone_number: str


@router.post("/signup", response_model=SignupResponse, status_code=201)
def signup(request: UserSignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.

    - Validates email uniqueness
    - Hashes password
    - Generates unique referral code
    """
    user = AuthService.signup(db, request)
    return SignupResponse(
        message="Account created successfully",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=LoginResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate and receive a JWT token.

    - Validates credentials
    - Returns JWT access token
    """
    result = AuthService.login(db, request)
    return LoginResponse(
        access_token=result["access_token"],
        token_type=result["token_type"],
        user=UserResponse.model_validate(result["user"]),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserResponse.model_validate(current_user)


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update current user's profile.
    
    - Updates full_name and phone_number
    - Email cannot be changed
    """
    # Update user fields
    current_user.full_name = request.full_name
    current_user.phone_number = request.phone_number
    
    try:
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return UserResponse.model_validate(current_user)
