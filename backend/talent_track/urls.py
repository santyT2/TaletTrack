"""
URL configuration for talent_track project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import home
from core.api import LoginWithProfileView, ChangePasswordInitialView
from rest_framework.routers import DefaultRouter
from employees.views import ContractViewSet, PayrollPreviewView
from attendance.views import WorkShiftViewSet

router = DefaultRouter()
router.register(r'contracts', ContractViewSet, basename='contracts')
router.register(r'shifts', WorkShiftViewSet, basename='shifts')

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # Rutas de la API REST para el frontend React (sin namespace)
    path('api/employees/', include('employees.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/leaves/', include('leaves.urls')),
    path('api/hr/payroll-preview/', PayrollPreviewView.as_view(), name='payroll-preview'),
    path('api/auth/login/', LoginWithProfileView.as_view(), name='login-with-profile'),
    path('api/auth/change-password-initial/', ChangePasswordInitialView.as_view(), name='change-password-initial'),
    
    # Rutas tradicionales de Django (HTML) - con namespace
    path('empleados/', include(('employees.urls', 'employees'), namespace='employees-legacy')),
    path('asistencia/', include(('attendance.urls', 'attendance'), namespace='attendance-legacy')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
