from django.db import models
from django.contrib.auth.models import AbstractUser


class TimeStampedModel(models.Model):
    """Modelo base con timestamps."""
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")

    class Meta:
        abstract = True
        ordering = ['-created_at']


class Empresa(TimeStampedModel):
    """
    Entidad multiempresa principal con datos fiscales completos.
    """

    PAIS_CHOICES = [
        ("EC", "Ecuador"),
        ("CO", "Colombia"),
        ("PE", "Perú"),
        ("MX", "México"),
        ("CL", "Chile"),
        ("AR", "Argentina"),
        ("US", "Estados Unidos"),
        ("ES", "España"),
    ]

    MONEDA_CHOICES = [
        ("USD", "Dólar"),
        ("EUR", "Euro"),
        ("COP", "Peso Colombiano"),
        ("PEN", "Sol Peruano"),
        ("MXN", "Peso Mexicano"),
        ("CLP", "Peso Chileno"),
        ("ARS", "Peso Argentino"),
    ]

    ESTADO_CHOICES = [
        ("activo", "Activo"),
        ("inactivo", "Inactivo"),
    ]

    # Identificación Legal
    razon_social = models.CharField(max_length=255, verbose_name="Razón Social")
    nombre_comercial = models.CharField(max_length=255, blank=True, null=True, verbose_name="Nombre Comercial")
    ruc = models.CharField(max_length=30, unique=True, blank=True, null=True, verbose_name="RUC/NIT/Tax ID")
    ruc_nit = models.CharField(max_length=30, unique=True, blank=True, null=True, verbose_name="RUC/NIT (Legacy)")  # Mantener compatibilidad
    
    # Datos Fiscales y Contacto
    direccion_fiscal = models.CharField(max_length=500, blank=True, null=True, verbose_name="Dirección Fiscal")
    telefono_contacto = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono de Contacto")
    email_contacto = models.EmailField(blank=True, null=True, verbose_name="Email de Contacto")
    sitio_web = models.URLField(blank=True, null=True, verbose_name="Sitio Web")
    representante_legal = models.CharField(max_length=150, blank=True, null=True, verbose_name="Representante Legal")
    
    # Configuración Regional
    pais = models.CharField(max_length=5, choices=PAIS_CHOICES, default="EC", verbose_name="País")
    moneda = models.CharField(max_length=5, choices=MONEDA_CHOICES, default="USD", verbose_name="Moneda")
    
    # Branding
    logo = models.ImageField(upload_to="empresas/logos/", null=True, blank=True, verbose_name="Logo Corporativo")
    logo_url = models.ImageField(upload_to="empresas/logos/", null=True, blank=True, verbose_name="Logo URL (Legacy)")  # Mantener compatibilidad
    
    # Estado
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default="activo", verbose_name="Estado")
    creada_el = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")

    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ["razon_social"]

    def __str__(self) -> str:
        return self.nombre_comercial or self.razon_social


class Usuario(AbstractUser):
    """Usuario de la plataforma con rol avanzado para RBAC y control de accesos."""

    ROLE_CHOICES = [
        ("SUPERADMIN", "Super Admin"),
        ("ADMIN_RRHH", "Administrador RRHH"),
        ("MANAGER", "Manager/Gerente"),
        ("EMPLOYEE", "Empleado"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="EMPLOYEE", verbose_name="Rol del Usuario")
    must_change_password = models.BooleanField(default=True, verbose_name="Debe Cambiar Contraseña")
    
    # Nota: La relación con Empleado se define en el modelo Empleado con OneToOneField
    # No es necesario definirla aquí para evitar circular imports

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self) -> str:
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def empleado(self):
        """Acceso seguro al empleado vinculado."""
        return getattr(self, 'empleado', None)
    
    def has_admin_access(self):
        """Verifica si el usuario tiene acceso administrativo."""
        return self.role in ["SUPERADMIN", "ADMIN_RRHH"]
    
    def can_manage_users(self):
        """Verifica si el usuario puede gestionar otros usuarios."""
        return self.role == "SUPERADMIN"
