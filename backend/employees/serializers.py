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
    days_until_expiry = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = '__all__'

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
    cargo_nombre = serializers.CharField(source='cargo.nombre', read_only=True)
    subordinates = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = ['id', 'nombre_completo', 'cargo_nombre', 'foto_url', 'email', 'subordinates']

    def get_subordinates(self, obj):
        subordinates = obj.subordinados.filter(estado='activo')
        return OrganigramNodeSerializer(subordinates, many=True).data
