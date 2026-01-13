import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talent_track.settings')
django.setup()

from employees.models import Sucursal, Cargo

# Crear sucursales
sucursales = [
    {'nombre': 'Sucursal Principal', 'direccion': 'Calle 123 #45-67', 'ciudad': 'Bogotá'},
    {'nombre': 'Sucursal Norte', 'direccion': 'Carrera 89 #12-34', 'ciudad': 'Bogotá'},
    {'nombre': 'Sucursal Sur', 'direccion': 'Avenida 56 #78-90', 'ciudad': 'Bogotá'},
]

for suc_data in sucursales:
    suc, created = Sucursal.objects.get_or_create(
        nombre=suc_data['nombre'],
        defaults=suc_data
    )
    if created:
        print(f'✅ Sucursal "{suc.nombre}" creada')
    else:
        print(f'✅ Sucursal "{suc.nombre}" ya existe')

# Crear cargos
cargos = [
    {'nombre': 'Gerente General', 'descripcion': 'Responsable general de la empresa', 'salario_base': 5000000, 'nivel_requerido': 'senior'},
    {'nombre': 'Analista de Sistemas', 'descripcion': 'Desarrollo y mantenimiento de software', 'salario_base': 3500000, 'nivel_requerido': 'semior'},
    {'nombre': 'Asistente Administrativo', 'descripcion': 'Apoyo administrativo general', 'salario_base': 1800000, 'nivel_requerido': 'junior'},
    {'nombre': 'Contador', 'descripcion': 'Gestión financiera y contable', 'salario_base': 2800000, 'nivel_requerido': 'semior'},
    {'nombre': 'Vendedor', 'descripcion': 'Ventas y atención al cliente', 'salario_base': 1500000, 'nivel_requerido': 'junior'},
]

for cargo_data in cargos:
    cargo, created = Cargo.objects.get_or_create(
        nombre=cargo_data['nombre'],
        defaults=cargo_data
    )
    if created:
        print(f'✅ Cargo "{cargo.nombre}" creado')
    else:
        print(f'✅ Cargo "{cargo.nombre}" ya existe')

print('✅ Datos iniciales poblados exitosamente')