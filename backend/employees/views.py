# employees/views.py - VERSIÓN API PURA (HEADLESS)
# ========================================================
# Solo ViewSets de Django REST Framework
# Sin render(), TemplateView, ListView - SOLO JSON
# ========================================================

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import time, datetime, date
from calendar import monthrange
from django.db.models import Sum
from django.db.models.functions import Coalesce

from core.models import Empresa
from .models import (
    Sucursal, Empleado, Contrato, DocumentoEmpleado,
    TipoAusencia, SolicitudAusencia, SaldoVacaciones, KPI, ResultadoKPI,
    Cargo, Contract, LeaveRequest, OnboardingTask,
)
from attendance.models import RegistroAsistencia, Turno
from employees.services.payroll import PayrollCalculator
from .serializers import (
    EmpresaSerializer, SucursalSerializer, EmpleadoSerializer,
    ContratoSerializer, DocumentoEmpleadoSerializer,
    TipoAusenciaSerializer, SolicitudAusenciaSerializer, SaldoVacacionesSerializer,
    KPISerializer, ResultadoKPISerializer, EmployeePortalSerializer,
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


class EmployeePortalViewSet(viewsets.ViewSet):
    """Endpoints del portal del empleado (autenticado)."""

    permission_classes = [IsAuthenticated]

    def _get_empleado(self, request):
        user = request.user
        # 1) relación directa OneToOne
        if hasattr(user, "empleado") and user.empleado:
            return user.empleado
        # 2) búsqueda por FK user
        emp = Empleado.objects.filter(user=user).first()
        if emp:
            return emp
        # 3) fallback por correo o username
        if user.email:
            emp = Empleado.objects.filter(email=user.email).first()
            if emp:
                return emp
        return Empleado.objects.filter(email=user.username).first()

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        emp = self._get_empleado(request)
        if not emp:
            return Response({"detail": "No se encontró empleado vinculado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = EmployeePortalSerializer(emp)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="dashboard-stats")
    def dashboard_stats(self, request):
        emp = self._get_empleado(request)
        if not emp:
            return Response({"detail": "No se encontró empleado vinculado."}, status=status.HTTP_404_NOT_FOUND)

        hoy = timezone.now().date()
        first_month_day = hoy.replace(day=1)
        regs_mes = RegistroAsistencia.objects.filter(empleado=emp, fecha_hora__date__gte=first_month_day)
        dias_con_marca = regs_mes.filter(tipo='ENTRADA').values_list('fecha_hora__date', flat=True).distinct().count()
        dias_transcurridos = (hoy - first_month_day).days + 1
        asistencia_pct = round((dias_con_marca / dias_transcurridos) * 100, 2) if dias_transcurridos else 0

        onboarding_qs = OnboardingTask.objects.filter(employee=emp, is_completed=False)
        onboarding_pendientes = onboarding_qs.count()

        saldo_vac = emp.saldos_vacaciones.order_by('-periodo').first()
        dias_vac = float(saldo_vac.dias_disponibles) if saldo_vac else 0.0

        # Puntualidad: porcentaje de entradas sin tardanza
        entradas_mes = regs_mes.filter(tipo='ENTRADA')
        total_entradas = entradas_mes.count()
        puntuales = entradas_mes.filter(es_tardanza=False).count()
        attendance_score = round((puntuales / total_entradas) * 100, 2) if total_entradas else 0

        # Próximo turno: usar turno de contrato activo
        contrato = emp.contract if hasattr(emp, "contract") else None
        legacy_contract = emp.contratos.filter(estado='activo').order_by('-fecha_inicio').first()
        turno = getattr(emp, "current_shift", None)
        if not turno and legacy_contract and legacy_contract.contrato_turno:
            turno = legacy_contract.contrato_turno
        next_shift = None
        if turno:
            next_shift = {
                "nombre": getattr(turno, "name", None) or getattr(turno, "nombre", None),
                "hora_inicio": getattr(turno, "start_time", None) or getattr(turno, "hora_inicio", None),
                "hora_fin": getattr(turno, "end_time", None) or getattr(turno, "hora_fin", None),
            }

        pending_tasks = [
            {
                "id": t.id,
                "description": t.description or t.title,
                "due_date": t.due_date,
            }
            for t in onboarding_qs[:10]
        ]

        data = {
            "asistencia_mes_pct": asistencia_pct,
            "attendance_score": attendance_score,
            "onboarding_pendientes": onboarding_pendientes,
            "pending_tasks": pending_tasks,
            "vacaciones_disponibles": dias_vac,
            "next_shift": next_shift,
        }
        return Response(data)

    @action(detail=False, methods=["post"], url_path="mark")
    def mark(self, request):
        emp = self._get_empleado(request)
        if not emp:
            return Response({"detail": "No se encontró empleado vinculado."}, status=status.HTTP_403_FORBIDDEN)

        tipo = request.data.get('tipo', 'ENTRADA')
        latitud = request.data.get('latitud')
        longitud = request.data.get('longitud')

        hoy = timezone.now().date()
        registros_hoy = RegistroAsistencia.objects.filter(empleado=emp, fecha_hora__date=hoy)

        if tipo == 'ENTRADA' and registros_hoy.filter(tipo='ENTRADA').exists():
            return Response({"detail": "Ya marcaste entrada hoy."}, status=status.HTTP_400_BAD_REQUEST)
        if tipo == 'SALIDA':
            if not registros_hoy.filter(tipo='ENTRADA').exists():
                return Response({"detail": "Marca entrada antes de salida."}, status=status.HTTP_400_BAD_REQUEST)
            if registros_hoy.filter(tipo='SALIDA').exists():
                return Response({"detail": "Ya marcaste salida hoy."}, status=status.HTTP_400_BAD_REQUEST)

        es_tardanza = False
        minutos_atraso = 0
        if tipo == 'ENTRADA':
            hora_limite = time(9, 0)
            ahora = timezone.localtime().time()
            if ahora > hora_limite:
                es_tardanza = True
                t_lim = datetime.combine(hoy, hora_limite)
                t_now = datetime.combine(hoy, ahora)
                minutos_atraso = int((t_now - t_lim).total_seconds() / 60)

        registro = RegistroAsistencia.objects.create(
            empleado=emp,
            tipo=tipo,
            latitud=latitud,
            longitud=longitud,
            es_tardanza=es_tardanza,
            minutos_atraso=minutos_atraso,
        )

        return Response(
            {
                "detail": f"Marcación registrada: {tipo}",
                "registro": {
                    "id": registro.id,
                    "tipo": registro.tipo,
                    "fecha_hora": registro.fecha_hora,
                    "es_tardanza": registro.es_tardanza,
                    "minutos_atraso": registro.minutos_atraso,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class PayrollPreviewView(APIView):
    """Calcula pre-nómina simple para HR."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = int(request.query_params.get("month", timezone.now().month))
        year = int(request.query_params.get("year", timezone.now().year))

        start = date(year, month, 1)
        last_day = monthrange(year, month)[1]
        end = date(year, month, last_day)
        calculator = PayrollCalculator(start, end)
        payload = calculator.calculate()

        return Response({
            "month": month,
            "year": year,
            "results": payload.get("results", []),
            "issues": payload.get("issues", []),
        })


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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.validated_data["employee"]

        # Si el empleado ya tiene contrato, lo actualizamos para mantener unicidad y salario sincronizado
        existing = Contract.objects.filter(employee=employee).first()
        if existing:
            for field, value in serializer.validated_data.items():
                setattr(existing, field, value)
            existing.save()
            refreshed = self.get_serializer(existing)
            return Response(refreshed.data, status=status.HTTP_200_OK)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


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
