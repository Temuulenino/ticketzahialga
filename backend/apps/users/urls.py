from django.urls import path
from .views import UserProfileView, ChangePasswordView, AdminUserListView, AdminUserDetailView

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('admin/list/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/<uuid:id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
