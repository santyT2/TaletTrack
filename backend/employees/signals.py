from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Empleado


def _get_or_create_employee_group() -> Group:
    group, _ = Group.objects.get_or_create(name="EMPLEADO")
    return group


def _build_username(empleado: Empleado) -> str:
    base = (empleado.documento or f"emp{empleado.id}").strip()
    return base


def _build_password(empleado: Empleado) -> str:
    default_pwd = getattr(settings, "DEFAULT_EMPLOYEE_PASSWORD", None)
    return default_pwd or (empleado.documento or "changeme123")


@receiver(post_save, sender=Empleado)
def ensure_user_for_employee(sender, instance: Empleado, created: bool, **kwargs):
    User = get_user_model()

    # If already linked, nothing to do
    if instance.user:
        return

    username = _build_username(instance)
    # Avoid collisions by suffixing
    candidate = username
    suffix = 1
    while User.objects.filter(username=candidate).exists():
        candidate = f"{username}_{suffix}"
        suffix += 1
    username = candidate

    password = _build_password(instance)

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=instance.nombres,
        last_name=instance.apellidos,
        email=instance.email,
    )

    updates = []
    if hasattr(user, "role"):
        user.role = "EMPLOYEE"
        updates.append("role")
    if hasattr(user, "must_change_password"):
        user.must_change_password = True
        updates.append("must_change_password")
    if updates:
        user.save(update_fields=updates)

    # Asignar grupo EMPLEADO
    group = _get_or_create_employee_group()
    user.groups.add(group)

    # Vincular al empleado
    instance.user = user
    instance.save(update_fields=["user"])