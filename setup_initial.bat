@echo off
TITLE Punto Pymes - Configuracion Inicial

echo ==========================================
echo [INFO] 1. Instalando dependencias...
echo ==========================================
REM Usamos call para que al terminar el otro bat, regrese aqui
call install_dependencies.bat

echo ==========================================
echo [INFO] 2. Aplicando migraciones...
echo ==========================================
python manage.py migrate

echo ==========================================
echo [INFO] 3. Creando superusuario administrativo...
echo ==========================================
python create_superuser.py

echo [INFO] Configuracion terminada. Ahora puedes usar run_project.bat
echo ==========================================
pause