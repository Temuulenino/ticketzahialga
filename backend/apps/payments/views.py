from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.utils import timezone
from apps.core.mixins import ResponseMixin
from apps.core.permissions import IsAdmin
from apps.bookings.models import Booking
from .models import Payment
from .serializers import PaymentSerializer, UploadPaymentSerializer, ReviewPaymentSerializer


class UploadPaymentView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UploadPaymentSerializer
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        booking_ref = data['booking_reference']

        try:
            booking = Booking.objects.select_for_update().get(
                reference=booking_ref,
                user=request.user
            )
        except Booking.DoesNotExist:
            return self.error_response('Booking not found or unauthorized.', status_code=status.HTTP_404_NOT_FOUND)

        # Update or create payment record
        payment, created = Payment.objects.update_or_create(
            booking=booking,
            defaults={
                'user': request.user,
                'amount': booking.total_amount,
                'currency': booking.currency,
                'method': data['method'],
                'transaction_reference': data.get('transaction_reference', ''),
                'proof_image': data['proof_image'],
                'status': Payment.Status.PENDING,
            }
        )

        booking.status = Booking.Status.PAYMENT_UPLOADED
        booking.save(update_fields=['status'])

        return self.success_response(
            data=PaymentSerializer(payment, context={'request': request}).data,
            message='Payment proof uploaded. Awaiting admin verification.',
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class UserPaymentListView(ResponseMixin, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).select_related('booking')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True, context={'request': request})
        paginated = self.get_paginated_response(serializer.data)
        return self.success_response(data=paginated.data)


# Admin views
class AdminPaymentListView(ResponseMixin, generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = PaymentSerializer
    filterset_fields = ['status', 'method']
    search_fields = ['booking__reference', 'user__email', 'transaction_reference']
    ordering_fields = ['created_at', 'amount', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        return Payment.objects.all().select_related('booking', 'user')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True, context={'request': request})
        paginated = self.get_paginated_response(serializer.data)
        return self.success_response(data=paginated.data)


class AdminReviewPaymentView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = ReviewPaymentSerializer

    @transaction.atomic
    def post(self, request, payment_id):
        try:
            payment = Payment.objects.select_for_update().get(id=payment_id)
        except Payment.DoesNotExist:
            return self.error_response('Payment not found.', status_code=status.HTTP_404_NOT_FOUND)

        if payment.status != Payment.Status.PENDING:
            return self.error_response('Payment has already been reviewed.')

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        admin_notes = serializer.validated_data.get('admin_notes', '')

        payment.admin_notes = admin_notes
        payment.reviewed_by = request.user
        payment.reviewed_at = timezone.now()

        if action == 'approve':
            payment.status = Payment.Status.APPROVED
            payment.save()

            # Confirm booking
            booking = payment.booking
            booking.status = Booking.Status.CONFIRMED
            booking.confirmed_at = timezone.now()
            booking.save(update_fields=['status', 'confirmed_at'])

            # Generate tickets
            from apps.bookings.models import BookingTicket
            for _ in range(booking.quantity):
                BookingTicket.objects.create(booking=booking)

            message = 'Payment approved and booking confirmed.'
        else:
            payment.status = Payment.Status.REJECTED
            payment.save()

            # Revert booking status
            booking = payment.booking
            booking.status = Booking.Status.PENDING
            booking.save(update_fields=['status'])

            # Release reserved tickets
            ticket_type = booking.ticket_type
            ticket_type.sold_count = max(0, ticket_type.sold_count - booking.quantity)
            ticket_type.save(update_fields=['sold_count'])

            message = 'Payment rejected and tickets released.'

        return self.success_response(
            data=PaymentSerializer(payment, context={'request': request}).data,
            message=message
        )
