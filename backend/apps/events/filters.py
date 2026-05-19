import django_filters
from django.db import models as db_models
from .models import Event


class EventFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    city = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.UUIDFilter(field_name='category__id')
    category_type = django_filters.CharFilter(field_name='category__type')
    status = django_filters.CharFilter()
    is_featured = django_filters.BooleanFilter()
    is_trending = django_filters.BooleanFilter()
    start_date_from = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='lte')
    min_price = django_filters.NumberFilter(method='filter_min_price')
    max_price = django_filters.NumberFilter(method='filter_max_price')

    class Meta:
        model = Event
        fields = ['title', 'city', 'category', 'category_type', 'status',
                  'is_featured', 'is_trending', 'start_date_from', 'start_date_to']

    def filter_min_price(self, queryset, name, value):
        return queryset.filter(ticket_types__price__gte=value).distinct()

    def filter_max_price(self, queryset, name, value):
        return queryset.filter(ticket_types__price__lte=value).distinct()
