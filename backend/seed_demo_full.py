"""
Seed demo data for HR modules: attendance, leaves, payroll, onboarding and organigram.
Usage:
  python manage.py shell < seed_demo_full.py
"""

import os
import random
from datetime import date, datetime, time, timedelta

import django
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "talent_track.settings")
django.setup()

from core.models import Empresa, Usuario  # noqa: E402
from employees.models import (
    Cargo,
    Contract,
    Empleado,
    OnboardingTask,
    Sucursal,
    TipoAusencia,
    SolicitudAusencia,
)  # noqa: E402
from attendance.models import AttendanceRecord, WorkShift  # noqa: E402
from leaves.models import LeaveRequest  # noqa: E402


def ensure_company() -> Empresa:
    company = Empresa.objects.first()
    if company:
        return company
    return Empresa.objects.create(
        razon_social="Demo Corp",
        nombre_comercial="Demo Corp",
        ruc="9999999999",
        direccion_fiscal="Demo Address",
        telefono_contacto="+1 555 0100",
        email_contacto="info@demo.local",
        pais="CO",
        moneda="COP",
        estado="activa",
    )


def ensure_admin_user():
    user, created = Usuario.objects.get_or_create(
        username="admin",
        defaults={
            "email": "admin@example.com",
            "is_staff": True,
            "is_superuser": True,
            "role": "SUPERADMIN",
        },
    )
    if created:
        user.set_password("admin1234")
        user.save()
    return user


def ensure_branch(company: Empresa) -> Sucursal:
    branch = Sucursal.objects.filter(empresa=company).first()
    if branch:
        return branch
    return Sucursal.objects.create(
        empresa=company,
        nombre="Sede Central",
        tipo="sede",
        direccion="Direccion Central",
        ciudad="Bogota",
        capacidad_maxima=200,
        estado="activo",
    )


def ensure_positions(company: Empresa, branch: Sucursal):
    if Cargo.objects.filter(empresa=company).exists():
        return list(Cargo.objects.filter(empresa=company))

    catalog = [
        {"nombre": "CEO / Director", "departamento": "Direccion", "nivel": "lider", "salario_base": 15000000},
        {"nombre": "Jefe de RRHH", "departamento": "RRHH", "nivel": "senior", "salario_base": 9000000},
        {"nombre": "Lider de Tecnologia", "departamento": "Tecnologia", "nivel": "senior", "salario_base": 9500000},
        {"nombre": "Contador", "departamento": "Finanzas", "nivel": "semior", "salario_base": 6500000},
        {"nombre": "Analista de Sistemas", "departamento": "Tecnologia", "nivel": "semior", "salario_base": 5200000},
        {"nombre": "Analista RRHH", "departamento": "RRHH", "nivel": "semior", "salario_base": 4800000},
        {"nombre": "Soporte Técnico", "departamento": "Tecnologia", "nivel": "junior", "salario_base": 3000000},
        {"nombre": "Asistente Administrativo", "departamento": "Administracion", "nivel": "junior", "salario_base": 2800000},
    ]
    positions = []
    for item in catalog:
        obj, _ = Cargo.objects.get_or_create(
            empresa=company,
            nombre=item["nombre"],
            defaults={
                "descripcion": f"Rol sembrado: {item['nombre']}",
                "unidad": branch,
                "nivel": item["nivel"],
                "departamento": item["departamento"],
                "salario_base": item["salario_base"],
                "salario_minimo": item["salario_base"] * 0.85,
                "salario_maximo": item["salario_base"] * 1.15,
                "beneficios": {"seguro_medico": True, "bono": True},
            },
        )
        positions.append(obj)
    return positions


def ensure_employees(company: Empresa, branch: Sucursal, positions):
    employees = list(Empleado.objects.filter(empresa=company))
    if employees:
        return employees

    dataset = [
        ("Laura", "Gomez", "ceo@demo.local", "CEO / Director"),
        ("Sofia", "Diaz", "hr@demo.local", "Jefe de RRHH"),
        ("Carlos", "Perez", "cto@demo.local", "Lider de Tecnologia"),
        ("Maria", "Lopez", "finanzas@demo.local", "Contador"),
        ("Diego", "Ramos", "dev@demo.local", "Analista de Sistemas"),
        ("Valeria", "Romero", "talent@demo.local", "Analista RRHH"),
        ("Javier", "Torres", "soporte@demo.local", "Soporte Técnico"),
        ("Lucia", "Acosta", "admin@demo.local", "Asistente Administrativo"),
    ]
    position_map = {p.nombre: p for p in positions}
    base_date = date.today() - timedelta(days=800)
    employees = []
    for idx, (name, last, email, cargo_name) in enumerate(dataset, start=1):
        emp = Empleado.objects.create(
            empresa=company,
            sucursal=branch,
            cargo=position_map[cargo_name],
            nombres=name,
            apellidos=last,
            email=email,
            documento=f"DOC-{idx:04d}",
            telefono=f"+57 300 000 {idx:04d}",
            direccion="Oficina Central",
            fecha_nacimiento=date(1990, 1, (idx % 27) + 1),
            fecha_ingreso=base_date + timedelta(days=idx * 20),
            estado="activo",
        )
        employees.append(emp)

    # Armar jerarquía simple
    ceo = employees[0]
    for emp in employees[1:]:
        emp.manager = ceo if emp.cargo.nivel != "junior" else random.choice(employees[1:4])
        emp.save(update_fields=["manager"])
    branch.gerente_encargado = ceo
    branch.save(update_fields=["gerente_encargado"])
    return employees


