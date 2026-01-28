from django.conf import settings
from django.db import models
from django.utils import timezone

from core.models import TimeStampedModel
from employees.models import Empleado


class LeaveRequest(TimeStampedModel):
    STATUS_CHOICES = [
        ("PENDING", "Pendiente"),
        ("APPROVED", "Aprobado"),
        ("REJECTED", "Rechazado"),
    ]

    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name="leave_requests_new")
    start_date = models.DateField()
    end_date = models.DateField()
    days = models.DecimalField(max_digits=5, decimal_places=2)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    rejection_reason = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_leaves",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Solicitud de Permiso"
        verbose_name_plural = "Solicitudes de Permiso"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["empleado", "status"]),
            models.Index(fields=["start_date", "end_date"]),
        ]

    def __str__(self) -> str:
        return f"{self.empleado} ({self.start_date} - {self.end_date})"

    @property
    def period(self) -> int:
        return self.start_date.year

    def mark_approved(self, user):
        self.status = "APPROVED"
        self.reviewed_by = user
        self.approved_at = timezone.now()
        self.rejection_reason = ""

    def mark_rejected(self, user, reason: str):
        self.status = "REJECTED"
        self.reviewed_by = user
        self.approved_at = timezone.now()
        self.rejection_reason = reason
