from rest_framework import serializers
from apps.events.serializers import EventListSerializer, TicketTypeSerializer
from apps.users.serializers import UserPublicSerializer
from .models import Booking, BookingTicket


class BookingTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingTicket
        fields = ['id', 'ticket_number', 'is_used', 'used_at']


class BookingListSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_slug = serializers.CharField(source='event.slug', read_only=True)
    event_start_date = serializers.DateTimeField(source='event.start_date', read_only=True)
    event_venue = serializers.CharField(source='event.venue', read_only=True)
    ticket_type_name = serializers.CharField(source='ticket_type.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'reference', 'event_title', 'event_slug', 'event_start_date',
                  'event_venue', 'ticket_type_name', 'quantity', 'unit_price',
                  'total_amount', 'currency', 'status', 'user_email', 'created_at']


class BookingDetailSerializer(serializers.ModelSerializer):
    event = EventListSerializer(read_only=True)
    ticket_type = TicketTypeSerializer(read_only=True)
    tickets = BookingTicketSerializer(many=True, read_only=True)
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'reference', 'user', 'event', 'ticket_type', 'quantity',
                  'unit_price', 'total_amount', 'currency', 'status', 'notes',
                  'tickets', 'cancelled_at', 'confirmed_at', 'created_at', 'updated_at']


class CreateBookingSerializer(serializers.Serializer):
    event_id = serializers.UUIDField()
    ticket_type_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=20)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate(self, data):
        from apps.events.models import Event, TicketType

        try:
            event = Event.objects.get(id=data['event_id'], status='published')
        except Event.DoesNotExist:
            raise serializers.ValidationError({'event_id': 'Event not found or not available.'})

        try:
            ticket_type = TicketType.objects.get(id=data['ticket_type_id'], event=event)
        except TicketType.DoesNotExist:
            raise serializers.ValidationError({'ticket_type_id': 'Ticket type not found.'})

        if not ticket_type.is_available:
            raise serializers.ValidationError({'ticket_type_id': 'This ticket type is not available.'})

        if data['quantity'] > ticket_type.available_count:
            raise serializers.ValidationError(
                {'quantity': f'Only {ticket_type.available_count} tickets available.'}
            )

        if data['quantity'] > ticket_type.max_per_booking:
            raise serializers.ValidationError(
                {'quantity': f'Maximum {ticket_type.max_per_booking} tickets per booking.'}
            )

        data['event'] = event
        data['ticket_type'] = ticket_type
        return data
