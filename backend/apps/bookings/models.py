from django.db import models
import uuid
import secrets


def generate_booking_ref():
    return f'TKT-{secrets.token_hex(4).upper()}'


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Payment'
        PAYMENT_UPLOADED = 'payment_uploaded', 'Payment Uploaded'
        CONFIRMED = 'confirmed', 'Confirmed'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=20, unique=True, default=generate_booking_ref)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='bookings')
    ticket_type = models.ForeignKey('events.TicketType', on_delete=models.CASCADE, related_name='bookings')
    quantity = models.PositiveSmallIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='ETB')
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['reference']),
        ]

    def __str__(self):
        return f'{self.reference} - {self.user.email}'

    def save(self, *args, **kwargs):
        if not self.unit_price:
            self.unit_price = self.ticket_type.price
        if not self.total_amount:
            self.total_amount = self.unit_price * self.quantity
        super().save(*args, **kwargs)


class BookingTicket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')
    ticket_number = models.CharField(max_length=50, unique=True)
    qr_code = models.ImageField(upload_to='qr_codes/', null=True, blank=True)
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'booking_tickets'

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = f'T-{secrets.token_hex(6).upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.ticket_number
