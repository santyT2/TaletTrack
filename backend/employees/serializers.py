from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from core.models import Empresa
from .models import (
    Empresa as _Empresa,  # alias for type hints (Empresa lives in core)
    Sucursal, Empleado, Contrato, DocumentoEmpleado,
    TipoAusencia, SolicitudAusencia, SaldoVacaciones,
    KPI, ResultadoKPI,
    Cargo, Contract, LeaveRequest, OnboardingTask,
)
from attendance.models import Turno


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = _Empresa
        fields = '__all__'


class SucursalSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Sucursal
        fields = '__all__'

    def get_employee_count(self, obj):
        return obj.empleados.filter(estado='activo').count()


class EmpleadoListSerializer(serializers.ModelSerializer):
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)
    cargo_nombre = serializers.CharField(source='cargo.nombre', read_only=True)
    puesto_nombre = serializers.SerializerMethodField()
    nombre_completo = serializers.ReadOnlyField()

    class Meta:
        model = Empleado
        fields = [
            'id', 'nombre_completo', 'documento', 'email', 'telefono',
            'cargo_nombre', 'puesto_nombre', 'sucursal_nombre', 'estado', 'fecha_ingreso',
            'foto_url'
        ]

    def get_puesto_nombre(self, obj):
        return obj.cargo.nombre if obj.cargo else None


class EmpleadoDetailSerializer(serializers.ModelSerializer):
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)
    cargo_nombre = serializers.CharField(source='cargo.nombre', read_only=True)
    puesto_nombre = serializers.SerializerMethodField()
    manager_nombre = serializers.CharField(source='manager.nombre_completo', read_only=True)
    subordinates_count = serializers.SerializerMethodField()
    contrato_activo = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = '__all__'

    def get_subordinates_count(self, obj):
        return obj.subordinados.filter(estado='activo').count()

    def get_contrato_activo(self, obj):
        contract = obj.contratos.filter(estado='activo').first()
        if contract:
            return ContratoSerializer(contract).data
        return None

    def get_puesto_nombre(self, obj):
        return obj.cargo.nombre if obj.cargo else None


class EmpleadoSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    full_name = serializers.SerializerMethodField(read_only=True)
    position_name = serializers.SerializerMethodField(read_only=True)
    branch_name = serializers.SerializerMethodField(read_only=True)
    cargo_nombre = serializers.CharField(source='cargo.nombre', read_only=True)
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)
    active_contract = serializers.SerializerMethodField(read_only=True)
    current_shift_name = serializers.CharField(source='current_shift.name', read_only=True, default=None)
    position_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Empleado
        fields = '__all__'
        extra_kwargs = {
            'documento': {'required': False, 'allow_blank': True, 'allow_null': True},
            'cargo': {'required': True, 'allow_null': False},
        }

    def validate(self, attrs):
        cargo = attrs.get('cargo')
        if not cargo:
            raise serializers.ValidationError("Debes seleccionar un cargo")
        return attrs

    def get_full_name(self, obj):
        return obj.nombre_completo

    def get_position_name(self, obj):
        return obj.cargo.nombre if obj.cargo else None

    def get_branch_name(self, obj):
        return obj.sucursal.nombre if obj.sucursal else None

    def get_active_contract(self, obj):
        contract = getattr(obj, "contract", None)
        if contract:
            return {
                "id": contract.id,
                "contract_type": contract.contract_type,
                "start_date": contract.start_date,
                "end_date": contract.end_date,
                "salary": contract.salary,
                "schedule_description": contract.schedule_description,
                "is_active": contract.is_active,
            }
        # Fallback: legacy contratos
        legacy = obj.contratos.filter(estado='activo').first()
        if legacy:
            return {
                "id": legacy.id,
                "contract_type": legacy.tipo,
                "start_date": legacy.fecha_inicio,
                "end_date": legacy.fecha_fin,
                "salary": legacy.salario_base,
                "is_active": True,
                "schedule_description": legacy.contrato_turno.nombre if legacy.contrato_turno else None,
            }
        return None

    def get_position_details(self, obj):
        cargo = obj.cargo
        if not cargo:
            return None
        return {
            "id": cargo.id,
            "name": cargo.nombre,
            "min_salary": cargo.salario_minimo,
            "max_salary": cargo.salario_maximo,
        }


class ContratoSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)
    dias_restantes = serializers.SerializerMethodField()
    turno_nombre = serializers.CharField(source='contrato_turno.nombre', read_only=True)
    turno_horario = serializers.SerializerMethodField()

    class Meta:
        model = Contrato
        fields = '__all__'

    def get_dias_restantes(self, obj):
        if obj.fecha_fin and obj.estado == 'activo':
            delta = obj.fecha_fin - timezone.now().date()
            return delta.days
        return None

    def get_turno_horario(self, obj):
        if obj.contrato_turno:
            return f"{obj.contrato_turno.hora_inicio} - {obj.contrato_turno.hora_fin}"
        return None


class DocumentoEmpleadoSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)

    class Meta:
        model = DocumentoEmpleado
        fields = '__all__'


class TipoAusenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoAusencia
        fields = '__all__'


class SolicitudAusenciaSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)
    tipo_ausencia_nombre = serializers.CharField(source='tipo_ausencia.nombre', read_only=True)
    duracion_dias = serializers.SerializerMethodField()

    class Meta:
        model = SolicitudAusencia
        fields = '__all__'

    def get_duracion_dias(self, obj):
        delta = obj.fecha_fin - obj.fecha_inicio
        return delta.days + 1


class SaldoVacacionesSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)

    class Meta:
        model = SaldoVacaciones
        fields = '__all__'


class KPISerializer(serializers.ModelSerializer):
    class Meta:
        model = KPI
        fields = '__all__'


class ResultadoKPISerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)
    kpi_nombre = serializers.CharField(source='kpi.nombre', read_only=True)

    class Meta:
        model = ResultadoKPI
        fields = '__all__'


class EmployeePortalSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.SerializerMethodField()
    contract_details = serializers.SerializerMethodField()
    shift_details = serializers.SerializerMethodField()
    cargo = serializers.SerializerMethodField()
    sucursal = serializers.SerializerMethodField()
    cargo_nombre = serializers.CharField(source='cargo.nombre', read_only=True)
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)
    nombre = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = [
            'id',
            'nombre_completo',
            'nombre',
            'documento',
            'email',
            'cargo_nombre', 'cargo',
            'sucursal_nombre', 'sucursal',
            'foto_url',
            'supervisor_name',
            'contract_details',
            'shift_details',
        ]

    def get_cargo(self, obj):
        return obj.cargo.nombre if obj.cargo else None

    def get_sucursal(self, obj):
        return obj.sucursal.nombre if obj.sucursal else None

    def get_nombre(self, obj):
        return obj.nombre_completo

    def get_supervisor_name(self, obj):
        if obj.manager:
            return obj.manager.nombre_completo
        suc_manager = getattr(obj.sucursal, 'gerente_encargado', None)
        if suc_manager and suc_manager != obj:
            return suc_manager.nombre_completo
        return None

    def _legacy_contract(self, obj):
        legacy = obj.contratos.filter(estado='activo').order_by('-fecha_inicio').first()
        if not legacy:
            return None
        return {
            'id': legacy.id,
            'type': legacy.tipo,
            'start_date': legacy.fecha_inicio,
            'end_date': legacy.fecha_fin,
            'salary': float(legacy.salary or legacy.salario_base),
        }

    def get_contract_details(self, obj):
        contract = getattr(obj, 'contract', None)
        if contract:
            return {
                'id': contract.id,
                'type': contract.contract_type,
                'start_date': contract.start_date,
                'end_date': contract.end_date,
                'salary': float(contract.salary),
            }
        return self._legacy_contract(obj)

    def get_shift_details(self, obj):
        shift = getattr(obj, 'current_shift', None)
        if shift:
            return {
                'id': shift.id,
                'name': shift.name,
                'start_time': shift.start_time,
                'end_time': shift.end_time,
                'days': shift.days,
            }
        legacy = obj.contratos.filter(estado='activo').order_by('-fecha_inicio').first()
        if legacy and legacy.contrato_turno:
            t: Turno = legacy.contrato_turno
            return {
                'id': t.id,
                'name': t.nombre,
                'start_time': t.hora_inicio,
                'end_time': t.hora_fin,
                'days': t.dias_semana,
            }
        return None


# ===== LEGACY SERIALIZERS (compatibilidad) =====

class CargoSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Cargo
        fields = '__all__'

    def get_employee_count(self, obj):
        return obj.empleados.filter(estado='activo').count() if hasattr(obj, 'empleados') else 0


class ContractSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.nombre_completo', read_only=True)
    branch_name = serializers.CharField(source='employee.sucursal.nombre', read_only=True, default=None)
    position_name = serializers.CharField(source='employee.cargo.nombre', read_only=True, default=None)
    days_until_expiry = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_days_until_expiry(self, obj):
        if obj.end_date and obj.is_active:
            delta = obj.end_date - timezone.now().date()
            return delta.days
        return None

    def get_is_expiring_soon(self, obj):
        days = self.get_days_until_expiry(obj)
        return days is not None and 0 <= days <= 30


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.nombre_completo', read_only=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    duration_days = serializers.SerializerMethodField()

    class Meta:
        model = LeaveRequest
        fields = '__all__'

    def get_duration_days(self, obj):
        delta = obj.end_date - obj.start_date
        return delta.days + 1


class OnboardingTaskSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.nombre_completo', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = OnboardingTask
        fields = '__all__'

    def get_is_overdue(self, obj):
        if obj.due_date and not obj.is_completed:
            return obj.due_date < timezone.now().date()
        return False


class OrganigramNodeSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    full_name = serializers.SerializerMethodField(read_only=True)
    cargo_nombre = serializers.CharField(source='cargo.nombre', read_only=True)
    position_name = serializers.CharField(source='cargo.nombre', read_only=True)
    branch_name = serializers.CharField(source='sucursal.nombre', read_only=True)
    subordinates = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = ['id', 'nombre_completo', 'full_name', 'cargo_nombre', 'position_name', 'branch_name', 'foto_url', 'email', 'subordinates']

    def get_subordinates(self, obj):
        subordinates = obj.subordinados.filter(estado='activo')
        return OrganigramNodeSerializer(subordinates, many=True).data

    def get_full_name(self, obj):
        return obj.nombre_completo
