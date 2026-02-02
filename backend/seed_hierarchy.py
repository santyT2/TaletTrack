"""
Seed script to rebuild a 4-level corporate hierarchy with realistic roles.

Usage (from project root):
  python manage.py shell < backend/seed_hierarchy.py
or run the file directly with the Django environment configured.
"""

import os
from datetime import date
from decimal import Decimal

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talent_track.settings')
django.setup()

from core.models import Empresa  # noqa: E402
from employees.models import Cargo, Empleado, Sucursal  # noqa: E402


def ensure_company() -> Empresa:
    company = Empresa.objects.first()
    if company:
        return company

    company = Empresa.objects.create(
        razon_social='Demo Corp',
        nombre_comercial='Demo Corp',
        ruc='9999999999',
        direccion_fiscal='Demo Address',
        telefono_contacto='+1 555 0100',
        email_contacto='info@demo.local',
        pais='PY',
        moneda='PYG',
        estado='activa',
    )
    return company


def ensure_branch(company: Empresa) -> Sucursal:
    branch = Sucursal.objects.filter(empresa=company).first()
    if branch:
        return branch

    return Sucursal.objects.create(
        empresa=company,
        nombre='Sede Central',
        tipo='sede',
        direccion='Direccion Central',
        ciudad='Asuncion',
        capacidad_maxima=200,
        estado='activo',
    )


def clean_previous(company: Empresa):
    Empleado.objects.filter(empresa=company).delete()
    Cargo.objects.filter(empresa=company).delete()


def seed_positions(company: Empresa, branch: Sucursal):
    positions = [
        {"key": "ceo", "nombre": "CEO / Director General", "nivel": "lider", "departamento": "Direccion", "salario_base": Decimal('18000'), "salario_minimo": Decimal('15000'), "salario_maximo": Decimal('22000')},
        {"key": "cto", "nombre": "Director de Tecnologia (CTO)", "nivel": "lider", "departamento": "Tecnologia", "salario_base": Decimal('15000'), "salario_minimo": Decimal('13000'), "salario_maximo": Decimal('18000')},
        {"key": "cfo", "nombre": "Director de Finanzas (CFO)", "nivel": "lider", "departamento": "Finanzas", "salario_base": Decimal('15000'), "salario_minimo": Decimal('13000'), "salario_maximo": Decimal('18000')},
        {"key": "chro", "nombre": "Director de RRHH", "nivel": "lider", "departamento": "RRHH", "salario_base": Decimal('14000'), "salario_minimo": Decimal('12000'), "salario_maximo": Decimal('17000')},
        {"key": "dev_lead", "nombre": "Lider de Desarrollo", "nivel": "senior", "departamento": "Tecnologia", "salario_base": Decimal('9000'), "salario_minimo": Decimal('8000'), "salario_maximo": Decimal('11000')},
        {"key": "accountant", "nombre": "Contador General", "nivel": "senior", "departamento": "Finanzas", "salario_base": Decimal('8000'), "salario_minimo": Decimal('7000'), "salario_maximo": Decimal('9500')},
        {"key": "talent_lead", "nombre": "Jefe de Talento", "nivel": "senior", "departamento": "RRHH", "salario_base": Decimal('8000'), "salario_minimo": Decimal('7000'), "salario_maximo": Decimal('9500')},
        {"key": "senior_dev", "nombre": "Desarrollador Senior", "nivel": "senior", "departamento": "Tecnologia", "salario_base": Decimal('6500'), "salario_minimo": Decimal('6000'), "salario_maximo": Decimal('7500')},
        {"key": "junior_dev", "nombre": "Desarrollador Junior", "nivel": "junior", "departamento": "Tecnologia", "salario_base": Decimal('4000'), "salario_minimo": Decimal('3500'), "salario_maximo": Decimal('4500')},
        {"key": "assistant_account", "nombre": "Asistente Contable", "nivel": "junior", "departamento": "Finanzas", "salario_base": Decimal('3500'), "salario_minimo": Decimal('3000'), "salario_maximo": Decimal('4200')},
        {"key": "talent_analyst", "nombre": "Analista de Seleccion", "nivel": "junior", "departamento": "RRHH", "salario_base": Decimal('3200'), "salario_minimo": Decimal('2800'), "salario_maximo": Decimal('4000')},
    ]

    position_map = {}
    for pos in positions:
        obj = Cargo.objects.create(
            empresa=company,
            nombre=pos['nombre'],
            descripcion=f"{pos['nombre']} - rol sembrado",
            unidad=branch,
            nivel=pos['nivel'],
            departamento=pos['departamento'],
            salario_base=pos['salario_base'],
            salario_minimo=pos['salario_minimo'],
            salario_maximo=pos['salario_maximo'],
            responsabilidades=f"Responsabilidades principales de {pos['nombre']}",
            beneficios={"seguro_medico": True, "bono": True},
        )
        position_map[pos['key']] = obj
    return position_map


