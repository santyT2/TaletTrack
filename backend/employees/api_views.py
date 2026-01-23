from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from .models import (
    Empleado, Sucursal, Contrato, SolicitudAusencia,
    Cargo, Contract, LeaveRequest, OnboardingTask,
)
from .serializers import (
    EmpleadoListSerializer,
    EmpleadoDetailSerializer,
    EmpleadoSerializer,
    SucursalSerializer,
    CargoSerializer,
    ContractSerializer,
    LeaveRequestSerializer,
    OnboardingTaskSerializer,
    OrganigramNodeSerializer
)


class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer
    permission_classes = [IsAuthenticated]


class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = [IsAuthenticated]


class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EmpleadoListSerializer
        elif self.action == 'retrieve':
            return EmpleadoDetailSerializer
        return EmpleadoSerializer
    
    def get_queryset(self):
        queryset = Empleado.objects.select_related('cargo', 'sucursal', 'reports_to')
        
        # Filtros opcionales
        estado = self.request.query_params.get('estado', None)
        sucursal = self.request.query_params.get('sucursal', None)
        cargo = self.request.query_params.get('cargo', None)
        
        if estado:
            queryset = queryset.filter(estado=estado)
        if sucursal:
            queryset = queryset.filter(sucursal_id=sucursal)
        if cargo:
            queryset = queryset.filter(cargo_id=cargo)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def subordinates(self, request, pk=None):
        """Obtener subordinados directos de un empleado"""
        employee = self.get_object()
        subordinates = employee.subordinados.filter(estado='activo')
        serializer = EmpleadoListSerializer(subordinates, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contracts(self, request, pk=None):
        """Obtener contratos de un empleado"""
        employee = self.get_object()
        contracts = employee.contracts.all().order_by('-start_date')
        serializer = ContractSerializer(contracts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def leave_requests(self, request, pk=None):
        """Obtener solicitudes de permisos de un empleado"""
        employee = self.get_object()
        requests = employee.leave_requests.all().order_by('-created_at')
        serializer = LeaveRequestSerializer(requests, many=True)
        return Response(serializer.data)


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Contract.objects.select_related('employee')
        
        # Filtrar solo activos si se especifica
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filtrar contratos por vencer
        expiring_soon = self.request.query_params.get('expiring_soon', None)
        if expiring_soon == 'true':
            today = timezone.now().date()
            expiry_date = today + timedelta(days=30)
            queryset = queryset.filter(
                is_active=True,
                end_date__isnull=False,
                end_date__lte=expiry_date,
                end_date__gte=today
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Contratos que vencen en los próximos 30 días"""
        today = timezone.now().date()
        expiry_date = today + timedelta(days=30)
        
        contracts = Contract.objects.filter(
            is_active=True,
            end_date__isnull=False,
            end_date__lte=expiry_date,
            end_date__gte=today
        ).select_related('employee')
        
        serializer = self.get_serializer(contracts, many=True)
        return Response(serializer.data)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = LeaveRequest.objects.select_related('employee')
        
        # Filtrar por empleado
        employee_id = self.request.query_params.get('employee', None)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprobar una solicitud de permiso"""
        leave_request = self.get_object()
        leave_request.status = 'approved'
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Rechazar una solicitud de permiso"""
        leave_request = self.get_object()
        leave_request.status = 'rejected'
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Solicitudes pendientes de aprobación"""
        pending_requests = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)


class OnboardingTaskViewSet(viewsets.ModelViewSet):
    queryset = OnboardingTask.objects.all()
    serializer_class = OnboardingTaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = OnboardingTask.objects.select_related('employee')
        
        # Filtrar por empleado
        employee_id = self.request.query_params.get('employee', None)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        return queryset.order_by('is_completed', 'due_date')
    
    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        """Marcar tarea como completada/no completada"""
        task = self.get_object()
        task.is_completed = not task.is_completed
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)


# ==================== ENDPOINTS ESPECIALES ====================

@api_view(['GET'])
def kpi_dashboard(request):
    """
    Endpoint especial para KPIs del dashboard
    Retorna métricas agregadas del sistema
    """
    try:
        # 1. Headcount por puesto
        headcount_by_department = list(
            Empleado.objects
            .filter(estado='activo')
            .values('cargo__nombre')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        headcount_data = [
            {
                'department': item['cargo__nombre'] or 'Sin cargo',
                'count': item['count']
            }
            for item in headcount_by_department
        ]
        
        # 2. Headcount por sucursal
        headcount_by_branch = list(
            Empleado.objects
            .filter(estado='activo')
            .values('sucursal__nombre')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        branch_data = [
            {
                'branch': item['sucursal__nombre'],
                'count': item['count']
            }
            for item in headcount_by_branch
        ]
        
        # 3. Total de empleados activos
        total_employees = Empleado.objects.filter(estado='activo').count()
        
        # 4. Retention rate (simplificado)
        # Empleados con más de 1 año / Total empleados
        one_year_ago = timezone.now().date() - timedelta(days=365)
        long_term_employees = Empleado.objects.filter(
            estado='activo',
            fecha_ingreso__lte=one_year_ago
        ).count()
        
        retention_rate = (long_term_employees / total_employees * 100) if total_employees > 0 else 0
        
        # 5. Solicitudes pendientes
        pending_leaves_count = SolicitudAusencia.objects.filter(estado='pendiente').count()
        
        # 6. Onboarding progress (empleados del mes actual)
        current_month_start = timezone.now().date().replace(day=1)
        new_employees = Empleado.objects.filter(
            fecha_ingreso__gte=current_month_start,
            estado='activo'
        )
        
        total_tasks = OnboardingTask.objects.filter(
            employee__in=new_employees
        ).count()
        
        completed_tasks = OnboardingTask.objects.filter(
            employee__in=new_employees,
            is_completed=True
        ).count()
        
        onboarding_progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # 7. Nuevos empleados este mes
        new_hires_this_month = new_employees.count()
        
        # 8. Contratos por vencer (próximos 30 días)
        today = timezone.now().date()
        expiry_date = today + timedelta(days=30)
        expiring_contracts = Contrato.objects.filter(
            estado='activo',
            fecha_fin__isnull=False,
            fecha_fin__lte=expiry_date,
            fecha_fin__gte=today
        ).count()
        
        # 9. Cumpleaños del mes
        current_month = timezone.now().month
        birthdays_this_month = Empleado.objects.filter(
            estado='activo',
            fecha_nacimiento__month=current_month
        ).values('id', 'nombres', 'apellidos', 'fecha_nacimiento', 'foto_url').order_by('fecha_nacimiento__day')
        
        # Formatear cumpleaños
        birthday_list = [
            {
                'id': emp['id'],
                'name': f"{emp['nombres']} {emp['apellidos']}",
                'date': emp['fecha_nacimiento'],
                'photo': emp['foto_url']
            }
            for emp in birthdays_this_month
        ]
        
        # 10. Distribución por estado
        employees_by_status = list(
            Empleado.objects
            .values('estado')
            .annotate(count=Count('id'))
        )
        
        status_data = [
            {
                'status': item['estado'],
                'count': item['count']
            }
            for item in employees_by_status
        ]
        
        # Construir respuesta
        data = {
            'total_employees': total_employees,
            'retention_rate': round(retention_rate, 2),
            'pending_leaves_count': pending_leaves_count,
            'onboarding_progress': round(onboarding_progress, 2),
            'new_hires_this_month': new_hires_this_month,
            'expiring_contracts': expiring_contracts,
            'headcount_by_department': headcount_data,
            'headcount_by_branch': branch_data,
            'birthdays_this_month': birthday_list,
            'employees_by_status': status_data,
        }
        
        return Response(data)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def organigram(request):
    """
    Endpoint para obtener el organigrama de la empresa
    Retorna estructura anidada de empleados
    """
    try:
        # Obtener empleados de nivel superior (sin jefe)
        top_level_employees = Empleado.objects.filter(
            manager__isnull=True,
            estado='activo'
        ).select_related('cargo')
        
        serializer = OrganigramNodeSerializer(top_level_employees, many=True)
        
        return Response({
            'organization': serializer.data,
            'total_employees': Empleado.objects.filter(estado='activo').count()
        })
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
