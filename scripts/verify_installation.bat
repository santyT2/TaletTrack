@echo off
echo ====================================
echo  VERIFICACION DEL SISTEMA HRMS
echo ====================================
echo.

echo [VERIFICANDO BACKEND]
echo.

cd backend

echo Verificando estructura de archivos...
if exist "employees\models.py" (
    echo [OK] employees\models.py
) else (
    echo [ERROR] employees\models.py NO ENCONTRADO
)

if exist "employees\serializers.py" (
    echo [OK] employees\serializers.py
) else (
    echo [ERROR] employees\serializers.py NO ENCONTRADO
)

if exist "employees\api_views.py" (
    echo [OK] employees\api_views.py
) else (
    echo [ERROR] employees\api_views.py NO ENCONTRADO
)

if exist "employees\urls.py" (
    echo [OK] employees\urls.py
) else (
    echo [ERROR] employees\urls.py NO ENCONTRADO
)

if exist "talent_track\settings.py" (
    echo [OK] talent_track\settings.py
) else (
    echo [ERROR] talent_track\settings.py NO ENCONTRADO
)

echo.
echo Verificando instalacion de paquetes...
python -c "import django; print('[OK] Django instalado - Version:', django.get_version())" 2>nul || echo [ERROR] Django NO instalado

python -c "import rest_framework; print('[OK] Django REST Framework instalado')" 2>nul || echo [ERROR] DRF NO instalado

python -c "import corsheaders; print('[OK] django-cors-headers instalado')" 2>nul || echo [ERROR] django-cors-headers NO instalado

echo.
echo [VERIFICANDO FRONTEND]
echo.

cd ..\frontend

if exist "src\modules\hr\pages\DashboardPage.tsx" (
    echo [OK] DashboardPage.tsx
) else (
    echo [ERROR] DashboardPage.tsx NO ENCONTRADO
)

if exist "src\modules\hr\pages\OrganigramPage.tsx" (
    echo [OK] OrganigramPage.tsx
) else (
    echo [ERROR] OrganigramPage.tsx NO ENCONTRADO
)

if exist "src\modules\hr\pages\LeavesPage.tsx" (
    echo [OK] LeavesPage.tsx
) else (
    echo [ERROR] LeavesPage.tsx NO ENCONTRADO
)

if exist "src\modules\hr\pages\ContractsPage.tsx" (
    echo [OK] ContractsPage.tsx
) else (
    echo [ERROR] ContractsPage.tsx NO ENCONTRADO
)

if exist "src\modules\hr\pages\OnboardingPage.tsx" (
    echo [OK] OnboardingPage.tsx
) else (
    echo [ERROR] OnboardingPage.tsx NO ENCONTRADO
)

if exist "src\modules\hr\HRRoutes.tsx" (
    echo [OK] HRRoutes.tsx
) else (
    echo [ERROR] HRRoutes.tsx NO ENCONTRADO
)

if exist "src\modules\hr\HRLayout.tsx" (
    echo [OK] HRLayout.tsx
) else (
    echo [ERROR] HRLayout.tsx NO ENCONTRADO
)

if exist "src\services\hrService.ts" (
    echo [OK] hrService.ts
) else (
    echo [ERROR] hrService.ts NO ENCONTRADO
)

echo.
echo Verificando node_modules...
if exist "node_modules" (
    echo [OK] node_modules existe
    if exist "node_modules\recharts" (
        echo [OK] recharts instalado
    ) else (
        echo [ADVERTENCIA] recharts NO instalado - Ejecuta: npm install recharts
    )
    if exist "node_modules\lucide-react" (
        echo [OK] lucide-react instalado
    ) else (
        echo [ADVERTENCIA] lucide-react NO instalado - Ejecuta: npm install lucide-react
    )
) else (
    echo [ERROR] node_modules NO existe - Ejecuta: npm install
)

cd ..

echo.
echo ====================================
echo  VERIFICACION COMPLETADA
echo ====================================
echo.
echo Si todos los archivos estan marcados como [OK],
echo el sistema esta listo para ejecutarse.
echo.
echo Para iniciar el proyecto, ejecuta:
echo   .\start_project.bat
echo.
pause
