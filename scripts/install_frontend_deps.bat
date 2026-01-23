@echo off
echo ====================================
echo  INSTALACION DE DEPENDENCIAS FRONTEND
echo ====================================
echo.

cd frontend

echo [1/3] Instalando dependencias principales...
call npm install

echo.
echo [2/3] Instalando librerias de graficos y visualizacion...
call npm install recharts react-organizational-chart

echo.
echo [3/3] Instalando utilidades...
call npm install lucide-react date-fns

echo.
echo ====================================
echo  INSTALACION COMPLETADA!
echo ====================================
echo.
echo Las siguientes dependencias fueron instaladas:
echo - recharts (graficos)
echo - react-organizational-chart (organigrama)
echo - lucide-react (iconos)
echo - date-fns (manejo de fechas)
echo.
echo Para iniciar el servidor de desarrollo:
echo   cd frontend
echo   npm run dev
echo.
pause
