from django.db import models
from employees.models import Empleado
from core.models import Empresa, TimeStampedModel


class Turno(TimeStampedModel):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='turnos')
    nombre = models.CharField(max_length=120, default="Turno General")
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    dias_semana = models.JSONField(default=list, help_text="Lista de días 0-6 (lunes-domingo)")
    tolerancia_minutos = models.PositiveIntegerField(default=5)
    requiere_gps = models.BooleanField(default=True)
    requiere_foto = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Turno"
        verbose_name_plural = "Turnos"

    def __str__(self):
        return f"{self.nombre} ({self.empresa})"


class WorkShift(TimeStampedModel):
    """Turno operativo para asignar a empleados (HR)."""

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="workshifts")
    name = models.CharField(max_length=120)
    start_time = models.TimeField()
    end_time = models.TimeField()
    days = models.JSONField(default=list, help_text="Lista de días laborables 0-6 (lunes=0)")

    class Meta:
        verbose_name = "WorkShift"
        verbose_name_plural = "WorkShifts"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.empresa})"


class Geocerca(TimeStampedModel):
    TIPO_CHOICES = [
        ('circulo', 'Círculo'),
        ('poligono', 'Polígono'),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='geocercas')
    nombre = models.CharField(max_length=120)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    coordenadas = models.JSONField(help_text="Para círculo: {center:{lat,lng}, radius_m}. Para polígono: lista de puntos.")
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Geocerca"
        verbose_name_plural = "Geocercas"

    def __str__(self):
        return f"{self.nombre} ({self.empresa})"


class ReglaAsistencia(TimeStampedModel):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='reglas_asistencia')
    considera_tardanza_min = models.PositiveIntegerField(default=5)
    geocerca = models.ForeignKey(Geocerca, on_delete=models.SET_NULL, null=True, blank=True, related_name='reglas')
    ip_permitidas = models.JSONField(default=list, blank=True)

    class Meta:
        verbose_name = "Regla de Asistencia"
        verbose_name_plural = "Reglas de Asistencia"

    def __str__(self):
        return f"Regla {self.empresa}"


class EventoAsistencia(TimeStampedModel):
    TIPO_CHOICES = [
        ('checkin', 'Check-in'),
        ('checkout', 'Check-out'),
    ]
    FUENTE_CHOICES = [
        ('web', 'Web'),
        ('app', 'App'),
    ]

    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='eventos_asistencia')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    registrado_el = models.DateTimeField(auto_now_add=True)
    fuente = models.CharField(max_length=10, choices=FUENTE_CHOICES, default='web')
    gps_lat = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    gps_lng = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    dentro_geocerca = models.BooleanField(default=False)
    foto_evidence = models.ImageField(upload_to='asistencia/fotos/', null=True, blank=True)
    observacion = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Evento de Asistencia"
        verbose_name_plural = "Eventos de Asistencia"
        ordering = ['-registrado_el']

    def __str__(self):
        return f"{self.empleado} - {self.tipo} ({self.registrado_el})"


class JornadaCalculada(TimeStampedModel):
    ESTADO_CHOICES = [
        ('completo', 'Completo'),
        ('incompleto', 'Incompleto'),
        ('tardanza', 'Tardanza'),
    ]

    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='jornadas_calculadas')
    fecha = models.DateField()
    hora_entrada = models.DateTimeField(null=True, blank=True)
    hora_salida = models.DateTimeField(null=True, blank=True)
    minutos_trabajados = models.PositiveIntegerField(default=0)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='incompleto')

    class Meta:
        verbose_name = "Jornada Calculada"
        verbose_name_plural = "Jornadas Calculadas"
        unique_together = ('empleado', 'fecha')

    def __str__(self):
        return f"{self.empleado} - {self.fecha}"


# ===== LEGADO =====

class RegistroAsistencia(models.Model):
    """Modelo legado previo; se mantiene para compatibilidad."""
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
        return f"{self.empleado} - {self.tipo} - {self.fecha_hora}"
