@echo off
TITLE HRMS - Configuración Backend

echo ========================================
echo [INFO] Configurando Backend Django HRMS
echo ========================================

REM Navegar al directorio backend
cd backend

REM 1. Crear migraciones
echo [INFO] Creando migraciones...
python manage.py makemigrations

REM 2. Aplicar migraciones
echo [INFO] Aplicando migraciones...
python manage.py migrate

REM 3. Verificar modelos
echo [INFO] Verificando modelos...
python manage.py check

echo.
echo ========================================
echo [SUCCESS] Backend configurado exitosamente
echo ========================================
echo.
echo Puedes iniciar el servidor con: python manage.py runserver
echo.
pause
