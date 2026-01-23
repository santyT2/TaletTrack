# employees/views.py - VERSIÓN API PURA (HEADLESS)
# ========================================================
# Solo ViewSets de Django REST Framework
# Sin render(), TemplateView, ListView - SOLO JSON
# ========================================================

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from core.models import Empresa
from .models import (
    Sucursal, Empleado, Contrato, DocumentoEmpleado,
    TipoAusencia, SolicitudAusencia, SaldoVacaciones, KPI, ResultadoKPI,
    Cargo, Contract, LeaveRequest, OnboardingTask,
)
from .serializers import (
    EmpresaSerializer, SucursalSerializer, EmpleadoSerializer,
    ContratoSerializer, DocumentoEmpleadoSerializer,
    TipoAusenciaSerializer, SolicitudAusenciaSerializer, SaldoVacacionesSerializer,
    KPISerializer, ResultadoKPISerializer,
    CargoSerializer, ContractSerializer, LeaveRequestSerializer, OnboardingTaskSerializer,
)


class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['razon_social', 'nombre_comercial', 'ruc_nit']
    ordering_fields = ['razon_social', 'creada_el']
    ordering = ['razon_social']


class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.select_related('empresa', 'cargo', 'sucursal', 'manager').all()
    serializer_class = EmpleadoSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['empresa', 'estado', 'cargo', 'sucursal']
    search_fields = ['nombres', 'apellidos', 'documento', 'email']
    ordering_fields = ['apellidos', 'fecha_ingreso', 'created_at']
    ordering = ['apellidos', 'nombres']

    @action(detail=True, methods=['get'])
    def subordinados(self, request, pk=None):
        empleado = self.get_object()
        qs = empleado.subordinados.filter(estado='activo')
        return Response(EmpleadoSerializer(qs, many=True).data)


class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.select_related('empresa', 'padre').all()
    serializer_class = SucursalSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'ciudad', 'empresa__nombre_comercial']
    ordering_fields = ['nombre', 'ciudad']
    ordering = ['nombre']

    @action(detail=True, methods=['get'])
    def empleados(self, request, pk=None):
        """
        Endpoint personalizado: GET /api/employees/api/sucursales/{id}/empleados/
        Retorna todos los empleados de una sucursal específica.
        """
        sucursal = self.get_object()
        empleados = sucursal.empleados.filter(estado='activo')
        serializer = EmpleadoSerializer(empleados, many=True)
        return Response(serializer.data)


class PuestoViewSet(viewsets.ModelViewSet):
    """Alias de cargos para mantener la ruta /puestos sin modelo duplicado."""

    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'salario_base', 'nivel_requerido']
    ordering = ['nombre']

    @action(detail=True, methods=['get'])
    def empleados(self, request, pk=None):
        cargo = self.get_object()
        empleados = cargo.empleados.filter(estado='activo') if hasattr(cargo, 'empleados') else []
        return Response(EmpleadoSerializer(empleados, many=True).data)


class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.select_related('empleado').all()
    serializer_class = ContratoSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['empleado', 'tipo', 'estado']
    ordering_fields = ['fecha_inicio', 'fecha_fin', 'created_at']
    ordering = ['-fecha_inicio']


class DocumentoEmpleadoViewSet(viewsets.ModelViewSet):
    queryset = DocumentoEmpleado.objects.select_related('empleado').all()
    serializer_class = DocumentoEmpleadoSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['empleado', 'tipo', 'vigente']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class TipoAusenciaViewSet(viewsets.ModelViewSet):
    queryset = TipoAusencia.objects.all()
    serializer_class = TipoAusenciaSerializer
    permission_classes = [AllowAny]


class SolicitudAusenciaViewSet(viewsets.ModelViewSet):
    queryset = SolicitudAusencia.objects.select_related('empleado', 'tipo_ausencia').all()
    serializer_class = SolicitudAusenciaSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['empleado', 'estado', 'tipo_ausencia']
    ordering_fields = ['fecha_inicio', 'created_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        solicitud = self.get_object()
        solicitud.estado = 'aprobado'
        solicitud.save()
        return Response(self.get_serializer(solicitud).data)

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        solicitud = self.get_object()
        solicitud.estado = 'rechazado'
        solicitud.save()
        return Response(self.get_serializer(solicitud).data)


class SaldoVacacionesViewSet(viewsets.ModelViewSet):
    queryset = SaldoVacaciones.objects.select_related('empleado').all()
    serializer_class = SaldoVacacionesSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['empleado', 'periodo']
    ordering_fields = ['periodo']
    ordering = ['-periodo']


class KPIViewSet(viewsets.ModelViewSet):
    queryset = KPI.objects.all()
    serializer_class = KPISerializer
    permission_classes = [AllowAny]


class ResultadoKPIViewSet(viewsets.ModelViewSet):
    queryset = ResultadoKPI.objects.select_related('empleado', 'kpi').all()
    serializer_class = ResultadoKPISerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['empleado', 'kpi', 'periodo']
    ordering_fields = ['periodo', 'created_at']
    ordering = ['-periodo']


# ===== LEGACY VIEWSETS (se mantienen) =====

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'salario_base', 'nivel_requerido']
    ordering = ['nombre']

    @action(detail=True, methods=['get'])
    def empleados(self, request, pk=None):
        cargo = self.get_object()
        empleados = cargo.empleados.filter(estado='activo') if hasattr(cargo, 'empleados') else []
        serializer = EmpleadoSerializer(empleados, many=True)
        return Response(serializer.data)


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.select_related('employee').all()
    serializer_class = ContractSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'contract_type', 'is_active']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related('employee').all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'leave_type', 'status']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        leave_request.status = 'approved'
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        leave_request.status = 'rejected'
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)


class OnboardingTaskViewSet(viewsets.ModelViewSet):
    queryset = OnboardingTask.objects.select_related('employee').all()
    serializer_class = OnboardingTaskSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'is_completed']
    ordering_fields = ['due_date', 'created_at']
    ordering = ['due_date']

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.is_completed = True
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
