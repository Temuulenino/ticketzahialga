from django.db import models
from django.utils import timezone
import uuid


class Category(models.Model):
    class Type(models.TextChoices):
        CONCERT = 'concert', 'Concert'
        ENTERTAINMENT = 'entertainment', 'Entertainment'
        MUSEUM = 'museum', 'Museum'
        FESTIVAL = 'festival', 'Festival'
        LIVE_SHOW = 'live_show', 'Live Show'
        SPORTS = 'sports', 'Sports'
        THEATER = 'theater', 'Theater'
        OTHER = 'other', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.OTHER)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#6366f1')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Event(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        SOLD_OUT = 'sold_out', 'Sold Out'
        CANCELLED = 'cancelled', 'Cancelled'
        COMPLETED = 'completed', 'Completed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='events')
    venue = models.CharField(max_length=255)
    venue_address = models.TextField(blank=True)
    city = models.CharField(max_length=100, db_index=True)
    country = models.CharField(max_length=100, default='Ethiopia')
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    start_date = models.DateTimeField(db_index=True)
    end_date = models.DateTimeField()
    poster = models.ImageField(upload_to='events/posters/', null=True, blank=True)
    banner = models.ImageField(upload_to='events/banners/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_trending = models.BooleanField(default=False, db_index=True)
    tags = models.CharField(max_length=500, blank=True)
    total_capacity = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, related_name='created_events'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'start_date']),
            models.Index(fields=['is_featured', 'status']),
            models.Index(fields=['is_trending', 'status']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_upcoming(self):
        return self.start_date > timezone.now()

    @property
    def tags_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]

    @property
    def available_tickets(self):
        sold = self.ticket_types.aggregate(
            sold=models.Sum('sold_count')
        )['sold'] or 0
        return self.total_capacity - sold


class TicketType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ticket_types')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='ETB')
    total_count = models.PositiveIntegerField()
    sold_count = models.PositiveIntegerField(default=0)
    max_per_booking = models.PositiveSmallIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    sale_start = models.DateTimeField(null=True, blank=True)
    sale_end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ticket_types'
        ordering = ['price']

    def __str__(self):
        return f'{self.event.title} - {self.name}'

    @property
    def available_count(self):
        return self.total_count - self.sold_count

    @property
    def is_available(self):
        now = timezone.now()
        if self.sold_count >= self.total_count:
            return False
        if self.sale_start and now < self.sale_start:
            return False
        if self.sale_end and now > self.sale_end:
            return False
        return self.is_active


class EventImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='events/gallery/')
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_images'
        ordering = ['order', 'created_at']
