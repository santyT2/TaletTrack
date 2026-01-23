import os
import django
from datetime import datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talent_track.settings')
django.setup()

from employees.models import Sucursal, Cargo, Empleado
from attendance.models import RegistroAsistencia
from django.utils import timezone

print("=" * 60)
print("🚀 POBLANDO BASE DE DATOS CON DATOS DE PRUEBA")
print("=" * 60)

# ========== SUCURSALES ==========
print("\n📍 Creando Sucursales...")
sucursales_data = [
    {'nombre': 'Sucursal Principal', 'direccion': 'Calle 123 #45-67', 'ciudad': 'Bogotá', 'telefono': '3001234567'},
    {'nombre': 'Sucursal Norte', 'direccion': 'Carrera 89 #12-34', 'ciudad': 'Bogotá', 'telefono': '3007654321'},
    {'nombre': 'Sucursal Sur', 'direccion': 'Avenida 56 #78-90', 'ciudad': 'Bogotá', 'telefono': '3009876543'},
    {'nombre': 'Sucursal Centro', 'direccion': 'Calle 100 #15-20', 'ciudad': 'Medellín', 'telefono': '3005551234'},
]

sucursales = {}
for suc_data in sucursales_data:
    suc, created = Sucursal.objects.get_or_create(
        nombre=suc_data['nombre'],
        defaults=suc_data
    )
    sucursales[suc_data['nombre']] = suc
    print(f"   {'✅ Creada' if created else '✅ Ya existe'}: {suc.nombre}")

# ========== CARGOS ==========
print("\n💼 Creando Cargos...")
cargos_data = [
    {'nombre': 'Gerente', 'descripcion': 'Responsable de área', 'salario_base': 5000000, 'nivel_requerido': 'senior'},
    {'nombre': 'Desarrollador Senior', 'descripcion': 'Desarrollo de software', 'salario_base': 4500000, 'nivel_requerido': 'senior'},
    {'nombre': 'Analista de Sistemas', 'descripcion': 'Análisis y diseño de sistemas', 'salario_base': 3500000, 'nivel_requerido': 'semior'},
    {'nombre': 'Analista de Recursos Humanos', 'descripcion': 'Gestión de personal', 'salario_base': 3200000, 'nivel_requerido': 'semior'},
    {'nombre': 'Contador', 'descripcion': 'Gestión financiera', 'salario_base': 2800000, 'nivel_requerido': 'semior'},
    {'nombre': 'Asistente Administrativo', 'descripcion': 'Apoyo administrativo', 'salario_base': 1800000, 'nivel_requerido': 'junior'},
    {'nombre': 'Vendedor', 'descripcion': 'Ventas y atención', 'salario_base': 1500000, 'nivel_requerido': 'junior'},
    {'nombre': 'Soporte Técnico', 'descripcion': 'Asistencia técnica', 'salario_base': 2000000, 'nivel_requerido': 'junior'},
]

cargos = {}
for cargo_data in cargos_data:
    cargo, created = Cargo.objects.get_or_create(
        nombre=cargo_data['nombre'],
        defaults=cargo_data
    )
    cargos[cargo_data['nombre']] = cargo
    print(f"   {'✅ Creado' if created else '✅ Ya existe'}: {cargo.nombre} (${cargo.salario_base:,})")

