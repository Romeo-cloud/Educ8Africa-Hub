# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import engine, SessionLocal, Base
from app.routers import auth, courses, registration, payment, dashboard, admin, referral
from app.services.auth_service import AuthService
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    logger.info("Starting up Training Registration System...")

    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified.")

    # Seed admin user
    db = SessionLocal()
    try:
        admin_user = AuthService.create_admin(db)
        logger.info(f"Admin user ready: {admin_user.email}")
    except Exception as e:
        logger.error(f"Failed to seed admin: {e}")
    finally:
        db.close()

    yield

    # Shutdown
    logger.info("Shutting down Training Registration System...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "A complete training registration system with course management, "
        "Paystack payments, referral tracking, and admin dashboard."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(registration.router)
app.include_router(payment.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(referral.router)


@app.get("/", tags=["Root"])
def root():
    """Root endpoint — health check."""
    return {
        "application": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Root"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
