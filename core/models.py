from django.db import models


class TimeStampedModel(models.Model):
    """
    Modelo abstracto base que proporciona campos de timestamp.
    Todos los modelos del proyecto heredarán de este para tener
    registro de cuándo fueron creados y modificados.
    """
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de creación"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Última actualización"
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']
