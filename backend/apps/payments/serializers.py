from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    booking_reference = serializers.CharField(source='booking.reference', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    proof_url = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = ['id', 'booking_reference', 'user_email', 'amount', 'currency',
                  'method', 'transaction_reference', 'proof_url', 'status',
                  'admin_notes', 'reviewed_at', 'created_at']
        read_only_fields = ['id', 'status', 'admin_notes', 'reviewed_at', 'created_at']

    def get_proof_url(self, obj):
        request = self.context.get('request')
        if obj.proof_image and request:
            return request.build_absolute_uri(obj.proof_image.url)
        return None


class UploadPaymentSerializer(serializers.Serializer):
    booking_reference = serializers.CharField()
    method = serializers.ChoiceField(choices=Payment.Method.choices)
    transaction_reference = serializers.CharField(required=False, allow_blank=True, max_length=100)
    proof_image = serializers.ImageField()

    def validate_booking_reference(self, value):
        from apps.bookings.models import Booking
        try:
            booking = Booking.objects.get(reference=value)
        except Booking.DoesNotExist:
            raise serializers.ValidationError('Booking not found.')

        if booking.status == 'confirmed':
            raise serializers.ValidationError('This booking is already confirmed.')

        if booking.status == 'cancelled':
            raise serializers.ValidationError('This booking has been cancelled.')

        if hasattr(booking, 'payment') and booking.payment.status == 'approved':
            raise serializers.ValidationError('Payment already approved for this booking.')

        return value


class ReviewPaymentSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    admin_notes = serializers.CharField(required=False, allow_blank=True, max_length=500)
