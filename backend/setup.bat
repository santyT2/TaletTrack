@echo off
echo Activando entorno virtual...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo Error al activar el entorno virtual.
    pause
    exit /b 1
)

echo Verificando e instalando dependencias...
if exist requirements.txt (
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo Error al instalar dependencias.
        pause
        exit /b 1
    )
) else (
    echo requirements.txt no encontrado. Instala las dependencias manualmente.
)

echo Ejecutando migraciones...
python manage.py migrate
if %errorlevel% neq 0 (
    echo Error al ejecutar migraciones.
    pause
    exit /b 1
)

echo Configuracion completada.
pause