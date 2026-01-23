@echo off
echo ============================================================
echo  INICIANDO BACKEND DEL PROYECTO HRMS
echo ============================================================
echo.
echo [1/2] Verificando base de datos...
python check_database.py
echo.
echo [2/2] Iniciando servidor Django...
echo.
echo  Servidor corriendo en: http://127.0.0.1:8000
echo  Panel admin en: http://127.0.0.1:8000/admin
echo  Usuario: admin
echo  Password: admin123
echo.
echo  Presiona Ctrl+C para detener el servidor
echo ============================================================
echo.
python manage.py runserver
