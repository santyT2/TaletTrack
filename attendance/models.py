from django.db import models
from django.conf import settings
from employees.models import Empleado


class RegistroAsistencia(models.Model):
    """
    Modelo para registrar la asistencia de empleados.
    """
    TIPO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SALIDA', 'Salida'),
    ]

    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='registros_asistencia')
    fecha_hora = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    latitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    es_tardanza = models.BooleanField(default=False)
    minutos_atraso = models.PositiveIntegerField(default=0, verbose_name="Minutos de Atraso")

    class Meta:
        verbose_name = 'Registro de Asistencia'
        verbose_name_plural = 'Registros de Asistencia'
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"{self.empleado.nombres} {self.empleado.apellidos} - {self.tipo} - {self.fecha_hora}"
