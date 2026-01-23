import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talent_track.settings')
django.setup()

from employees.models import Empleado, Cargo, Sucursal
from attendance.models import RegistroAsistencia
from django.contrib.auth.models import User

print("=" * 60)
print("📊 ESTADO DE LA BASE DE DATOS")
print("=" * 60)

# Usuarios del sistema
usuarios_count = User.objects.count()
print(f"\n👤 Usuarios del sistema: {usuarios_count}")
if usuarios_count > 0:
    for user in User.objects.all():
        print(f"   - {user.username} {'(admin)' if user.is_superuser else ''}")

# Datos de empleados
print(f"\n🏢 Sucursales: {Sucursal.objects.count()}")
if Sucursal.objects.exists():
    for sucursal in Sucursal.objects.all():
        print(f"   - {sucursal.nombre}")

print(f"\n💼 Cargos: {Cargo.objects.count()}")
if Cargo.objects.exists():
    for cargo in Cargo.objects.all()[:5]:
        print(f"   - {cargo.nombre}")

print(f"\n👥 Empleados: {Empleado.objects.count()}")
if Empleado.objects.exists():
    for emp in Empleado.objects.all()[:5]:
        print(f"   - {emp.nombres} {emp.apellidos} - {emp.cargo.nombre}")

print(f"\n⏰ Registros de Asistencia: {RegistroAsistencia.objects.count()}")

print("\n" + "=" * 60)
