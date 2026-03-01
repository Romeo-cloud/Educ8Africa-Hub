# app/services/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Handles email sending operations."""

    @staticmethod
    async def send_welcome_email(
        to_email: str,
        user_name: str,
        course_name: str,
        welcome_note: str,
    ) -> bool:
        """Send a welcome email after successful payment."""
        subject = f"Welcome to {course_name} — {settings.APP_NAME}"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .welcome-note {{ background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }}
                .btn {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Registration Confirmed!</h1>
                </div>
                <div class="content">
                    <h2>Hello {user_name},</h2>
                    <p>Congratulations! Your registration for <strong>{course_name}</strong> has been confirmed.</p>

                    <div class="welcome-note">
                        <h3>📝 Welcome Note</h3>
                        <p>{welcome_note}</p>
                    </div>

                    <p>You can access your dashboard to view your courses, track referrals, and more.</p>

                    <a href="{settings.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>

                    <div class="footer">
                        <p>Thank you for choosing {settings.APP_NAME}!</p>
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        return await EmailService._send_email(to_email, subject, html_body)

    @staticmethod
    async def _send_email(
        to_email: str, subject: str, html_body: str
    ) -> bool:
        """Internal method to send an email via SMTP."""
        try:
            if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
                logger.warning(
                    "SMTP credentials not configured. Skipping email send."
                )
                return False

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = (
                f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
            )
            msg["To"] = to_email

            html_part = MIMEText(html_body, "html")
            msg.attach(html_part)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())

            logger.info(f"Welcome email sent to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False