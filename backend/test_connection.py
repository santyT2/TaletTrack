"""
Script para verificar la conexión a la base de datos MySQL
"""
import os
import sys

# Configurar PyMySQL
import pymysql

# Parche para compatibilidad con PyMySQL (simula versión compatible para Django)
pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talent_track.settings')

import django

# Asegurar que el directorio raíz del proyecto esté en sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        
    print("=" * 50)
    print("✅ CONEXIÓN EXITOSA A MYSQL")
    print("=" * 50)
    print(f"Base de datos: {connection.settings_dict['NAME']}")
    print(f"Host: {connection.settings_dict['HOST']}")
    print(f"Puerto: {connection.settings_dict['PORT']}")
    print(f"Usuario: {connection.settings_dict['USER']}")
    print(f"Versión MySQL: {version[0]}")
    print("=" * 50)
    
except Exception as e:
    print("=" * 50)
    print("❌ ERROR DE CONEXIÓN")
    print("=" * 50)
    print(f"Error: {e}")
    print("=" * 50)
    sys.exit(1)
