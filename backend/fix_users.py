import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "talent_track.settings")
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from employees.models import Empleado
from django.conf import settings

User = get_user_model()

def get_employee_group():
    group, _ = Group.objects.get_or_create(name="EMPLEADO")
    return group

def main():
    group = get_employee_group()
    created, updated = 0, 0
    default_pwd = getattr(settings, "DEFAULT_EMPLOYEE_PASSWORD", None)

    for emp in Empleado.objects.all():
        username = (emp.documento or f"emp{emp.id}").strip()
        password = default_pwd or (emp.documento or "changeme123")

        user = emp.user
        if not user:
            # create
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=emp.nombres,
                last_name=emp.apellidos,
                email=emp.email,
            )
            created += 1
        else:
            # reset password and flags; update username to documento
            user.username = username
            user.set_password(password)
            updated += 1
        # flags and role
        if hasattr(user, "role"):
            user.role = "EMPLOYEE"
        if hasattr(user, "must_change_password"):
            user.must_change_password = True
        user.save()
        user.groups.add(group)

        # link employee
        if not emp.user_id or emp.user_id != user.id:
            emp.user = user
            emp.save(update_fields=["user"])

    print(f"Usuarios creados: {created}, actualizados: {updated}")

if __name__ == "__main__":
    main()
