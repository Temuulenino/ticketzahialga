from django.urls import path
from .views import (
    CategoryListView, EventListView, EventDetailView,
    FeaturedEventsView, TrendingEventsView, RelatedEventsView,
    AdminEventListCreateView, AdminEventDetailView,
    AdminTicketTypeView, AdminEventImageView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', EventListView.as_view(), name='event-list'),
    path('featured/', FeaturedEventsView.as_view(), name='featured-events'),
    path('trending/', TrendingEventsView.as_view(), name='trending-events'),
    path('<slug:slug>/', EventDetailView.as_view(), name='event-detail'),
    path('<slug:slug>/related/', RelatedEventsView.as_view(), name='related-events'),

    # Admin endpoints
    path('admin/list/', AdminEventListCreateView.as_view(), name='admin-event-list'),
    path('admin/<uuid:id>/', AdminEventDetailView.as_view(), name='admin-event-detail'),
    path('admin/<uuid:event_id>/tickets/', AdminTicketTypeView.as_view(), name='admin-ticket-type'),
    path('admin/<uuid:event_id>/images/', AdminEventImageView.as_view(), name='admin-event-images'),
]
