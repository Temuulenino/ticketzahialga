from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import OTPCode
from apps.users.models import User


class OTPService:
    MAX_ATTEMPTS = 5
    RATE_LIMIT_MINUTES = 1

    @classmethod
    def create_otp(cls, email: str, purpose: str) -> OTPCode:
        # Invalidate existing active OTPs for same email+purpose
        OTPCode.objects.filter(
            email=email,
            purpose=purpose,
            is_used=False
        ).update(is_used=True)

        otp = OTPCode.objects.create(email=email, purpose=purpose)
        return otp

    @classmethod
    def verify_otp(cls, email: str, code: str, purpose: str) -> tuple[bool, str]:
        try:
            otp = OTPCode.objects.filter(
                email=email,
                purpose=purpose,
                is_used=False
            ).latest('created_at')
        except OTPCode.DoesNotExist:
            return False, 'No active OTP found. Please request a new one.'

        if otp.attempts >= cls.MAX_ATTEMPTS:
            return False, 'Maximum attempts exceeded. Please request a new OTP.'

        if otp.is_expired:
            return False, 'OTP has expired. Please request a new one.'

        if otp.code != code:
            otp.increment_attempts()
            remaining = cls.MAX_ATTEMPTS - otp.attempts
            return False, f'Invalid OTP. {remaining} attempts remaining.'

        otp.mark_used()
        return True, 'OTP verified successfully.'

    @classmethod
    def send_otp_email(cls, email: str, otp: OTPCode) -> bool:
        subject_map = {
            'verify_email': 'Verify Your TicketPro Account',
            'reset_password': 'Reset Your TicketPro Password',
        }
        subject = subject_map.get(otp.purpose, 'TicketPro OTP Code')

        message = f"""
Your OTP code is: {otp.code}

This code will expire in {settings.OTP_EXPIRY_MINUTES} minutes.

If you didn't request this, please ignore this email.

- TicketPro Team
        """

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return True
        except Exception:
            return False

    @classmethod
    def can_request_otp(cls, email: str, purpose: str) -> tuple[bool, str]:
        recent = OTPCode.objects.filter(
            email=email,
            purpose=purpose,
            created_at__gte=timezone.now() - timedelta(minutes=cls.RATE_LIMIT_MINUTES)
        ).exists()

        if recent:
            return False, f'Please wait {cls.RATE_LIMIT_MINUTES} minute before requesting another OTP.'
        return True, ''
