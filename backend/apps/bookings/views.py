from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from apps.core.mixins import ResponseMixin
from apps.core.permissions import IsAdmin, IsOwnerOrAdmin
from .models import Booking, BookingTicket
from .serializers import (
    BookingListSerializer, BookingDetailSerializer, CreateBookingSerializer
)


class CreateBookingView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreateBookingSerializer

    @transaction.atomic
    def post(self, request):
        if not request.user.is_verified:
            return self.error_response('Please verify your email before making a booking.')

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        event = data['event']
        ticket_type = data['ticket_type']
        quantity = data['quantity']

        # Lock ticket type row for update to prevent race conditions
        ticket_type_locked = ticket_type.__class__.objects.select_for_update().get(id=ticket_type.id)

        if ticket_type_locked.available_count < quantity:
            return self.error_response(f'Only {ticket_type_locked.available_count} tickets remaining.')

        booking = Booking.objects.create(
            user=request.user,
            event=event,
            ticket_type=ticket_type,
            quantity=quantity,
            unit_price=ticket_type.price,
            total_amount=ticket_type.price * quantity,
            currency=ticket_type.currency,
            notes=data.get('notes', ''),
            status=Booking.Status.PENDING,
        )

        # Reserve tickets (increment sold count)
        ticket_type_locked.sold_count += quantity
        ticket_type_locked.save(update_fields=['sold_count'])

        # Auto-update event status if sold out
        event_ticket_types = event.ticket_types.all()
        if all(tt.sold_count >= tt.total_count for tt in event_ticket_types):
            event.status = 'sold_out'
            event.save(update_fields=['status'])

        return self.success_response(
            data=BookingDetailSerializer(booking).data,
            message='Booking created. Please upload payment proof to confirm.',
            status_code=status.HTTP_201_CREATED
        )


class UserBookingListView(ResponseMixin, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingListSerializer
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            'event', 'ticket_type'
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        paginated = self.get_paginated_response(serializer.data)
        return self.success_response(data=paginated.data)


class UserBookingDetailView(ResponseMixin, generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingDetailSerializer
    lookup_field = 'reference'

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            'event', 'ticket_type', 'user'
        ).prefetch_related('tickets')

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return self.success_response(data=serializer.data)


class CancelBookingView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reference):
        try:
            booking = Booking.objects.get(reference=reference, user=request.user)
        except Booking.DoesNotExist:
            return self.error_response('Booking not found.', status_code=status.HTTP_404_NOT_FOUND)

        if booking.status not in (Booking.Status.PENDING, Booking.Status.PAYMENT_UPLOADED):
            return self.error_response('This booking cannot be cancelled.')

        with transaction.atomic():
            booking.status = Booking.Status.CANCELLED
            booking.cancelled_at = timezone.now()
            booking.save(update_fields=['status', 'cancelled_at'])

            # Release tickets
            ticket_type = booking.ticket_type
            ticket_type.sold_count = max(0, ticket_type.sold_count - booking.quantity)
            ticket_type.save(update_fields=['sold_count'])

        return self.success_response(message='Booking cancelled successfully.')


# Admin Views
class AdminBookingListView(ResponseMixin, generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = BookingListSerializer
    filterset_fields = ['status', 'event']
    search_fields = ['reference', 'user__email']
    ordering_fields = ['created_at', 'status', 'total_amount']
    ordering = ['-created_at']

    def get_queryset(self):
        return Booking.objects.all().select_related('event', 'ticket_type', 'user')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        paginated = self.get_paginated_response(serializer.data)
        return self.success_response(data=paginated.data)


class AdminBookingDetailView(ResponseMixin, generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = BookingDetailSerializer
    queryset = Booking.objects.all().select_related('event', 'ticket_type', 'user').prefetch_related('tickets')
    lookup_field = 'reference'

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return self.success_response(data=serializer.data)


class AdminConfirmBookingView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @transaction.atomic
    def post(self, request, reference):
        try:
            booking = Booking.objects.select_for_update().get(reference=reference)
        except Booking.DoesNotExist:
            return self.error_response('Booking not found.', status_code=status.HTTP_404_NOT_FOUND)

        if booking.status != Booking.Status.PAYMENT_UPLOADED:
            return self.error_response('Booking payment has not been uploaded.')

        booking.status = Booking.Status.CONFIRMED
        booking.confirmed_at = timezone.now()
        booking.save(update_fields=['status', 'confirmed_at'])

        # Generate individual tickets
        for i in range(booking.quantity):
            BookingTicket.objects.create(booking=booking)

        return self.success_response(message='Booking confirmed and tickets issued.')
