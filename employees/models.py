from django.db import models
from django.core.validators import RegexValidator
from core.models import TimeStampedModel


class Sucursal(models.Model):
    """
    Modelo para registrar las sucursales de la empresa.
    """
    nombre = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nombre de la Sucursal"
    )
    direccion = models.CharField(
        max_length=255,
        verbose_name="Dirección"
    )
    ciudad = models.CharField(
        max_length=100,
        verbose_name="Ciudad",
        default="Bogotá"
    )
    telefono = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        verbose_name="Teléfono"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sucursal"
        verbose_name_plural = "Sucursales"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} - {self.ciudad}"


class Cargo(models.Model):
    """
    Modelo para registrar los cargos disponibles en la empresa.
    """
    nombre = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nombre del Cargo"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción"
    )
    salario_base = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Salario Base",
        help_text="Ingresa el salario en pesos"
    )
    nivel_requerido = models.CharField(
        max_length=50,
        choices=[
            ('junior', 'Junior'),
            ('semior', 'Semi-Senior'),
            ('senior', 'Senior'),
            ('lider', 'Líder'),
        ],
        default='junior',
        verbose_name="Nivel Requerido"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cargo"
        verbose_name_plural = "Cargos"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} - ${self.salario_base:,.0f}"


class Empleado(TimeStampedModel):
    """
    Modelo para registrar los empleados de la empresa.
    Hereda de TimeStampedModel para tener control de fechas de creación y actualización.
    """
    # Información personal
    nombres = models.CharField(
        max_length=100,
        verbose_name="Nombres"
    )
    apellidos = models.CharField(
        max_length=100,
        verbose_name="Apellidos"
    )
    
    # Documentación
    cedula = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Cédula/Documento",
        help_text="Documento único de identificación"
    )
    
    # Contacto
    email = models.EmailField(
        unique=True,
        verbose_name="Email"
    )
    telefono = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?[\d\s\-\(\)]{7,}$',
                message='Teléfono inválido'
            )
        ],
        verbose_name="Teléfono"
    )
    
    # Información laboral
    cargo = models.ForeignKey(
        Cargo,
        on_delete=models.PROTECT,
        verbose_name="Cargo",
        related_name="empleados"
    )
    sucursal = models.ForeignKey(
        Sucursal,
        on_delete=models.PROTECT,
        verbose_name="Sucursal",
        related_name="empleados"
    )
    
    # Fecha de ingreso
    fecha_ingreso = models.DateField(
        verbose_name="Fecha de Ingreso"
    )
    
    # Información personal adicional
    fecha_nacimiento = models.DateField(
        verbose_name="Fecha de Nacimiento"
    )
    
    # Foto de perfil
    foto = models.ImageField(
        upload_to='empleados/fotos/',
        blank=True,
        null=True,
        verbose_name="Foto de Perfil",
        help_text="Foto de perfil del empleado (opcional)"
    )
    
    # Estado del empleado
    estado = models.CharField(
        max_length=20,
        choices=[
            ('activo', 'Activo'),
            ('inactivo', 'Inactivo'),
            ('licencia', 'En Licencia'),
            ('despedido', 'Despedido'),
        ],
        default='activo',
        verbose_name="Estado"
    )

    class Meta:
        verbose_name = "Empleado"
        verbose_name_plural = "Empleados"
        ordering = ['apellidos', 'nombres']
        indexes = [
            models.Index(fields=['cedula']),
            models.Index(fields=['email']),
            models.Index(fields=['estado']),
        ]

    def __str__(self):
        return f"{self.nombres} {self.apellidos} - {self.cargo.nombre}"

    @property
    def nombre_completo(self):
        """Propiedad para obtener el nombre completo del empleado."""
        return f"{self.nombres} {self.apellidos}"
