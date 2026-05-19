from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from apps.core.mixins import ResponseMixin
from apps.core.permissions import IsAdmin
from apps.users.models import User
from apps.events.models import Event
from apps.bookings.models import Booking
from apps.payments.models import Payment


class AdminDashboardView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)

        total_users = User.objects.filter(role='user').count()
        new_users_7d = User.objects.filter(role='user', date_joined__gte=seven_days_ago).count()

        total_events = Event.objects.count()
        published_events = Event.objects.filter(status='published').count()
        upcoming_events = Event.objects.filter(status='published', start_date__gt=now).count()

        total_bookings = Booking.objects.count()
        confirmed_bookings = Booking.objects.filter(status='confirmed').count()
        pending_bookings = Booking.objects.filter(status='pending').count()
        payment_uploaded_bookings = Booking.objects.filter(status='payment_uploaded').count()

        total_revenue = Payment.objects.filter(
            status='approved'
        ).aggregate(total=Sum('amount'))['total'] or 0

        monthly_revenue = Payment.objects.filter(
            status='approved',
            created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('amount'))['total'] or 0

        pending_payments = Payment.objects.filter(status='pending').count()

        recent_bookings = Booking.objects.select_related(
            'user', 'event'
        ).order_by('-created_at')[:10]

        recent_bookings_data = [
            {
                'reference': b.reference,
                'user': b.user.email,
                'event': b.event.title,
                'amount': str(b.total_amount),
                'status': b.status,
                'date': b.created_at.isoformat(),
            }
            for b in recent_bookings
        ]

        # Bookings by status chart data
        bookings_by_status = dict(
            Booking.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')
        )

        # Revenue last 7 days
        revenue_trend = []
        for i in range(7):
            day = now - timedelta(days=i)
            day_revenue = Payment.objects.filter(
                status='approved',
                created_at__date=day.date()
            ).aggregate(total=Sum('amount'))['total'] or 0
            revenue_trend.append({
                'date': day.date().isoformat(),
                'revenue': float(day_revenue)
            })

        return self.success_response(data={
            'overview': {
                'total_users': total_users,
                'new_users_7d': new_users_7d,
                'total_events': total_events,
                'published_events': published_events,
                'upcoming_events': upcoming_events,
                'total_bookings': total_bookings,
                'confirmed_bookings': confirmed_bookings,
                'pending_bookings': pending_bookings,
                'payment_uploaded_bookings': payment_uploaded_bookings,
                'pending_payments': pending_payments,
                'total_revenue': float(total_revenue),
                'monthly_revenue': float(monthly_revenue),
            },
            'bookings_by_status': bookings_by_status,
            'recent_bookings': recent_bookings_data,
            'revenue_trend': list(reversed(revenue_trend)),
        })
