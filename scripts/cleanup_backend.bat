@echo off
echo ====================================
echo  LIMPIEZA DE BACKEND (DJANGO)
echo ====================================
echo.
echo Este script eliminara las templates antiguas de Django
echo que NO se usan en la arquitectura moderna con React.
echo.
echo ===== CAMBIOS QUE SE REALIZARAN =====
echo.
echo 1. Eliminar carpeta: backend\employees\templates\
echo    (Django templates no se usan, todo es React ahora)
echo.
echo 2. Crear backup en: backend\employees\templates_backup\
echo    (Por si necesitas recuperar algo)
echo.
echo 3. Verificar que views.py no tenga vistas antiguas
echo.
echo ====================================
echo.

REM Crear backup
if exist "backend\employees\templates" (
    echo [1/3] Creando backup de templates...
    if not exist "backend\employees\templates_backup" (
        mkdir "backend\employees\templates_backup"
    )
    xcopy "backend\employees\templates\*" "backend\employees\templates_backup\" /E /I /Y
    echo [OK] Backup creado en templates_backup\
) else (
    echo [INFO] No hay templates que respaldar
)

echo.
echo [2/3] Eliminando carpeta templates...
if exist "backend\employees\templates" (
    rmdir /S /Q "backend\employees\templates"
    echo [OK] Carpeta eliminada
) else (
    echo [INFO] La carpeta ya no existe
)

echo.
echo [3/3] Verificando estructura...
if exist "backend\employees\models.py" (
    echo [OK] models.py existe
) else (
    echo [ERROR] models.py NO existe
)

if exist "backend\employees\api_views.py" (
    echo [OK] api_views.py existe
) else (
    echo [ERROR] api_views.py NO existe
)

if exist "backend\employees\serializers.py" (
    echo [OK] serializers.py existe
) else (
    echo [ERROR] serializers.py NO existe
)

echo.
echo ====================================
echo  LIMPIEZA COMPLETADA
echo ====================================
echo.
echo PROXIMO PASO:
echo 1. Revisar backend\employees\views.py
echo 2. Si tiene vistas que renderizen templates, eliminarlas
echo 3. Ejecutar el servidor para verificar que todo funciona
echo.
echo Comando:
echo   cd backend
echo   python manage.py runserver
echo.
echo Si hay errores, el backup esta en:
echo   backend\employees\templates_backup\
echo.
pause
