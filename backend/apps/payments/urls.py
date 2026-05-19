from django.urls import path
from .views import (
    UploadPaymentView, UserPaymentListView,
    AdminPaymentListView, AdminReviewPaymentView
)

urlpatterns = [
    path('upload/', UploadPaymentView.as_view(), name='upload-payment'),
    path('my/', UserPaymentListView.as_view(), name='user-payment-list'),
    path('admin/list/', AdminPaymentListView.as_view(), name='admin-payment-list'),
    path('admin/<uuid:payment_id>/review/', AdminReviewPaymentView.as_view(), name='admin-review-payment'),
]
