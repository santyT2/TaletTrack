from django.shortcuts import render
from django.utils import timezone
from datetime import date
from employees.models import Empleado, Sucursal
from attendance.models import RegistroAsistencia
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import Empresa, Usuario
from .serializers import (
    EmpresaSerializer,
    UsuarioListSerializer,
    UsuarioDetailSerializer,
    UsuarioUpdateSerializer,
    PasswordResetSerializer,
)
from .permissions import IsSuperAdminOrReadOnly, IsSuperAdmin

def home(request):
    # Datos para las tarjetas de resumen
    total_empleados = Empleado.objects.filter(estado='activo').count()
    total_sucursales = Sucursal.objects.count()

    # Asistencia de hoy
    hoy = timezone.now().date()
    registros_hoy = RegistroAsistencia.objects.filter(fecha_hora__date=hoy)

    asistencia_hoy = registros_hoy.filter(tipo='ENTRADA').count()
    atrasos_hoy = registros_hoy.filter(tipo='ENTRADA', es_tardanza=True).count()
    faltas_hoy = total_empleados - asistencia_hoy

    # Solicitudes pendientes (por ahora simulado)
    solicitudes_pendientes = 0  # TODO: implementar cuando haya sistema de solicitudes

    # Actividad reciente (simulada por ahora)
    actividades_recientes = [
        {
            'titulo': 'Nuevo empleado registrado',
            'descripcion': 'Juan Pérez se unió al equipo',
            'fecha': 'Hace 2 horas',
            'color': 'success'
        },
        {
            'titulo': 'Reporte de asistencia generado',
            'descripcion': 'Nómina del mes generada',
            'fecha': 'Hace 4 horas',
            'color': 'info'
        },
        {
            'titulo': 'Actualización de datos',
            'descripcion': 'Información de empleados actualizada',
            'fecha': 'Hace 1 día',
            'color': 'warning'
        }
    ]

    context = {
        'total_empleados': total_empleados,
        'total_sucursales': total_sucursales,
        'asistencia_hoy': asistencia_hoy,
        'atrasos_hoy': atrasos_hoy,
        'faltas_hoy': faltas_hoy,
        'solicitudes_pendientes': solicitudes_pendientes,
        'actividades_recientes': actividades_recientes,
    }

    return render(request, 'core/dashboard.html', context)


class EmpresaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar la empresa (Singleton Pattern).
    GET: Ver datos de la empresa.
    PUT/PATCH: Actualizar datos corporativos.
    Solo debe existir una empresa principal.
    """
    
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def list(self, request, *args, **kwargs):
        """Devuelve la empresa principal (primera instancia)."""
        empresa = Empresa.objects.first()
        if not empresa:
            return Response(
                {"detail": "No hay empresa configurada. Contacte al administrador."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(empresa)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None, *args, **kwargs):
        """Devuelve la empresa principal sin importar el ID."""
        empresa = Empresa.objects.first()
        if not empresa:
            return Response(
                {"detail": "No hay empresa configurada."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(empresa)
        return Response(serializer.data)
    
    def update(self, request, pk=None, *args, **kwargs):
        """Actualiza la empresa principal."""
        empresa = Empresa.objects.first()
        if not empresa:
            return Response(
                {"detail": "No hay empresa configurada."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(empresa, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
    
    def partial_update(self, request, pk=None, *args, **kwargs):
        """Actualización parcial de la empresa."""
        kwargs['partial'] = True
        return self.update(request, pk, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """No permitir crear más empresas si ya existe una."""
        if Empresa.objects.exists():
            return Response(
                {"detail": "Ya existe una empresa configurada. Use PUT para actualizarla."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)
    
    def destroy(self, request, pk=None, *args, **kwargs):
        """No permitir eliminar la empresa principal."""
        return Response(
            {"detail": "No se puede eliminar la empresa principal."},
            status=status.HTTP_403_FORBIDDEN
        )


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar usuarios del sistema.
    Permite ver, editar roles, activar/desactivar cuentas.
    """
    
    queryset = Usuario.objects.select_related('empleado').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UsuarioListSerializer
        elif self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        return UsuarioDetailSerializer
    
    def get_queryset(self):
        """Filtrar usuarios según permisos."""
        queryset = super().get_queryset()
        
        # SuperAdmin ve todos los usuarios
        if self.request.user.role == 'SUPERADMIN':
            return queryset
        
        # ADMIN_RRHH ve solo empleados y managers
        elif self.request.user.role == 'ADMIN_RRHH':
            return queryset.exclude(role='SUPERADMIN')
        
        # Otros solo ven su propio perfil
        else:
            return queryset.filter(id=self.request.user.id)
    
    def list(self, request, *args, **kwargs):
        """Lista usuarios con paginación."""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filtros opcionales
        role = request.query_params.get('role')
        is_active = request.query_params.get('is_active')
        search = request.query_params.get('search')
        
        if role:
            queryset = queryset.filter(role=role)
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        if search:
            queryset = queryset.filter(
                username__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def update(self, request, pk=None, *args, **kwargs):
        """Actualizar rol y estado de usuario."""
        usuario = self.get_object()
        
        # Solo SUPERADMIN puede editar otros SUPERADMIN
        if usuario.role == 'SUPERADMIN' and request.user.role != 'SUPERADMIN':
            return Response(
                {"detail": "No tiene permisos para editar este usuario."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, pk, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[IsSuperAdmin])
    def reset_password(self, request, pk=None):
        """Resetea la contraseña de un usuario (solo SuperAdmin)."""
        usuario = self.get_object()
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Establecer nueva contraseña
        new_password = serializer.validated_data['new_password']
        usuario.set_password(new_password)
        usuario.must_change_password = True
        usuario.save(update_fields=['password', 'must_change_password'])
        
        return Response(
            {"detail": f"Contraseña reseteada para {usuario.username}. Debe cambiarla en el primer login."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Activa o desactiva un usuario."""
        usuario = self.get_object()
        
        # Solo SUPERADMIN puede editar otros SUPERADMIN
        if usuario.role == 'SUPERADMIN' and request.user.role != 'SUPERADMIN':
            return Response(
                {"detail": "No tiene permisos para modificar este usuario."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        usuario.is_active = not usuario.is_active
        usuario.save(update_fields=['is_active'])
        
        return Response(
            {
                "detail": f"Usuario {'activado' if usuario.is_active else 'desactivado'} correctamente.",
                "is_active": usuario.is_active
            },
            status=status.HTTP_200_OK
        )
