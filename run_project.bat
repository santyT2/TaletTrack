@echo off
TITLE Punto Pymes - Run Server

echo ==========================================
echo [INFO] Iniciando servidor Django...
echo ==========================================

REM 1. Verificar conexión a la base de datos usando tu script existente
python test_connection.py
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo conectar a la base de datos. Revisa XAMPP o tu servidor MySQL.
    pause
    exit /b
)

REM 2. Aplicar migraciones (crear tablas si no existen)
echo [INFO] Verificando estructura de base de datos (migraciones)...
python manage.py migrate

python manage.py runserver
pause