# ========== EMPLEADOS ==========
print("\n👥 Creando Empleados...")
empleados_data = [
    {
        'nombres': 'Carlos Alberto',
        'apellidos': 'Rodríguez Pérez',
        'cedula': '1234567890',
        'email': 'carlos.rodriguez@empresa.com',
        'telefono': '3101234567',
        'cargo': 'Gerente',
        'sucursal': 'Sucursal Principal',
        'fecha_ingreso': '2020-01-15',
        'fecha_nacimiento': '1985-05-20',
        'estado': 'activo',
    },
    {
        'nombres': 'Ana María',
        'apellidos': 'González López',
        'cedula': '9876543210',
        'email': 'ana.gonzalez@empresa.com',
        'telefono': '3109876543',
        'cargo': 'Desarrollador Senior',
        'sucursal': 'Sucursal Principal',
        'fecha_ingreso': '2021-03-20',
        'fecha_nacimiento': '1990-08-15',
        'estado': 'activo',
    },
    {
        'nombres': 'Luis Fernando',
        'apellidos': 'Martínez Silva',
        'cedula': '1122334455',
        'email': 'luis.martinez@empresa.com',
        'telefono': '3111122334',
        'cargo': 'Analista de Sistemas',
        'sucursal': 'Sucursal Norte',
        'fecha_ingreso': '2021-06-10',
        'fecha_nacimiento': '1992-03-10',
        'estado': 'activo',
    },
    {
        'nombres': 'Diana Patricia',
        'apellidos': 'Ramírez Castro',
        'cedula': '5566778899',
        'email': 'diana.ramirez@empresa.com',
        'telefono': '3125566778',
        'cargo': 'Analista de Recursos Humanos',
        'sucursal': 'Sucursal Principal',
        'fecha_ingreso': '2022-01-05',
        'fecha_nacimiento': '1988-11-25',
        'estado': 'activo',
    },
    {
        'nombres': 'Roberto',
        'apellidos': 'Díaz Morales',
        'cedula': '6677889900',
        'email': 'roberto.diaz@empresa.com',
        'telefono': '3136677889',
        'cargo': 'Contador',
        'sucursal': 'Sucursal Sur',
        'fecha_ingreso': '2021-08-15',
        'fecha_nacimiento': '1987-07-30',
        'estado': 'activo',
    },
    {
        'nombres': 'Sofía',
        'apellidos': 'Hernández Vargas',
        'cedula': '7788990011',
        'email': 'sofia.hernandez@empresa.com',
        'telefono': '3147788990',
        'cargo': 'Asistente Administrativo',
        'sucursal': 'Sucursal Norte',
        'fecha_ingreso': '2022-05-20',
        'fecha_nacimiento': '1995-02-14',
        'estado': 'activo',
    },
    {
        'nombres': 'Miguel Ángel',
        'apellidos': 'Torres Ruiz',
        'cedula': '8899001122',
        'email': 'miguel.torres@empresa.com',
        'telefono': '3158899001',
        'cargo': 'Vendedor',
        'sucursal': 'Sucursal Centro',
        'fecha_ingreso': '2023-02-10',
        'fecha_nacimiento': '1993-09-05',
        'estado': 'activo',
    },
    {
        'nombres': 'Laura',
        'apellidos': 'Jiménez Ortiz',
        'cedula': '9900112233',
        'email': 'laura.jimenez@empresa.com',
        'telefono': '3169900112',
        'cargo': 'Soporte Técnico',
        'sucursal': 'Sucursal Sur',
        'fecha_ingreso': '2023-04-15',
        'fecha_nacimiento': '1994-12-20',
        'estado': 'activo',
    },
    {
        'nombres': 'Andrés',
        'apellidos': 'Moreno Cruz',
        'cedula': '1010101010',
        'email': 'andres.moreno@empresa.com',
        'telefono': '3171010101',
        'cargo': 'Vendedor',
        'sucursal': 'Sucursal Principal',
        'fecha_ingreso': '2023-06-01',
        'fecha_nacimiento': '1996-04-18',
        'estado': 'activo',
    },
    {
        'nombres': 'Valentina',
        'apellidos': 'Sánchez Rojas',
        'cedula': '2020202020',
        'email': 'valentina.sanchez@empresa.com',
        'telefono': '3182020202',
        'cargo': 'Asistente Administrativo',
        'sucursal': 'Sucursal Centro',
        'fecha_ingreso': '2023-09-10',
        'fecha_nacimiento': '1997-06-22',
        'estado': 'activo',
    },
]

empleados_creados = []
for emp_data in empleados_data:
    try:
        cargo = cargos[emp_data['cargo']]
        sucursal = sucursales[emp_data['sucursal']]
        
        emp, created = Empleado.objects.get_or_create(
            cedula=emp_data['cedula'],
            defaults={
                'nombres': emp_data['nombres'],
                'apellidos': emp_data['apellidos'],
                'email': emp_data['email'],
                'telefono': emp_data['telefono'],
                'cargo': cargo,
                'sucursal': sucursal,
                'fecha_ingreso': emp_data['fecha_ingreso'],
                'fecha_nacimiento': emp_data['fecha_nacimiento'],
                'estado': emp_data['estado'],
            }
        )
        empleados_creados.append(emp)
        print(f"   {'✅ Creado' if created else '✅ Ya existe'}: {emp.nombres} {emp.apellidos} - {emp.cargo.nombre}")
    except Exception as e:
        print(f"   ❌ Error creando empleado {emp_data['nombres']}: {e}")