def seed_employees(company: Empresa, branch: Sucursal, position_map):
    employees = [
        {"key": "ceo", "nombres": "Laura", "apellidos": "Gomez", "email": "ceo@demo.local", "cargo": "ceo", "manager": None},
        {"key": "cto", "nombres": "Carlos", "apellidos": "Perez", "email": "cto@demo.local", "cargo": "cto", "manager": "ceo"},
        {"key": "cfo", "nombres": "Maria", "apellidos": "Lopez", "email": "cfo@demo.local", "cargo": "cfo", "manager": "ceo"},
        {"key": "chro", "nombres": "Sofia", "apellidos": "Diaz", "email": "chro@demo.local", "cargo": "chro", "manager": "ceo"},
        {"key": "dev_lead", "nombres": "Diego", "apellidos": "Ramos", "email": "devlead@demo.local", "cargo": "dev_lead", "manager": "cto"},
        {"key": "accountant", "nombres": "Andres", "apellidos": "Molina", "email": "accounting@demo.local", "cargo": "accountant", "manager": "cfo"},
        {"key": "talent_lead", "nombres": "Valeria", "apellidos": "Romero", "email": "talent@demo.local", "cargo": "talent_lead", "manager": "chro"},
        {"key": "senior_dev", "nombres": "Javier", "apellidos": "Torres", "email": "seniordev@demo.local", "cargo": "senior_dev", "manager": "dev_lead"},
        {"key": "junior_dev", "nombres": "Lucia", "apellidos": "Acosta", "email": "juniordev@demo.local", "cargo": "junior_dev", "manager": "dev_lead"},
        {"key": "assistant_account", "nombres": "Marco", "apellidos": "Benitez", "email": "assistant@demo.local", "cargo": "assistant_account", "manager": "accountant"},
        {"key": "talent_analyst", "nombres": "Camila", "apellidos": "Franco", "email": "analista@demo.local", "cargo": "talent_analyst", "manager": "talent_lead"},
    ]

    employee_map = {}
    base_date = date(2022, 1, 10)

    for idx, emp in enumerate(employees, start=1):
        empleado = Empleado.objects.create(
            empresa=company,
            sucursal=branch,
            cargo=position_map[emp['cargo']],
            nombres=emp['nombres'],
            apellidos=emp['apellidos'],
            email=emp['email'],
            documento=f"DOC-{idx:04d}",
            telefono=f"+1 555 01{idx:02d}",
            direccion='Oficina Central',
            fecha_nacimiento=date(1990, 5, (idx % 28) + 1),
            fecha_ingreso=base_date,
            estado='activo',
        )
        employee_map[emp['key']] = empleado

    # Segunda pasada para asignar managers
    for emp in employees:
        manager_key = emp['manager']
        if manager_key:
            employee = employee_map[emp['key']]
            employee.manager = employee_map.get(manager_key)
            employee.save(update_fields=['manager'])

    return employee_map


def main():
    company = ensure_company()
    branch = ensure_branch(company)
    clean_previous(company)
    # Limpiar gerente previo para evitar referencias colgantes en señales
    branch.gerente_encargado = None
    branch.save(update_fields=['gerente_encargado'])
    position_map = seed_positions(company, branch)
    employee_map = seed_employees(company, branch, position_map)

    # Designar gerente encargado de la sucursal (usa el CEO)
    branch.gerente_encargado = employee_map.get('ceo')
    branch.save(update_fields=['gerente_encargado'])

    print("=== Seeding completado ===")
    print(f"Empresa: {company.nombre_comercial}")
    print(f"Puestos creados: {Cargo.objects.filter(empresa=company).count()}")
    print(f"Empleados creados: {Empleado.objects.filter(empresa=company).count()}")


if __name__ == '__main__':
    main()
