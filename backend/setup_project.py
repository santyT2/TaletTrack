#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════
SCRIPT DE SETUP AUTOMATIZADO - PROYECTO TALENT TRACK (HEADLESS API)
═══════════════════════════════════════════════════════════════════

Este script automatiza completamente la configuración inicial del proyecto:

1. Crea la base de datos MySQL 'talent_track_db'
2. Ejecuta migraciones de Django
3. Crea superusuario (opcional)
4. Puebla datos de prueba (opcional)
5. Colecta archivos estáticos

USO:
    python setup_project.py

REQUISITOS:
    - MySQL Server corriendo en localhost:3306
    - Python 3.11+
    - Paquetes: pip install -r requirements.txt
    - Variables de entorno en .env (opcional)

AUTOR: Senior Backend Architect
FECHA: 2024
"""

import os
import sys
import subprocess
import mysql.connector
from mysql.connector import Error
from pathlib import Path
from getpass import getpass
from datetime import date, time

# Colores para terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    """Imprime encabezado con formato"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}")
    print(f" {message}")
    print(f"{'='*70}{Colors.ENDC}\n")

def print_success(message):
    """Imprime mensaje de éxito"""
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")

def print_error(message):
    """Imprime mensaje de error"""
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def print_warning(message):
    """Imprime mensaje de advertencia"""
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")

def print_info(message):
    """Imprime mensaje informativo"""
    print(f"{Colors.OKCYAN}ℹ {message}{Colors.ENDC}")


def get_mysql_credentials():
    """
    Solicita credenciales MySQL al usuario.
    Usa valores por defecto si el usuario presiona Enter.
    """
    print_header("CONFIGURACIÓN MYSQL")
    print_info("Ingrese las credenciales de MySQL (presione Enter para usar defaults)")
    
    host = input(f"Host [{Colors.OKGREEN}localhost{Colors.ENDC}]: ").strip() or 'localhost'
    port = input(f"Puerto [{Colors.OKGREEN}3306{Colors.ENDC}]: ").strip() or '3306'
    user = input(f"Usuario [{Colors.OKGREEN}root{Colors.ENDC}]: ").strip() or 'root'
    password = getpass(f"Contraseña: ")
    
    return {
        'host': host,
        'port': port,
        'user': user,
        'password': password
    }


