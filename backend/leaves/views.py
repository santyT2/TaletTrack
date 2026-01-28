from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from employees.models import Empleado, SaldoVacaciones
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from .permissions import IsAdminOrManager


class LeaveRequestViewSet(viewsets.ModelViewSet):
    """Solicitudes de permiso/vacaciones con flujo de aprobación."""

    queryset = LeaveRequest.objects.select_related("empleado", "empleado__empresa").all()
    serializer_class = LeaveRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "empleado"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["approve", "reject", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdminOrManager()]
        return [IsAuthenticated()]

    def _get_empleado(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return None
        if getattr(user, "role", None) == "ADMIN":
            return None
        if user.email:
            emp = Empleado.objects.filter(email=user.email).first()
            if emp:
                return emp
        return Empleado.objects.filter(email=user.username).first()

    def get_queryset(self):
        qs = super().get_queryset()
        day = self.request.query_params.get("day")
        if day:
            qs = qs.filter(start_date__lte=day, end_date__gte=day)
        user = self.request.user
        if user.is_superuser or getattr(user, "role", None) in {"ADMIN", "MANAGER"} or user.is_staff:
            return qs
        empleado = self._get_empleado()
        if not empleado:
            return qs.none()
        return qs.filter(empleado=empleado)

    def perform_create(self, serializer):
        empleado = self._get_empleado()
        if not empleado:
            raise PermissionDenied("No se encontró empleado asociado al usuario.")
        serializer.save(empleado=empleado, status="PENDING")

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminOrManager])
    def approve(self, request, pk=None):
        leave = self.get_object()
        if leave.status != "PENDING":
            return Response({"detail": "La solicitud ya fue procesada."}, status=status.HTTP_400_BAD_REQUEST)

        # Validar saldo y descontar
        saldo, _ = SaldoVacaciones.objects.get_or_create(
            empleado=leave.empleado,
            periodo=leave.period,
            defaults={"dias_disponibles": 0},
        )
        if saldo.dias_disponibles < leave.days:
            return Response({"detail": "Saldo insuficiente para aprobar."}, status=status.HTTP_400_BAD_REQUEST)

        saldo.dias_disponibles -= leave.days
        saldo.save(update_fields=["dias_disponibles", "updated_at"])

        leave.mark_approved(request.user)
        leave.save(update_fields=["status", "reviewed_by", "approved_at", "rejection_reason", "updated_at"])

        return Response(self.get_serializer(leave).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminOrManager])
    def reject(self, request, pk=None):
        leave = self.get_object()
        if leave.status != "PENDING":
            return Response({"detail": "La solicitud ya fue procesada."}, status=status.HTTP_400_BAD_REQUEST)

        motivo = request.data.get("reason") or request.data.get("motivo")
        if not motivo:
            return Response({"detail": "Se requiere un motivo de rechazo."}, status=status.HTTP_400_BAD_REQUEST)

        leave.mark_rejected(request.user, motivo)
        leave.save(update_fields=["status", "rejection_reason", "reviewed_by", "approved_at", "updated_at"])

        return Response(self.get_serializer(leave).data)
