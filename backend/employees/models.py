from django.db import models
from django.core.validators import RegexValidator
from core.models import TimeStampedModel, Empresa


class Sucursal(TimeStampedModel):
    """Sucursal / Unidad organizativa."""

    TIPO_CHOICES = [
        ("sede", "Sede"),
        ("area", "Área"),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="sucursales")
    nombre = models.CharField(max_length=150)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default="sede")
    padre = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subunidades')
    ubicacion = models.TextField(blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    ciudad = models.CharField(max_length=100, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    estado = models.CharField(max_length=15, choices=[('activo', 'Activo'), ('inactivo', 'Inactivo')], default='activo')

    class Meta:
        verbose_name = "Sucursal"
        verbose_name_plural = "Sucursales"
        ordering = ["nombre"]
        indexes = [models.Index(fields=["empresa", "nombre"])]

    def __str__(self):
        return f"{self.nombre} ({self.empresa})"


class Cargo(models.Model):
    """Único catálogo de cargos/puestos."""

    NIVEL_CHOICES = [
        ('junior', 'Junior'),
        ('semior', 'Semi-Senior'),
        ('senior', 'Senior'),
        ('lider', 'Líder'),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='cargos', null=True, blank=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    unidad = models.ForeignKey(Sucursal, on_delete=models.PROTECT, related_name='puestos', null=True, blank=True)
    nivel = models.CharField(max_length=50, choices=NIVEL_CHOICES, default='junior')
    salario_base = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cargo"
        verbose_name_plural = "Cargos"
        ordering = ["nombre"]
        indexes = [models.Index(fields=["empresa", "nombre"])]

    def __str__(self):
        return f"{self.nombre} ({self.empresa})"


class Empleado(TimeStampedModel):
    """Empleado con multitenencia y jerarquía."""

    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('licencia', 'En Licencia'),
        ('despedido', 'Despedido'),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='empleados')
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    documento = models.CharField(max_length=30, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, validators=[RegexValidator(regex=r'^\+?[\d\s\-\(\)]{7,}$', message='Teléfono inválido')])
    direccion = models.CharField(max_length=255, blank=True, null=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    fecha_ingreso = models.DateField()
    sucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT, related_name='empleados')
    cargo = models.ForeignKey(Cargo, on_delete=models.PROTECT, related_name='empleados', null=True, blank=True)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinados')
    foto_url = models.ImageField(upload_to='empleados/fotos/', null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')

    class Meta:
        verbose_name = "Empleado"
        verbose_name_plural = "Empleados"
        ordering = ['apellidos', 'nombres']
        indexes = [
            models.Index(fields=['empresa', 'documento']),
            models.Index(fields=['empresa', 'email']),
            models.Index(fields=['empresa', 'estado']),
        ]

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"

    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellidos}"

    @property
    def foto(self):
        """Compatibilidad hacia atrás para consumidores que esperan 'foto'."""
        return self.foto_url


class Contrato(TimeStampedModel):
    """Contrato laboral del empleado."""

    TIPO_CHOICES = [
        ('indefinido', 'Indefinido'),
        ('plazo_fijo', 'Plazo Fijo'),
        ('pasantia', 'Pasantía'),
        ('obra_labor', 'Obra o Labor'),
    ]

    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('finalizado', 'Finalizado'),
        ('suspendido', 'Suspendido'),
    ]

    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='contratos')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    salario_base = models.DecimalField(max_digits=12, decimal_places=2)
    jornada_semanal_horas = models.PositiveIntegerField(default=40)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='activo')

    class Meta:
        verbose_name = "Contrato"
        verbose_name_plural = "Contratos"
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f"{self.empleado.nombre_completo} - {self.tipo}"


class DocumentoEmpleado(TimeStampedModel):
    """Documentos asociados a un empleado (contrato, anexo, etc.)."""

    TIPO_CHOICES = [
        ('contrato', 'Contrato'),
        ('anexo', 'Anexo'),
        ('certificacion', 'Certificación'),
        ('otros', 'Otros'),
    ]

    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='documentos')
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES)
    archivo = models.FileField(upload_to='empleados/documentos/')
    vigente = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Documento de Empleado"
        verbose_name_plural = "Documentos de Empleado"

    def __str__(self):
        return f"{self.empleado.nombre_completo} - {self.tipo}"


class TipoAusencia(TimeStampedModel):
    nombre = models.CharField(max_length=100)
    afecta_sueldo = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Tipo de Ausencia"
        verbose_name_plural = "Tipos de Ausencia"

    def __str__(self):
        return self.nombre


class SolicitudAusencia(TimeStampedModel):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]

    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='solicitudes_ausencia')
    tipo_ausencia = models.ForeignKey(TipoAusencia, on_delete=models.PROTECT, related_name='solicitudes')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    motivo = models.TextField()
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='pendiente')
    adjunto = models.FileField(upload_to='ausencias/adjuntos/', null=True, blank=True)

    class Meta:
        verbose_name = "Solicitud de Ausencia"
        verbose_name_plural = "Solicitudes de Ausencia"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.empleado.nombre_completo} - {self.tipo_ausencia.nombre}"


class SaldoVacaciones(TimeStampedModel):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='saldos_vacaciones')
    periodo = models.PositiveIntegerField(help_text="Año del periodo, ej. 2025")
    dias_disponibles = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Saldo de Vacaciones"
        verbose_name_plural = "Saldos de Vacaciones"
        unique_together = ('empleado', 'periodo')

    def __str__(self):
        return f"{self.empleado.nombre_completo} - {self.periodo} ({self.dias_disponibles} días)"


class KPI(TimeStampedModel):
    nombre = models.CharField(max_length=150)
    formula = models.JSONField(null=True, blank=True)
    unidad = models.CharField(max_length=20, default='%')

    class Meta:
        verbose_name = "KPI"
        verbose_name_plural = "KPIs"

    def __str__(self):
        return self.nombre


class ResultadoKPI(TimeStampedModel):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='resultados_kpi')
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE, related_name='resultados')
    periodo = models.CharField(max_length=20)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    cumplimiento = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        verbose_name = "Resultado KPI"
        verbose_name_plural = "Resultados KPI"
        unique_together = ('empleado', 'kpi', 'periodo')

    def __str__(self):
        return f"{self.empleado} - {self.kpi} ({self.periodo})"


# ====== LEGACY MODELS (se mantienen para compatibilidad) ======

class Contract(models.Model):
    """Modelo legado, reemplazado por Contrato."""
    CONTRACT_TYPES = [
        ('indefinido', 'Indefinido'),
        ('plazo_fijo', 'Plazo Fijo'),
        ('pasantia', 'Pasantía'),
        ('obra_labor', 'Obra o Labor'),
    ]

    employee = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='legacy_contracts')
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    document = models.FileField(upload_to='contracts/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.nombre_completo} - {self.contract_type}"


class LeaveRequest(models.Model):
    """Modelo legado, coexistirá con SolicitudAusencia."""
    LEAVE_TYPES = [
        ('vacaciones', 'Vacaciones'),
        ('medica', 'Licencia Médica'),
        ('personal', 'Permiso Personal'),
        ('luto', 'Luto'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]

    employee = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    attachment = models.FileField(upload_to='leave_attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.nombre_completo} - {self.leave_type} ({self.status})"


class OnboardingTask(models.Model):
    """Modelo legado conservado para onboarding simple."""
    employee = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='onboarding_tasks')
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.nombre_completo} - {self.title}"
