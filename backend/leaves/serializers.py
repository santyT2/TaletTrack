from datetime import timedelta

from rest_framework import serializers

from employees.models import SaldoVacaciones
from .models import LeaveRequest


class LeaveRequestSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source="empleado.nombre_completo", read_only=True)
    saldo_disponible = serializers.SerializerMethodField()

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "empleado",
            "empleado_nombre",
            "start_date",
            "end_date",
            "days",
            "reason",
            "status",
            "rejection_reason",
            "approved_by",
            "approved_at",
            "created_at",
            "updated_at",
            "saldo_disponible",
        ]
        read_only_fields = [
            "empleado",
            "status",
            "rejection_reason",
            "approved_by",
            "approved_at",
            "created_at",
            "updated_at",
            "days",
            "saldo_disponible",
        ]

    def validate(self, attrs):
        start = attrs.get("start_date") or getattr(self.instance, "start_date", None)
        end = attrs.get("end_date") or getattr(self.instance, "end_date", None)
        if start and end and end < start:
            raise serializers.ValidationError("La fecha de fin debe ser mayor o igual a la de inicio.")
        return attrs

    def create(self, validated_data):
        start = validated_data["start_date"]
        end = validated_data["end_date"]
        days = (end - start) / timedelta(days=1) + 1
        validated_data["days"] = round(float(days), 2)
        return super().create(validated_data)

    def get_saldo_disponible(self, obj):
        saldo = (
            SaldoVacaciones.objects.filter(empleado=obj.empleado, periodo=obj.period)
            .order_by("-created_at")
            .first()
        )
        return float(saldo.dias_disponibles) if saldo else None
