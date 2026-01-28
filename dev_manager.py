#!/usr/bin/env python3
"""
Dev Manager: orquestador simple para entorno local.
Requisitos: Python 3.10+, pip, npm. Ejecutar desde la raíz del repo.
"""
import os
import subprocess
import sys
from pathlib import Path
from typing import List, Optional

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
ENV_FILE = BACKEND_DIR / ".env"


def run(cmd: List[str], cwd: Optional[Path] = None, check: bool = True) -> int:
    print(f"\n>> {' '.join(cmd)} (cwd={cwd or BASE_DIR})")
    result = subprocess.run(cmd, cwd=cwd or BASE_DIR)
    if check and result.returncode != 0:
        raise SystemExit(result.returncode)
    return result.returncode


def ensure_env() -> None:
    if ENV_FILE.exists():
        print(f".env encontrado en {ENV_FILE}")
        return
    print("No se encontró .env. Creándolo...")
    secret = input("SECRET_KEY (texto libre, minimo 32 chars): ").strip() or "changeme-secret"
    db_name = input("DB_NAME [talent_track_db]: ").strip() or "talent_track_db"
    db_user = input("DB_USER [root]: ").strip() or "root"
    db_pass = input("DB_PASSWORD []: ").strip()
    db_host = input("DB_HOST [localhost]: ").strip() or "localhost"
    db_port = input("DB_PORT [3307]: ").strip() or "3307"
    content = [
        f"SECRET_KEY={secret}",
        "DEBUG=True",
        f"DB_NAME={db_name}",
        f"DB_USER={db_user}",
        f"DB_PASSWORD={db_pass}",
        f"DB_HOST={db_host}",
        f"DB_PORT={db_port}",
    ]
    ENV_FILE.write_text("\n".join(content) + "\n", encoding="utf-8")
    print(f".env creado en {ENV_FILE}")


def test_db_connection() -> bool:
    print("Probando conexión a la BD (manage.py check --database default)...")
    code = subprocess.run(
        [sys.executable, "manage.py", "check", "--database", "default"],
        cwd=BACKEND_DIR,
    ).returncode
    if code == 0:
        print("Conexión a BD OK.")
        return True

    print("Conexión a BD falló.")
    if input("¿Actualizar credenciales en .env ahora? [s/N]: ").strip().lower() == "s":
        db_name = input("DB_NAME: ").strip() or "talent_track_db"
        db_user = input("DB_USER: ").strip() or "root"
        db_pass = input("DB_PASSWORD: ").strip()
        db_host = input("DB_HOST: ").strip() or "localhost"
        db_port = input("DB_PORT: ").strip() or "3307"
        lines = ENV_FILE.read_text(encoding="utf-8").splitlines() if ENV_FILE.exists() else []
        kv = {k: v for k, v in (line.split("=", 1) for line in lines if "=" in line)}
        kv.update(
            {
                "DB_NAME": db_name,
                "DB_USER": db_user,
                "DB_PASSWORD": db_pass,
                "DB_HOST": db_host,
                "DB_PORT": db_port,
            }
        )
        ENV_FILE.write_text("\n".join(f"{k}={v}" for k, v in kv.items()) + "\n", encoding="utf-8")
        print("Credenciales actualizadas. Reintentando check...")
        return test_db_connection()
    return False


def start_servers() -> None:
    print("Levantando Django y Vite en paralelo (CTRL+C para detener)...")
    npm_exe = "npm.cmd" if os.name == "nt" else "npm"
    django_cmd = [sys.executable, "manage.py", "runserver", "0.0.0.0:8000"]
    vite_cmd = [npm_exe, "run", "dev", "--", "--host", "--port", "5173"]
    procs = [
        subprocess.Popen(django_cmd, cwd=BACKEND_DIR),
        subprocess.Popen(vite_cmd, cwd=FRONTEND_DIR, shell=False),
    ]
    try:
        for p in procs:
            p.wait()
    except KeyboardInterrupt:
        print("\nDeteniendo procesos...")
        for p in procs:
            p.terminate()
    finally:
        for p in procs:
            if p.poll() is None:
                p.kill()


def install_all():
    run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], cwd=BACKEND_DIR)
    run(["npm", "install"], cwd=FRONTEND_DIR, check=False)


def dev_mode():
    run([sys.executable, "manage.py", "runserver", "0.0.0.0:8000"], cwd=BACKEND_DIR, check=False)


def migrations():
    run([sys.executable, "manage.py", "makemigrations"], cwd=BACKEND_DIR)
    run([sys.executable, "manage.py", "migrate"], cwd=BACKEND_DIR)


def clean():
    targets = [
        "**/__pycache__",
        ".pytest_cache",
        "frontend/node_modules/.cache",
        "frontend/dist",
        "backend/staticfiles",
    ]
    for pattern in targets:
        for path in BASE_DIR.glob(pattern):
            if path.is_dir():
                print(f"Eliminando {path}")
                subprocess.run(["rmdir", "/s", "/q", str(path)], shell=True)


def tests():
    run([sys.executable, "manage.py", "test"], cwd=BACKEND_DIR, check=False)
    run(["npm", "run", "test", "--", "--watch=false"], cwd=FRONTEND_DIR, check=False)


def precommit():
    run(["pre-commit", "run", "--all-files"], cwd=BASE_DIR, check=False)


def smart_start():
    ensure_env()
    if not test_db_connection():
        print("Smart Start detenido por fallo de conexión a BD.")
        return
    start_servers()


def menu():
    options = {
        "1": ("Instalar Todo (Pip + Npm)", install_all),
        "2": ("Modo Desarrollo (Server)", dev_mode),
        "3": ("Base de Datos (Migraciones)", migrations),
        "4": ("Limpieza (Cache y temporales)", clean),
        "5": ("Testeo", tests),
        "6": ("Pre-Commit", precommit),
        "7": ("Levantamiento Inteligente (Smart Start)", smart_start),
    }
    print("\n=== Dev Manager ===")
    for key, (desc, _) in options.items():
        print(f"[{key}] {desc}")
    choice = input("Elige opción: ").strip()
    action = options.get(choice)
    if not action:
        print("Opción inválida.")
        return
    action[1]()


if __name__ == "__main__":
    try:
        menu()
    except KeyboardInterrupt:
        print("\nInterrumpido por usuario.")