def create_database(credentials):
    """
    Crea la base de datos 'talent_track_db' si no existe.
    """
    print_header("PASO 1: CREACIÓN DE BASE DE DATOS")
    
    db_name = 'talent_track_db'
    
    try:
        # Conectar a MySQL (sin especificar database)
        connection = mysql.connector.connect(
            host=credentials['host'],
            port=credentials['port'],
            user=credentials['user'],
            password=credentials['password']
        )
        
        if connection.is_connected():
            print_success(f"Conectado a MySQL Server {credentials['host']}:{credentials['port']}")
            
            cursor = connection.cursor()
            
            # Verificar si la base de datos existe
            cursor.execute(f"SHOW DATABASES LIKE '{db_name}'")
            result = cursor.fetchone()
            
            if result:
                print_warning(f"La base de datos '{db_name}' ya existe")
                
                # Preguntar si quiere recrearla
                recreate = input(f"{Colors.WARNING}¿Desea ELIMINARLA y recrearla? (s/N): {Colors.ENDC}").strip().lower()
                
                if recreate == 's':
                    cursor.execute(f"DROP DATABASE {db_name}")
                    print_info(f"Base de datos '{db_name}' eliminada")
                    
                    cursor.execute(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                    print_success(f"Base de datos '{db_name}' creada exitosamente")
                else:
                    print_info("Se usará la base de datos existente")
            else:
                # Crear base de datos
                cursor.execute(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                print_success(f"Base de datos '{db_name}' creada exitosamente")
            
            cursor.close()
            connection.close()
            
            return True
            
    except Error as e:
        print_error(f"Error al conectar a MySQL: {e}")
        print_info("Asegúrate de que MySQL está corriendo y las credenciales son correctas")
        return False


def update_env_file(credentials):
    """
    Crea o actualiza el archivo .env con las credenciales de MySQL.
    """
    print_header("PASO 2: CONFIGURACIÓN DE VARIABLES DE ENTORNO")
    
    base_dir = Path(__file__).resolve().parent
    env_path = base_dir / '.env'
    
    env_content = f"""# =======================================================
# CONFIGURACIÓN MYSQL - TALENT TRACK (HEADLESS API)
# =======================================================

# Database Configuration
DB_ENGINE=django.db.backends.mysql
DB_NAME=talent_track_db
DB_USER={credentials['user']}
DB_PASSWORD={credentials['password']}
DB_HOST={credentials['host']}
DB_PORT={credentials['port']}

# Django Settings
SECRET_KEY=django-insecure-n5s!w(r3!5zrsdkd(%tc0t*cqukeylv(y^bzl6_cg@fn^9+)i(
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Settings (Frontend URLs)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
"""
    
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print_success(f"Archivo .env creado: {env_path}")
    return True


def run_migrations():
    """
    Ejecuta makemigrations y migrate de Django.
    """
    print_header("PASO 3: EJECUCIÓN DE MIGRACIONES")
    
    try:
        # makemigrations
        print_info("Ejecutando makemigrations...")
        result = subprocess.run(
            [sys.executable, 'manage.py', 'makemigrations'],
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        print_success("Makemigrations ejecutado correctamente")
        
        # migrate
        print_info("Ejecutando migrate...")
        result = subprocess.run(
            [sys.executable, 'manage.py', 'migrate'],
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        print_success("Migrate ejecutado correctamente")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print_error(f"Error al ejecutar migraciones: {e}")
        print(e.stderr)
        return False


def create_superuser():
    """
    Pregunta si desea crear un superusuario.
    """
    print_header("PASO 4: CREACIÓN DE SUPERUSUARIO (OPCIONAL)")
    
    create = input(f"¿Desea crear un superusuario? (s/N): ").strip().lower()
    
    if create == 's':
        try:
            print_info("Ejecutando createsuperuser...")
            subprocess.run(
                [sys.executable, 'manage.py', 'createsuperuser'],
                check=True
            )
            print_success("Superusuario creado exitosamente")
            return True
        except subprocess.CalledProcessError as e:
            print_error(f"Error al crear superusuario: {e}")
            return False
    else:
        print_info("Omitiendo creación de superusuario")
        return True


def populate_data():
    """
    Pregunta si desea poblar datos de prueba.
    """
    print_header("PASO 5: POBLACIÓN DE DATOS DE PRUEBA (OPCIONAL)")
    
    populate = input(f"¿Desea poblar datos de prueba? (s/N): ").strip().lower()
    
    if populate == 's':
        try:
            print_info("Ejecutando populate_data.py...")
            result = subprocess.run(
                [sys.executable, 'populate_data.py'],
                check=True,
                capture_output=True,
                text=True
            )
            print(result.stdout)
            print_success("Datos de prueba poblados exitosamente")
            return True
        except subprocess.CalledProcessError as e:
            print_error(f"Error al poblar datos: {e}")
            print(e.stderr)
            return False
        except FileNotFoundError:
            print_warning("Archivo populate_data.py no encontrado")
            return False
    else:
        print_info("Omitiendo población de datos")
        return True


def collect_static():
    """
    Ejecuta collectstatic de Django.
    """
    print_header("PASO 6: COLECTAR ARCHIVOS ESTÁTICOS")
    
    try:
        print_info("Ejecutando collectstatic...")
        result = subprocess.run(
            [sys.executable, 'manage.py', 'collectstatic', '--noinput'],
            check=True,
            capture_output=True,
            text=True
        )
        print_success("Archivos estáticos colectados correctamente")
        return True
        
    except subprocess.CalledProcessError as e:
        print_warning(f"Advertencia al colectar estáticos: {e}")
        # No es crítico, continuar
        return True


def seed_demo_data():
    """Crea datos mínimos de demo: empresa, sucursal, puesto, empleado, contrato, turno y geocerca."""
    print_header("PASO 6: CARGA DE DATOS DEMO (MINIMAL)")

    choice = input("¿Desea cargar datos demo mínimos? (S/n): ").strip().lower() or 's'
    if choice != 's':
        print_info("Omitiendo datos demo")
        return True

    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talent_track.settings')
        import django
        django.setup()

        from django.contrib.auth import get_user_model
        from core.models import Empresa
        from employees.models import Sucursal, Puesto, Empleado, Contrato
        from attendance.models import Geocerca, ReglaAsistencia, Turno

        User = get_user_model()

        empresa, _ = Empresa.objects.get_or_create(
            ruc_nit="9999999999",
            defaults={
                "razon_social": "Demo Corp",
                "nombre_comercial": "Demo Corp",
                "direccion": "Av. Principal 123",
                "pais": "EC",
                "moneda": "USD",
                "estado": "activo",
            },
        )

        sucursal, _ = Sucursal.objects.get_or_create(
            empresa=empresa,
            nombre="Sede Central",
            defaults={
                "tipo": "sede",
                "ciudad": "Quito",
                "direccion": "Av. Principal 123",
                "estado": "activo",
            },
        )

        puesto, _ = Puesto.objects.get_or_create(
            empresa=empresa,
            nombre="Analista",
            unidad=sucursal,
            defaults={
                "nivel": "junior",
                "salario_referencial": 900,
                "descripcion": "Puesto demo",
            },
        )

        empleado, _ = Empleado.objects.get_or_create(
            empresa=empresa,
            documento="9999999999",
            defaults={
                "nombres": "Empleado",
                "apellidos": "Demo",
                "email": "empleado.demo@example.com",
                "telefono": "+593999999999",
                "fecha_ingreso": date.today(),
                "sucursal": sucursal,
                "puesto": puesto,
                "estado": "activo",
            },
        )

        Contrato.objects.get_or_create(
            empleado=empleado,
            tipo="indefinido",
            fecha_inicio=date.today(),
            defaults={
                "salario_base": 900,
                "jornada_semanal_horas": 40,
                "estado": "activo",
            },
        )

        geocerca, _ = Geocerca.objects.get_or_create(
            empresa=empresa,
            nombre="Oficina Central",
            tipo="circulo",
            defaults={
                "coordenadas": {"center": {"lat": -0.1807, "lng": -78.4678}, "radius_m": 200},
                "activo": True,
            },
        )

        ReglaAsistencia.objects.get_or_create(
            empresa=empresa,
            defaults={
                "considera_tardanza_min": 5,
                "geocerca": geocerca,
                "ip_permitidas": [],
            },
        )

        Turno.objects.get_or_create(
            empresa=empresa,
            nombre="Turno General",
            defaults={
                "hora_inicio": time(9, 0),
                "hora_fin": time(18, 0),
                "dias_semana": [0, 1, 2, 3, 4],
                "tolerancia_minutos": 5,
                "requiere_gps": True,
                "requiere_foto": False,
            },
        )

        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "admin1234")
            print_success("Superusuario 'admin' creado (admin1234)")

        print_success("Datos demo creados/actualizados")
        return True

    except Exception as e:
        print_error(f"Error creando datos demo: {e}")
        return False


def show_final_instructions():
    """
    Muestra instrucciones finales al usuario.
    """
    print_header("CONFIGURACIÓN COMPLETADA ✓")
    
    print(f"""
{Colors.OKGREEN}{Colors.BOLD}¡Setup completado exitosamente!{Colors.ENDC}

{Colors.OKCYAN}Pasos siguientes:{Colors.ENDC}

1. Iniciar servidor Django:
   {Colors.OKGREEN}python manage.py runserver{Colors.ENDC}

2. Acceder al admin panel:
   {Colors.OKGREEN}http://localhost:8000/admin/{Colors.ENDC}

3. Probar API REST:
   {Colors.OKGREEN}http://localhost:8000/api/employees/api/empleados/{Colors.ENDC}
   {Colors.OKGREEN}http://localhost:8000/api/attendance/marcar/{Colors.ENDC}

4. Iniciar frontend React (en otra terminal):
   {Colors.OKGREEN}cd frontend{Colors.ENDC}
   {Colors.OKGREEN}npm run dev{Colors.ENDC}

{Colors.WARNING}DOCUMENTACIÓN API:{Colors.ENDC}
   Ver archivos employees/urls.py y attendance/urls.py para endpoints disponibles.

{Colors.WARNING}NOTA IMPORTANTE:{Colors.ENDC}
   La API está configurada en modo HEADLESS (solo JSON).
   No hay vistas HTML - todo se consume desde el frontend React.
""")


def main():
    """
    Función principal que ejecuta el setup completo.
    """
    print(f"""
{Colors.HEADER}{Colors.BOLD}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   TALENT TRACK - SCRIPT DE SETUP AUTOMATIZADO                ║
║   Backend Headless API (Django + MySQL)                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
{Colors.ENDC}
    """)
    
    # Verificar que estamos en el directorio correcto
    if not Path('manage.py').exists():
        print_error("ERROR: manage.py no encontrado")
        print_info("Asegúrate de ejecutar este script desde el directorio backend/")
        sys.exit(1)
    
    # Solicitar credenciales MySQL
    credentials = get_mysql_credentials()
    
    # Paso 1: Crear base de datos
    if not create_database(credentials):
        print_error("Setup interrumpido: No se pudo crear la base de datos")
        sys.exit(1)
    
    # Paso 2: Crear archivo .env
    update_env_file(credentials)
    
    # Paso 3: Ejecutar migraciones
    if not run_migrations():
        print_error("Setup interrumpido: Fallo en migraciones")
        sys.exit(1)
    
    # Paso 4: Crear superusuario (opcional)
    create_superuser()
    
    # Paso 5: Poblar datos (opcional)
    populate_data()
    
    # Paso 6: Cargar datos demo mínimos
    if not seed_demo_data():
        print_warning("Continuando sin datos demo")

    # Paso 7: Colectar estáticos
    collect_static()
    
    # Mostrar instrucciones finales
    show_final_instructions()
    
    print(f"{Colors.OKGREEN}{Colors.BOLD}✓ Setup completado con éxito{Colors.ENDC}\n")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Setup interrumpido por el usuario{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print_error(f"Error inesperado: {e}")
        sys.exit(1)
