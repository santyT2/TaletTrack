@echo off
echo ====================================
echo  CONFIGURACION DEL BACKEND
echo ====================================
echo.

cd backend

echo [1/4] Instalando dependencias adicionales...
call pip install django-cors-headers django-filter pillow

echo.
echo [2/4] Creando migraciones...
call python manage.py makemigrations

echo.
echo [3/4] Aplicando migraciones...
call python manage.py migrate

echo.
echo [4/4] Verificando configuracion...
call python manage.py check

echo.
echo ====================================
echo  CONFIGURACION COMPLETADA!
echo ====================================
echo.
echo IMPORTANTE: Asegurate de agregar las siguientes configuraciones
echo en backend/talent_track/settings.py:
echo.
echo INSTALLED_APPS = [
echo     ...
echo     'corsheaders',
echo     'rest_framework',
echo     'django_filters',
echo ]
echo.
echo MIDDLEWARE = [
echo     'corsheaders.middleware.CorsMiddleware',  # Al inicio
echo     ...
echo ]
echo.
echo CORS_ALLOWED_ORIGINS = [
echo     "http://localhost:3000",
echo     "http://localhost:5173",
echo ]
echo.
echo CORS_ALLOW_CREDENTIALS = True
echo.
echo REST_FRAMEWORK = {
echo     'DEFAULT_PERMISSION_CLASSES': [
echo         'rest_framework.permissions.IsAuthenticated',
echo     ],
echo }
echo.
pause
