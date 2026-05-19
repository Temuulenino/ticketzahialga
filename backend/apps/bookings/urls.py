from django.urls import path
from .views import (
    CreateBookingView, UserBookingListView, UserBookingDetailView,
    CancelBookingView, AdminBookingListView, AdminBookingDetailView,
    AdminConfirmBookingView
)

urlpatterns = [
    path('', UserBookingListView.as_view(), name='user-booking-list'),
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    path('<str:reference>/', UserBookingDetailView.as_view(), name='user-booking-detail'),
    path('<str:reference>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),

    # Admin
    path('admin/list/', AdminBookingListView.as_view(), name='admin-booking-list'),
    path('admin/<str:reference>/', AdminBookingDetailView.as_view(), name='admin-booking-detail'),
    path('admin/<str:reference>/confirm/', AdminConfirmBookingView.as_view(), name='admin-confirm-booking'),
]
