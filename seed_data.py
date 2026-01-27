import os
import django
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "talent_track.settings")
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from core.models import Empresa  # noqa: E402
from employees.models import Sucursal, Cargo, Empleado  # noqa: E402


def main():
    company, _ = Empresa.objects.get_or_create(
        ruc_nit="1799999999001",
        defaults={
            "razon_social": "Talent Track S.A.",
            "nombre_comercial": "Talent Track",
            "ruc": "1799999999001",
            "direccion_fiscal": "Av. Republica 123, Quito",
            "representante_legal": "María Andrade",
            "pais": "EC",
            "moneda": "USD",
        },
    )

    branches_seed = [
        {"nombre": "Matriz Quito", "ciudad": "Quito", "direccion": "Av. Amazonas 100", "telefono": "+593-2-555-1111"},
        {"nombre": "Sede Guayaquil Centro", "ciudad": "Guayaquil", "direccion": "Malecón 2000", "telefono": "+593-4-555-2222"},
        {"nombre": "Sucursal Cuenca", "ciudad": "Cuenca", "direccion": "Calle Larga 321", "telefono": "+593-7-555-3333"},
        {"nombre": "Oficina Quito Norte", "ciudad": "Quito", "direccion": "Av. 6 de Diciembre 555", "telefono": "+593-2-555-4444"},
        {"nombre": "Hub Tecnología", "ciudad": "Quito", "direccion": "Parque Tecnológico", "telefono": "+593-2-555-5555"},
    ]

    branches = []
    for item in branches_seed:
        branch, _ = Sucursal.objects.get_or_create(
            empresa=company,
            nombre=item["nombre"],
            defaults={
                "direccion": item["direccion"],
                "ciudad": item["ciudad"],
                "telefono": item["telefono"],
                "tipo": "sede",
            },
        )
        branches.append(branch)

    cargos_seed = [
        {"nombre": "Gerente General", "departamento": "Dirección", "salario_base": 5500, "salario_minimo": 5000, "salario_maximo": 6500},
        {"nombre": "Desarrollador Senior", "departamento": "IT", "salario_base": 3500, "salario_minimo": 3200, "salario_maximo": 4000},
        {"nombre": "Ejecutivo de Ventas", "departamento": "Ventas", "salario_base": 2000, "salario_minimo": 1800, "salario_maximo": 2600},
        {"nombre": "Analista RRHH", "departamento": "RRHH", "salario_base": 2200, "salario_minimo": 2000, "salario_maximo": 2600},
        {"nombre": "Guardia de Seguridad", "departamento": "Operaciones", "salario_base": 1200, "salario_minimo": 1100, "salario_maximo": 1500},
    ]

    cargos = []
    for item in cargos_seed:
        cargo, _ = Cargo.objects.get_or_create(
            empresa=company,
            nombre=item["nombre"],
            defaults={
                "departamento": item["departamento"],
                "salario_base": item["salario_base"],
                "salario_minimo": item["salario_minimo"],
                "salario_maximo": item["salario_maximo"],
            },
        )
        cargos.append(cargo)

    User = get_user_model()
    admin_user, created = User.objects.get_or_create(
        username="admin",
        defaults={"email": "admin@talenttrack.com", "role": "SUPERADMIN", "is_staff": True, "is_superuser": True, "must_change_password": False},
    )
    if created:
        admin_user.set_password("admin")
        admin_user.save()

    if not Empleado.objects.filter(user=admin_user).exists():
        Empleado.objects.create(
            empresa=company,
            user=admin_user,
            nombres="Admin",
            apellidos="Principal",
            email=admin_user.email,
            telefono="+593-99-000-0000",
            fecha_ingreso=date.today(),
            sucursal=branches[0],
            cargo=cargos[0],
        )

    print("Seed completado: empresa, sucursales, cargos y admin listos.")


if __name__ == "__main__":
    main()
