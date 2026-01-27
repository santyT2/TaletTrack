from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import LeaveRequestViewSet

app_name = "leaves"

router = DefaultRouter()
router.register(r"requests", LeaveRequestViewSet, basename="leave-requests")

urlpatterns = [
    path("", include(router.urls)),
]
