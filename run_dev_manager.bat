@echo off
setlocal EnableExtensions
REM Orquesta el Dev Manager y crea .venv si no existe (tolerante a rutas con espacios)
pushd "%~dp0"

set "VENV_DIR=%~dp0.venv"
set "PYTHON=%VENV_DIR%\Scripts\python.exe"

if exist "%PYTHON%" goto have_venv
echo Creando entorno virtual .venv (requiere Python 3.10+ en PATH)...
py -3 -m venv "%VENV_DIR%" 2>nul || python -m venv "%VENV_DIR%"

:have_venv
if not exist "%PYTHON%" (
    echo No se pudo crear el entorno virtual. Instala Python 3.10+ y reintenta.
    pause
    exit /b 1
)

echo Ejecutando Dev Manager con: "%PYTHON%"
call "%PYTHON%" "%~dp0dev_manager.py" %*
set "EXITCODE=%ERRORLEVEL%"

popd
echo Finalizado con codigo %EXITCODE%. Presiona una tecla para cerrar.
pause
exit /b %EXITCODE%