def ensure_workshifts(company: Empresa):
    shifts = []
    definitions = [
        ("Turno Mañana", time(8, 0), time(17, 0), [0, 1, 2, 3, 4]),
        ("Turno Tarde", time(10, 0), time(19, 0), [0, 1, 2, 3, 4]),
    ]
    for name, start, end, days in definitions:
        ws, _ = WorkShift.objects.get_or_create(
            empresa=company,
            name=name,
            defaults={"start_time": start, "end_time": end, "days": days},
        )
        shifts.append(ws)
    return shifts


def ensure_contracts(employees, shifts):
    today = date.today()
    for emp in employees:
        contract = getattr(emp, "contract", None)
        if contract:
            continue
        start = today - timedelta(days=365 + random.randint(0, 120))
        duration_months = random.choice([12, 18, 0])  # 0 => indefinido
        end = None if duration_months == 0 else start + timedelta(days=30 * duration_months)
        shift = random.choice(shifts)
        salary = float(emp.cargo.salario_base or 4000000)
        contract = Contract.objects.create(
            employee=emp,
            contract_type=random.choice(["INDEFINIDO", "PLAZO_FIJO", "SERVICIOS_PRO"]),
            start_date=start,
            end_date=end,
            salary=salary,
            schedule_description=f"{shift.start_time.strftime('%H:%M')} - {shift.end_time.strftime('%H:%M')}",
            is_active=True,
        )
        emp.current_shift = shift
        emp.save(update_fields=["current_shift"])


def seed_attendance(employees):
    today = timezone.localdate()
    start_window = today - timedelta(days=7)
    AttendanceRecord.objects.filter(employee__in=employees, timestamp__date__gte=start_window).delete()

    for emp in employees:
        shift_start = emp.current_shift.start_time if emp.current_shift else time(8, 0)
        shift_end = emp.current_shift.end_time if emp.current_shift else time(17, 0)
        for delta_days in range(1, 6):  # últimos 5 días
            work_day = today - timedelta(days=delta_days)
            base_in = datetime.combine(work_day, shift_start)
            base_out = datetime.combine(work_day, shift_end)
            tardy = random.random() < 0.25
            check_in_time = base_in + timedelta(minutes=random.randint(0, 25) if tardy else random.randint(0, 5))
            check_out_time = base_out + timedelta(minutes=random.randint(0, 30))

            AttendanceRecord.objects.create(
                employee=emp,
                timestamp=timezone.make_aware(check_in_time),
                type="CHECK_IN",
                latitude=4.6 + random.random() * 0.05,
                longitude=-74.08 + random.random() * 0.05,
                is_late=tardy,
            )
            AttendanceRecord.objects.create(
                employee=emp,
                timestamp=timezone.make_aware(check_out_time),
                type="CHECK_OUT",
                latitude=4.6 + random.random() * 0.05,
                longitude=-74.08 + random.random() * 0.05,
                is_late=False,
            )


def seed_leave_requests(employees):
    # Tipos legacy
    vacaciones, _ = TipoAusencia.objects.get_or_create(nombre="Vacaciones", defaults={"afecta_sueldo": False})
    personal, _ = TipoAusencia.objects.get_or_create(nombre="Permiso Personal", defaults={"afecta_sueldo": True})

    today = date.today()
    for idx, emp in enumerate(employees):
        start = today - timedelta(days=10 + idx)
        end = start + timedelta(days=2)
        SolicitudAusencia.objects.get_or_create(
            empleado=emp,
            tipo_ausencia=vacaciones if idx % 2 == 0 else personal,
            fecha_inicio=start,
            fecha_fin=end,
            motivo="Solicitud de prueba",
            defaults={"estado": "aprobado" if idx % 3 else "pendiente"},
        )

        # Nueva tabla (utilizada en nómina para días sin goce)
        new_status = random.choice(["REJECTED", "APPROVED", "PENDING"])
        LeaveRequest.objects.get_or_create(
            empleado=emp,
            start_date=start,
            end_date=end,
            days=2,
            defaults={
                "reason": "Seed demo",
                "status": new_status,
            },
        )


def seed_onboarding(employees):
    titles = ["Subir documentos", "Firma de contrato", "Configurar cuenta bancaria"]
    today = date.today()
    for emp in employees:
        if emp.onboarding_tasks.exists():
            continue
        for idx, title in enumerate(titles):
            OnboardingTask.objects.create(
                employee=emp,
                title=title,
                description=f"{title} para {emp.nombre_completo}",
                is_completed=idx == 0,
                due_date=today + timedelta(days=idx + 1),
            )


def run():
    company = ensure_company()
    ensure_admin_user()
    branch = ensure_branch(company)
    positions = ensure_positions(company, branch)
    employees = ensure_employees(company, branch, positions)
    shifts = ensure_workshifts(company)
    ensure_contracts(employees, shifts)
    seed_attendance(employees)
    seed_leave_requests(employees)
    seed_onboarding(employees)
    print("=== Seed demo completado ===")
    print(f"Empleados: {len(employees)}")
    print(f"Registros de asistencia creados (últimos 5 días x empleados): {len(employees) * 10}")
    print("Onboarding, permisos y contratos sembrados")


if __name__ == "__main__":
    run()
