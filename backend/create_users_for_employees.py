import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "talent_track.settings")
django.setup()

from django.conf import settings  # noqa: E402
from django.contrib.auth import get_user_model  # noqa: E402
from django.contrib.auth.models import Group  # noqa: E402
from employees.models import Empleado  # noqa: E402


def get_group():
    group, _ = Group.objects.get_or_create(name="EMPLEADO")
    return group


def build_username(emp: Empleado) -> str:
    base = (emp.documento or f"emp{emp.id}").strip()
    candidate = base
    User = get_user_model()
    suffix = 1
    while User.objects.filter(username=candidate).exists():
        candidate = f"{base}_{suffix}"
        suffix += 1
    return candidate


def build_password(emp: Empleado) -> str:
    default_pwd = getattr(settings, "DEFAULT_EMPLOYEE_PASSWORD", None)
    return default_pwd or (emp.documento or "changeme123")


def run():
    User = get_user_model()
    group = get_group()
    created = 0
    for emp in Empleado.objects.filter(user__isnull=True):
        username = build_username(emp)
        password = build_password(emp)
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=emp.nombres,
            last_name=emp.apellidos,
            email=emp.email,
        )
        fields_to_update = []
        if hasattr(user, "role"):
            user.role = "EMPLOYEE"
            fields_to_update.append("role")
        if hasattr(user, "must_change_password"):
            user.must_change_password = True
            fields_to_update.append("must_change_password")
        if fields_to_update:
            user.save(update_fields=fields_to_update)
        user.groups.add(group)
        emp.user = user
        emp.save(update_fields=["user"])
        created += 1
    print(f"Usuarios creados/vinculados: {created}")


if __name__ == "__main__":
    run()
