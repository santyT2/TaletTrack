from rest_framework import serializers
from .models import (
    Turno, Geocerca, ReglaAsistencia, EventoAsistencia, JornadaCalculada,
    RegistroAsistencia, WorkShift, AttendanceRecord,
)
from employees.models import Empleado


class TurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = '__all__'


class WorkShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkShift
        fields = '__all__'


class GeocercaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Geocerca
        fields = '__all__'


class ReglaAsistenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReglaAsistencia
        fields = '__all__'


class EventoAsistenciaSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)

    class Meta:
        model = EventoAsistencia
        fields = '__all__'


class JornadaCalculadaSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)

    class Meta:
        model = JornadaCalculada
        fields = '__all__'


# LEGADO

class RegistroAsistenciaSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)
    sucursal = serializers.CharField(source='empleado.sucursal.nombre', read_only=True)
    cargo = serializers.CharField(source='empleado.cargo.nombre', read_only=True)

    class Meta:
        model = RegistroAsistencia
        fields = [
            'id', 'empleado', 'empleado_nombre', 'sucursal', 'cargo',
            'fecha_hora', 'tipo', 'latitud', 'longitud',
            'es_tardanza', 'minutos_atraso'
        ]


class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.nombre_completo', read_only=True)
    sucursal_nombre = serializers.CharField(source='employee.sucursal.nombre', read_only=True)
    sucursal_id = serializers.IntegerField(source='employee.sucursal.id', read_only=True)
    cargo_nombre = serializers.CharField(source='employee.cargo.nombre', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'employee',
            'employee_name',
            'timestamp',
            'type',
            'latitude',
            'longitude',
            'device_info',
            'is_late',
            'sucursal_nombre',
            'sucursal_id',
            'cargo_nombre',
        ]
        read_only_fields = ['id', 'employee', 'timestamp', 'is_late', 'device_info']
