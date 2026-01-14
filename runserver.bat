@echo off
echo Activando entorno virtual...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo Error al activar el entorno virtual.
    pause
    exit /b 1
)

echo Iniciando servidor de desarrollo...
python manage.py runserver
pause