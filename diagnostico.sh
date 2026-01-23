#!/bin/bash
# 🔍 Script de Diagnóstico del Frontend

echo "=========================================="
echo "🔍 DIAGNÓSTICO DEL FRONTEND REACT"
echo "=========================================="

cd frontend

echo ""
echo "1️⃣  Verificando Node.js..."
node --version

echo ""
echo "2️⃣  Verificando npm..."
npm --version

echo ""
echo "3️⃣  Verificando dependencias..."
npm list react react-dom react-router-dom tailwindcss 2>&1 | head -20

echo ""
echo "4️⃣  Revisar si hay errores de TypeScript..."
npx tsc --noEmit 2>&1 | head -20

echo ""
echo "5️⃣  Verificar estructura de carpetas..."
echo "✅ src/"
ls -la src/ | head -10
echo ""
echo "✅ src/modules/"
ls -la src/modules/

echo ""
echo "✅ src/modules/hr/"
ls -la src/modules/hr/

echo ""
echo "✅ src/modules/admin/"
ls -la src/modules/admin/

echo ""
echo "=========================================="
echo "Servidor corriendo en: http://localhost:5175"
echo "Abre DevTools (F12) y revisa la consola"
echo "=========================================="