# ========== REGISTROS DE ASISTENCIA ==========
print(f"\n⏰ Creando Registros de Asistencia...")

# Crear registros para los últimos 5 días
hoy = timezone.now().date()
empleados_activos = Empleado.objects.filter(estado='activo')

registros_creados = 0
for dia in range(5, 0, -1):
    fecha = hoy - timedelta(days=dia)
    
    # Crear registros de entrada y salida para empleados aleatorios
    empleados_trabajando = random.sample(list(empleados_activos), k=min(8, len(empleados_activos)))
    
    for empleado in empleados_trabajando:
        # Hora de entrada (entre 8:00 y 9:30)
        hora_entrada = random.randint(8, 9)
        minuto_entrada = random.randint(0, 59) if hora_entrada == 8 else random.randint(0, 30)
        
        # Determinar si es tardanza
        es_tardanza = (hora_entrada == 9 and minuto_entrada > 0) or hora_entrada > 9
        minutos_atraso = 0
        if es_tardanza:
            if hora_entrada == 9:
                minutos_atraso = minuto_entrada
            else:
                minutos_atraso = (hora_entrada - 9) * 60 + minuto_entrada
        
        # Crear registro de ENTRADA
        fecha_hora_entrada = timezone.make_aware(
            datetime.combine(fecha, datetime.min.time().replace(hour=hora_entrada, minute=minuto_entrada))
        )
        
        entrada, created = RegistroAsistencia.objects.get_or_create(
            empleado=empleado,
            fecha_hora__date=fecha,
            tipo='ENTRADA',
            defaults={
                'fecha_hora': fecha_hora_entrada,
                'latitud': 4.6097 + random.uniform(-0.01, 0.01),
                'longitud': -74.0817 + random.uniform(-0.01, 0.01),
                'es_tardanza': es_tardanza,
                'minutos_atraso': minutos_atraso,
            }
        )
        
        if created:
            registros_creados += 1
        
        # Crear registro de SALIDA (70% de probabilidad)
        if random.random() < 0.7:
            hora_salida = random.randint(17, 19)
            minuto_salida = random.randint(0, 59)
            
            fecha_hora_salida = timezone.make_aware(
                datetime.combine(fecha, datetime.min.time().replace(hour=hora_salida, minute=minuto_salida))
            )
            
            salida, created = RegistroAsistencia.objects.get_or_create(
                empleado=empleado,
                fecha_hora__date=fecha,
                tipo='SALIDA',
                defaults={
                    'fecha_hora': fecha_hora_salida,
                    'latitud': 4.6097 + random.uniform(-0.01, 0.01),
                    'longitud': -74.0817 + random.uniform(-0.01, 0.01),
                    'es_tardanza': False,
                    'minutos_atraso': 0,
                }
            )
            
            if created:
                registros_creados += 1

print(f"   ✅ {registros_creados} nuevos registros de asistencia creados")

# ========== RESUMEN FINAL ==========
print("\n" + "=" * 60)
print("📊 RESUMEN DE DATOS EN LA BASE DE DATOS")
print("=" * 60)
print(f"🏢 Sucursales: {Sucursal.objects.count()}")
print(f"💼 Cargos: {Cargo.objects.count()}")
print(f"👥 Empleados: {Empleado.objects.count()}")
print(f"   - Activos: {Empleado.objects.filter(estado='activo').count()}")
print(f"   - Inactivos: {Empleado.objects.filter(estado='inactivo').count()}")
print(f"⏰ Registros de Asistencia: {RegistroAsistencia.objects.count()}")
print(f"   - Entradas: {RegistroAsistencia.objects.filter(tipo='ENTRADA').count()}")
print(f"   - Salidas: {RegistroAsistencia.objects.filter(tipo='SALIDA').count()}")
print(f"   - Tardanzas: {RegistroAsistencia.objects.filter(es_tardanza=True).count()}")
print("=" * 60)
print("✅ ¡BASE DE DATOS POBLADA EXITOSAMENTE!")
print("=" * 60)
