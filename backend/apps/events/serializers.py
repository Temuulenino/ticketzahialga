from rest_framework import serializers
from .models import Category, Event, TicketType, EventImage


class CategorySerializer(serializers.ModelSerializer):
    event_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'type', 'description', 'icon', 'color', 'event_count']

    def get_event_count(self, obj):
        return obj.events.filter(status='published').count()


class EventImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = EventImage
        fields = ['id', 'image_url', 'caption', 'order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class TicketTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketType
        fields = ['id', 'name', 'description', 'price', 'currency',
                  'total_count', 'sold_count', 'available_count', 'max_per_booking',
                  'is_active', 'is_available', 'sale_start', 'sale_end']
        read_only_fields = ['sold_count', 'available_count', 'is_available']


class EventListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    poster_url = serializers.SerializerMethodField()
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    min_price = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'slug', 'short_description', 'category',
                  'venue', 'city', 'start_date', 'end_date', 'poster_url',
                  'status', 'is_featured', 'is_trending', 'ticket_types',
                  'min_price', 'total_capacity', 'available_tickets']

    def get_poster_url(self, obj):
        request = self.context.get('request')
        if obj.poster and request:
            return request.build_absolute_uri(obj.poster.url)
        return None

    def get_min_price(self, obj):
        types = obj.ticket_types.filter(is_active=True)
        if types.exists():
            return types.order_by('price').first().price
        return None


class EventDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = EventImageSerializer(many=True, read_only=True)
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    poster_url = serializers.SerializerMethodField()
    banner_url = serializers.SerializerMethodField()
    tags_list = serializers.ReadOnlyField()
    min_price = serializers.SerializerMethodField()
    available_tickets = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'slug', 'description', 'short_description',
                  'category', 'venue', 'venue_address', 'city', 'country',
                  'latitude', 'longitude', 'start_date', 'end_date',
                  'poster_url', 'banner_url', 'images', 'status',
                  'is_featured', 'is_trending', 'tags_list', 'total_capacity',
                  'available_tickets', 'ticket_types', 'min_price', 'created_at']

    def get_poster_url(self, obj):
        request = self.context.get('request')
        if obj.poster and request:
            return request.build_absolute_uri(obj.poster.url)
        return None

    def get_banner_url(self, obj):
        request = self.context.get('request')
        if obj.banner and request:
            return request.build_absolute_uri(obj.banner.url)
        return None

    def get_min_price(self, obj):
        types = obj.ticket_types.filter(is_active=True)
        if types.exists():
            return types.order_by('price').first().price
        return None


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    ticket_types = TicketTypeSerializer(many=True, required=False)

    class Meta:
        model = Event
        fields = ['title', 'slug', 'description', 'short_description', 'category',
                  'venue', 'venue_address', 'city', 'country', 'latitude', 'longitude',
                  'start_date', 'end_date', 'poster', 'banner', 'status',
                  'is_featured', 'is_trending', 'tags', 'total_capacity', 'ticket_types']

    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError({'end_date': 'End date must be after start date.'})
        return data

    def create(self, validated_data):
        ticket_types_data = validated_data.pop('ticket_types', [])
        event = Event.objects.create(**validated_data)
        for tt_data in ticket_types_data:
            TicketType.objects.create(event=event, **tt_data)
        return event

    def update(self, instance, validated_data):
        validated_data.pop('ticket_types', None)
        return super().update(instance, validated_data)
