# app/services/auth_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserSignupRequest, UserLoginRequest
from app.utils.security import hash_password, verify_password, create_access_token
from datetime import timedelta
from app.config import settings


class AuthService:
    """Handles user authentication operations."""

    @staticmethod
    def signup(db: Session, request: UserSignupRequest) -> User:
        """Register a new user (Default Role: USER, No Referral Code)."""

        # 1. Check if email already exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # 2. Create user — no referral code for normal users
        user = User(
            full_name=request.full_name,       # NOT request.name
            email=request.email,
            phone_number=request.phone_number,  # NOT request.phone
            password_hash=hash_password(request.password),  # NOT get_password_hash
            referral_code=None,                 # Normal users don't get codes
            role=UserRole.USER,                 # Default role — admin assigns later
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, request: UserLoginRequest) -> dict:
        """Authenticate a user and return token."""
        user = db.query(User).filter(User.email == request.email).first()

        if not user or not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )

        # Create JWT token
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role.value},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
        }

    @staticmethod
    def create_admin(db: Session) -> User:
        """Create or return admin user for seeding."""
        admin = (
            db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        )
        if admin:
            return admin

        admin = User(
            full_name=settings.ADMIN_FULL_NAME,
            email=settings.ADMIN_EMAIL,
            phone_number="0000000000",
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            referral_code=None,    # Admin doesn't need a referral code
            role=UserRole.ADMIN,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin