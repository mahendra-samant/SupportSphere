from django.urls import path

from .views import (
    LoginAPIView,
    RegisterAPIView,
    UserListCreateAPIView,
    CustomerListCreateAPIView,
    CustomerDetailAPIView,
)

urlpatterns = [
    path("auth/register/", RegisterAPIView.as_view(), name="auth-register"),
    path("auth/login/", LoginAPIView.as_view(), name="auth-login"),
    path("users/", UserListCreateAPIView.as_view(), name="user-list-create"),
    # Customer Management
    path(
        "customers/",
        CustomerListCreateAPIView.as_view(),
        name="customer-list",
    ),
    path(
        "customers/<int:pk>/",
        CustomerDetailAPIView.as_view(),
        name="customer-detail",
    ),
]
