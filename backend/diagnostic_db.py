import os
import sys
import django
from pprint import pprint

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "talent_track.settings")
django.setup()

from django.conf import settings  # noqa: E402
from django.db import connections  # noqa: E402
from django.db import transaction  # noqa: E402
from django.db.utils import OperationalError  # noqa: E402

from core.models import Empresa  # noqa: E402
from employees.models import Empleado  # noqa: E402


def print_db_settings():
    db = settings.DATABASES.get("default", {})
    print("== DATABASE CONFIG (default) ==")
    print(f"ENGINE : {db.get('ENGINE')}")
    print(f"NAME   : {db.get('NAME')}")
    print(f"USER   : {db.get('USER')}")
    print(f"HOST   : {db.get('HOST')}")
    print(f"PORT   : {db.get('PORT')}")
    print()


def check_connection():
    print("== CONNECTION TEST ==")
    try:
        connections["default"].ensure_connection()
        print("CONEXIÓN EXITOSA")
    except OperationalError as exc:
        print("ERROR DE CONEXIÓN:", exc)
    except Exception as exc:  # noqa: BLE001
        print("ERROR INESPERADO:", exc)
    print()


def counts():
    print("== COUNTS ==")
    print("Empresas :", Empresa.objects.count())
    print("Empleados:", Empleado.objects.count())
    print()


def try_create_empresa():
    print("== WRITE TEST ==")
    try:
        with transaction.atomic():
            emp = Empresa.objects.create(
                razon_social="TEST EMPRESA DIAG",
                nombre_comercial="TEST EMPRESA DIAG",
                ruc_nit="RUC-DIAG-12345",
            )
        print(f"CREADO OK: id={emp.id}, nombre={emp.nombre_comercial}")
    except Exception as exc:  # noqa: BLE001
        print("ERROR AL CREAR EMPRESA:", exc)
    print()


def main():
    print_db_settings()
    check_connection()
    counts()
    try_create_empresa()


if __name__ == "__main__":
    main()
