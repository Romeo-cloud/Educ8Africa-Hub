# app/services/payment_service.py
import httpx
import hashlib
import hmac
import uuid
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.payment import Payment, PaymentStatus
from app.models.registration import Registration, RegistrationStatus
from app.models.course import Course
from app.models.user import User
from app.config import settings
from app.services.referral_service import ReferralService
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)

class PaymentService:
    """Handles Paystack payment operations."""

    PAYSTACK_INIT_URL = f"{settings.PAYSTACK_BASE_URL}/transaction/initialize"
    PAYSTACK_VERIFY_URL = f"{settings.PAYSTACK_BASE_URL}/transaction/verify"

    @staticmethod
    def generate_reference() -> str:
        """Generate a unique payment reference."""
        return f"TRN-{uuid.uuid4().hex[:12].upper()}"

    @staticmethod
    async def initialize_payment(
        db: Session, user: User, registration_id: uuid.UUID
    ) -> dict:
        """Initialize a payment via Paystack (Backend flow)."""
        registration = (
            db.query(Registration)
            .filter(
                Registration.id == registration_id,
                Registration.user_id == user.id,
            )
            .first()
        )
        if not registration:
            raise HTTPException(status_code=404, detail="Registration not found")

        if registration.status == RegistrationStatus.PAID:
            raise HTTPException(status_code=400, detail="Registration already paid")

        course = db.query(Course).filter(Course.id == registration.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        existing_payment = (
            db.query(Payment)
            .filter(
                Payment.user_id == user.id,
                Payment.course_id == course.id,
                Payment.status == PaymentStatus.PENDING,
            )
            .first()
        )

        reference = existing_payment.reference if existing_payment else PaymentService.generate_reference()
        amount_in_subunit = int(course.amount * 100)

        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        # We include registration_id in metadata for easier tracking
        payload = {
            "email": user.email,
            "amount": amount_in_subunit,
            "reference": reference,
            "callback_url": f"{settings.FRONTEND_URL}/payment/verify?reference={reference}",
            "metadata": {
                "user_id": str(user.id),
                "course_id": str(course.id),
                "registration_id": str(registration.id),
            },
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    PaymentService.PAYSTACK_INIT_URL,
                    json=payload,
                    headers=headers,
                    timeout=30.0,
                )
        except httpx.RequestError as e:
            logger.error(f"Paystack init connection error: {e}")
            raise HTTPException(status_code=502, detail="Payment gateway unavailable")

        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to initialize payment")

        result = response.json()
        if not result.get("status"):
            raise HTTPException(status_code=502, detail=result.get("message", "Paystack initialization failed"))

        data = result["data"]

        if existing_payment:
            existing_payment.authorization_url = data["authorization_url"]
            existing_payment.paystack_reference = data.get("reference", reference)
        else:
            payment = Payment(
                user_id=user.id,
                course_id=course.id,
                amount=course.amount,
                reference=reference,
                paystack_reference=data.get("reference", reference),
                authorization_url=data["authorization_url"],
                status=PaymentStatus.PENDING,
            )
            db.add(payment)

        db.commit()

        return {
            "authorization_url": data["authorization_url"],
            "reference": reference,
            "access_code": data.get("access_code", ""),
        }

    @staticmethod
    async def verify_payment(db: Session, reference: str, registration_id: str = None) -> dict:
        """Verify a payment via Paystack."""
        headers = {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{PaymentService.PAYSTACK_VERIFY_URL}/{reference}",
                    headers=headers,
                    timeout=30.0,
                )
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Payment gateway unavailable")

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Payment verification failed")

        result = response.json()
        data = result.get("data", {})
        
        if not result.get("status") or data.get("status") != "success":
             raise HTTPException(status_code=400, detail="Payment failed or invalid")

        payment = db.query(Payment).filter(Payment.reference == reference).first()

        if payment:
            if payment.status != PaymentStatus.SUCCESS:
                await PaymentService._mark_payment_success(db, payment)
            
            return {
                "status": "success", 
                "message": "Payment verified", 
                "reference": reference, 
                "amount": payment.amount
            }

        # Logic for inline payment fallback (create payment if missing)
        else:
            customer_email = data.get("customer", {}).get("email")
            amount_paid = data.get("amount") / 100
            
            user = db.query(User).filter(User.email == customer_email).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Use provided registration_id if available
            course_id = None
            registration = None
            
            if registration_id:
                try:
                    registration = db.query(Registration).filter(Registration.id == uuid.UUID(registration_id)).first()
                    if registration:
                        course_id = registration.course_id
                except:
                    pass
            
            # Fallback: Try to find course via pending registration
            if not course_id:
                registration = (
                    db.query(Registration)
                    .filter(Registration.user_id == user.id, Registration.status == RegistrationStatus.PENDING)
                    .order_by(Registration.created_at.desc())
                    .first()
                )
                course_id = registration.course_id if registration else None
            
            if not course_id:
                # Last resort fallback
                course = db.query(Course).filter(Course.amount == amount_paid).first()
                if course:
                     course_id = course.id
                else:
                    raise HTTPException(status_code=400, detail="Cannot match payment to course")

            payment = Payment(
                id=uuid.uuid4(),
                user_id=user.id,
                course_id=course_id,
                amount=amount_paid,
                reference=reference,
                paystack_reference=str(data.get("id")),
                status=PaymentStatus.SUCCESS,
                paid_at=datetime.utcnow(),
                authorization_url="inline"
            )
            db.add(payment)
            db.commit()
            
            await PaymentService._mark_payment_success(db, payment)
            
            return {
                "status": "success",
                "message": "Payment verified and recorded",
                "reference": reference,
                "amount": amount_paid
            }

    @staticmethod
    async def handle_webhook(db: Session, payload: dict, signature: str) -> dict:
        """Handle Paystack webhook events."""
        event = payload.get("event")
        data = payload.get("data", {})

        if event == "charge.success":
            reference = data.get("reference")
            if reference:
                try:
                    await PaymentService.verify_payment(db, reference)
                except Exception as e:
                    logger.error(f"Webhook error: {e}")

        return {"status": "ok"}

    @staticmethod
    async def _mark_payment_success(db: Session, payment: Payment) -> None:
        """
        Mark payment as successful and process REFERRALS based on Registration.
        """
        payment.status = PaymentStatus.SUCCESS
        payment.paid_at = datetime.utcnow()

        # 1. Find the Registration linked to this payment
        registration = (
            db.query(Registration)
            .filter(
                Registration.user_id == payment.user_id,
                Registration.course_id == payment.course_id,
            )
            .order_by(Registration.created_at.desc())
            .first()
        )

        if registration:
            registration.status = RegistrationStatus.PAID
            
            # 2. RETRIEVE CODE FROM THE CORRECT COLUMN: referral_code_used
            code_used = registration.referral_code_used

            if code_used:
                logger.info(f"Processing referral code '{code_used}' for user {payment.user_id}")
                ReferralService.process_referral(
                    db=db,
                    referral_code=code_used,
                    referred_user_id=payment.user_id,
                    course_id=payment.course_id,
                    course_amount=payment.amount,
                )
            else:
                logger.info("No referral code found on registration.")

        db.commit()

        # 3. Send welcome email
        try:
            user = db.query(User).filter(User.id == payment.user_id).first()
            course = db.query(Course).filter(Course.id == payment.course_id).first()
            if user and course:
                await EmailService.send_welcome_email(
                    to_email=user.email,
                    user_name=user.full_name,
                    course_name=course.course_name,
                    welcome_note=course.welcome_note or "Welcome!",
                )
        except Exception as e:
            logger.error(f"Failed to send email: {e}")

    @staticmethod
    def get_user_payments(db: Session, user_id: uuid.UUID) -> list[Payment]:
        return db.query(Payment).filter(Payment.user_id == user_id).order_by(Payment.created_at.desc()).all()
