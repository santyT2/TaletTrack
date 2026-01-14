@echo off
TITLE Punto Pymes - Instalar Dependencias

echo ==========================================
echo [INFO] Verificando e instalando dependencias...
echo ==========================================

REM Pip revisara si ya estan instaladas. Si no, las instalara.
pip install -r requirements.txt

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Hubo un problema instalando las dependencias.
) ELSE (
    echo [INFO] Dependencias verificadas correctamente.
)
pause