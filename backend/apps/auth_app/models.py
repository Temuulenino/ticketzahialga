from django.db import models
from django.conf import settings
from django.utils import timezone
import random
import string


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


class OTPCode(models.Model):
    class Purpose(models.TextChoices):
        VERIFY_EMAIL = 'verify_email', 'Verify Email'
        RESET_PASSWORD = 'reset_password', 'Reset Password'

    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=Purpose.choices, default=Purpose.VERIFY_EMAIL)
    attempts = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'otp_codes'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.code = generate_otp()
            from datetime import timedelta
            self.expires_at = timezone.now() + timedelta(
                minutes=getattr(settings, 'OTP_EXPIRY_MINUTES', 10)
            )
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired

    def increment_attempts(self):
        self.attempts += 1
        self.save(update_fields=['attempts'])

    def mark_used(self):
        self.is_used = True
        self.save(update_fields=['is_used'])

    def __str__(self):
        return f'{self.email} - {self.purpose} - {self.code}'
