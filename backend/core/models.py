from django.db import models


class TimeStampedModel(models.Model):
    """Modelo base con timestamps."""
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")

    class Meta:
        abstract = True
        ordering = ['-created_at']


class Empresa(TimeStampedModel):
    """
    Entidad multiempresa principal.
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

    razon_social = models.CharField(max_length=255)
    nombre_comercial = models.CharField(max_length=255)
    ruc_nit = models.CharField(max_length=30, unique=True)
    pais = models.CharField(max_length=5, choices=PAIS_CHOICES, default="EC")
    moneda = models.CharField(max_length=5, choices=MONEDA_CHOICES, default="USD")
    logo_url = models.ImageField(upload_to="empresas/logos/", null=True, blank=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default="activo")
    creada_el = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ["razon_social"]

    def __str__(self) -> str:
        return self.nombre_comercial or self.razon_social
