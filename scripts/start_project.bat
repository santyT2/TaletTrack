@echo off
echo ====================================
echo  INICIANDO PROYECTO HRMS COMPLETO
echo ====================================
echo.

echo Este script iniciara el backend (Django) y el frontend (React + Vite)
echo en terminales separadas.
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

echo.
echo [1/2] Iniciando Backend Django...
start "Backend Django - HRMS" cmd /k "cd backend && python manage.py runserver"

timeout /t 5 /nobreak > nul

echo.
echo [2/2] Iniciando Frontend React...
start "Frontend React - HRMS" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo  PROYECTO INICIADO!
echo ====================================
echo.
echo Backend Django: http://localhost:8000
echo Frontend React: http://localhost:5173
echo.
echo Admin Django: http://localhost:8000/admin
echo API Endpoints: http://localhost:8000/employees/api/
echo.
echo Para detener los servidores, cierra las ventanas de terminal
echo o presiona Ctrl+C en cada una.
echo.
