@echo off
setlocal
REM Orquesta el Dev Manager y crea .venv si no existe
pushd "%~dp0"

set "VENV_DIR=%~dp0.venv"
set "PYTHON=%VENV_DIR%\Scripts\python.exe"

if not exist "%PYTHON%" (
    echo Creando entorno virtual .venv (requiere Python 3.10+ en PATH)...
    py -3 -m venv "%VENV_DIR%" 2>nul || python -m venv "%VENV_DIR%"
    if not exist "%PYTHON%" (
        echo No se pudo crear el entorno virtual. Instala Python 3.10+ y reintenta.
        pause
        exit /b 1
    )
    echo Entorno .venv creado. Ejecuta la opcion 1 del Dev Manager para instalar dependencias.
)

"%PYTHON%" "%~dp0dev_manager.py"

popd
pause
