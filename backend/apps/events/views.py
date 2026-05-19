from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils.text import slugify
from django.db import models
import uuid
from apps.core.mixins import ResponseMixin
from apps.core.permissions import IsAdmin
from .models import Category, Event, TicketType, EventImage
from .serializers import (
    CategorySerializer, EventListSerializer, EventDetailSerializer,
    EventCreateUpdateSerializer, TicketTypeSerializer, EventImageSerializer
)
from .filters import EventFilter


class CategoryListView(ResponseMixin, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return self.success_response(data=serializer.data)


class EventListView(ResponseMixin, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = EventListSerializer
    filterset_class = EventFilter
    search_fields = ['title', 'description', 'venue', 'city', 'tags']
    ordering_fields = ['start_date', 'created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        return Event.objects.filter(status='published').select_related('category').prefetch_related('ticket_types')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True, context={'request': request})
        paginated = self.get_paginated_response(serializer.data)
        return self.success_response(data=paginated.data)


class EventDetailView(ResponseMixin, generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = EventDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Event.objects.filter(status='published').select_related('category').prefetch_related(
            'ticket_types', 'images'
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return self.success_response(data=serializer.data)


class FeaturedEventsView(ResponseMixin, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = EventListSerializer

    def get_queryset(self):
        return Event.objects.filter(status='published', is_featured=True).select_related('category').prefetch_related('ticket_types')[:8]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return self.success_response(data=serializer.data)


class TrendingEventsView(ResponseMixin, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = EventListSerializer

    def get_queryset(self):
        return Event.objects.filter(status='published', is_trending=True).select_related('category').prefetch_related('ticket_types')[:8]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return self.success_response(data=serializer.data)


class RelatedEventsView(ResponseMixin, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = EventListSerializer

    def get_queryset(self):
        slug = self.kwargs['slug']
        try:
            event = Event.objects.get(slug=slug, status='published')
            return Event.objects.filter(
                status='published',
                category=event.category
            ).exclude(slug=slug).select_related('category').prefetch_related('ticket_types')[:4]
        except Event.DoesNotExist:
            return Event.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return self.success_response(data=serializer.data)


# Admin Views
class AdminEventListCreateView(ResponseMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_class = EventFilter
    search_fields = ['title', 'venue', 'city']
    ordering_fields = ['start_date', 'created_at', 'status']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateUpdateSerializer
        return EventListSerializer

    def get_queryset(self):
        return Event.objects.all().select_related('category').prefetch_related('ticket_types')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = EventListSerializer(page, many=True, context={'request': request})
        paginated = self.get_paginated_response(serializer.data)
        return self.success_response(data=paginated.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        slug = slugify(serializer.validated_data.get('title', ''))
        if Event.objects.filter(slug=slug).exists():
            slug = f'{slug}-{str(uuid.uuid4())[:8]}'
        serializer.validated_data['slug'] = slug
        serializer.validated_data['created_by'] = request.user

        event = serializer.save()
        return self.success_response(
            data=EventDetailSerializer(event, context={'request': request}).data,
            message='Event created successfully',
            status_code=status.HTTP_201_CREATED
        )


class AdminEventDetailView(ResponseMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Event.objects.all().select_related('category').prefetch_related('ticket_types', 'images')
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return EventCreateUpdateSerializer
        return EventDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        serializer = EventDetailSerializer(self.get_object(), context={'request': request})
        return self.success_response(data=serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        return self.success_response(
            data=EventDetailSerializer(event, context={'request': request}).data,
            message='Event updated successfully'
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return self.success_response(message='Event deleted successfully')


class AdminTicketTypeView(ResponseMixin, generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = TicketTypeSerializer

    def create(self, request, *args, **kwargs):
        event_id = kwargs.get('event_id')
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return self.error_response('Event not found.', status_code=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(event=event)
        return self.success_response(
            data=serializer.data,
            message='Ticket type created',
            status_code=status.HTTP_201_CREATED
        )


class AdminEventImageView(ResponseMixin, generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = EventImageSerializer
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        event_id = kwargs.get('event_id')
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return self.error_response('Event not found.', status_code=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(event=event)
        return self.success_response(
            data=serializer.data,
            message='Image uploaded',
            status_code=status.HTTP_201_CREATED
        )
