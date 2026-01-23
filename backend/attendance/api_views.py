from rest_framework import viewsets, permissions
from .models import RegistroAsistencia
from .serializers import RegistroAsistenciaSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado:
    - Lectura (GET, HEAD, OPTIONS) permitida para usuarios autenticados.
    - Escritura (POST, PUT, DELETE) solo para usuarios Staff (Admin).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff

class RegistroAsistenciaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y gestionar registros de asistencia.
    """
    queryset = RegistroAsistencia.objects.all().order_by('-fecha_hora')
    serializer_class = RegistroAsistenciaSerializer
    permission_classes = [IsAdminOrReadOnly]
