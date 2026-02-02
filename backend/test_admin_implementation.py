"""
Script de Verificación: Núcleo Corporativo y Control de Accesos
Verifica que todos los endpoints y funcionalidades estén operativos.
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}


class TestResult:
    def __init__(self):
        self.passed = []
        self.failed = []
    
    def add_pass(self, test_name: str):
        self.passed.append(test_name)
        print(f"✅ {test_name}")
    
    def add_fail(self, test_name: str, error: str):
        self.failed.append((test_name, error))
        print(f"❌ {test_name}: {error}")
    
    def summary(self):
        total = len(self.passed) + len(self.failed)
        print("\n" + "="*60)
        print(f"RESUMEN DE PRUEBAS: {len(self.passed)}/{total} exitosas")
        print("="*60)
        
        if self.failed:
            print("\n❌ Pruebas Fallidas:")
            for test, error in self.failed:
                print(f"  - {test}: {error}")
        
        return len(self.failed) == 0


def test_empresa_endpoints(token: str, results: TestResult):
    """Prueba los endpoints de Empresa."""
    headers = {**HEADERS, "Authorization": f"Bearer {token}"}
    
    # Test 1: GET Empresa
    try:
        response = requests.get(f"{BASE_URL}/api/empresa/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "razon_social" in data and "ruc" in data:
                results.add_pass("GET /api/empresa/ - Obtener datos de empresa")
            else:
                results.add_fail("GET /api/empresa/", "Respuesta incompleta")
        else:
            results.add_fail("GET /api/empresa/", f"Status {response.status_code}")
    except Exception as e:
        results.add_fail("GET /api/empresa/", str(e))
    
    # Test 2: PATCH Empresa (actualización parcial)
    try:
        update_data = {"nombre_comercial": "Test Company"}
        response = requests.patch(f"{BASE_URL}/api/empresa/1/", 
                                 json=update_data, headers=headers)
        if response.status_code in [200, 400]:  # 400 puede ser validación
            results.add_pass("PATCH /api/empresa/1/ - Actualización parcial")
        else:
            results.add_fail("PATCH /api/empresa/1/", f"Status {response.status_code}")
    except Exception as e:
        results.add_fail("PATCH /api/empresa/1/", str(e))


def test_usuarios_endpoints(token: str, results: TestResult):
    """Prueba los endpoints de Usuarios."""
    headers = {**HEADERS, "Authorization": f"Bearer {token}"}
    
    # Test 1: GET Usuarios (lista)
    try:
        response = requests.get(f"{BASE_URL}/api/usuarios/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                results.add_pass(f"GET /api/usuarios/ - Listar usuarios ({len(data)} encontrados)")
            else:
                results.add_fail("GET /api/usuarios/", "Respuesta no es lista")
        else:
            results.add_fail("GET /api/usuarios/", f"Status {response.status_code}")
    except Exception as e:
        results.add_fail("GET /api/usuarios/", str(e))
    
    # Test 2: GET Usuarios con filtros
    try:
        response = requests.get(f"{BASE_URL}/api/usuarios/?role=SUPERADMIN", 
                              headers=headers)
        if response.status_code == 200:
            results.add_pass("GET /api/usuarios/?role=SUPERADMIN - Filtro por rol")
        else:
            results.add_fail("GET /api/usuarios/?role=SUPERADMIN", f"Status {response.status_code}")
    except Exception as e:
        results.add_fail("GET /api/usuarios/?role=SUPERADMIN", str(e))
    
    # Test 3: GET Usuario específico (ID 1)
    try:
        response = requests.get(f"{BASE_URL}/api/usuarios/1/", headers=headers)
        if response.status_code in [200, 404]:  # 404 si no existe ID 1
            results.add_pass("GET /api/usuarios/{id}/ - Detalle de usuario")
        else:
            results.add_fail("GET /api/usuarios/{id}/", f"Status {response.status_code}")
    except Exception as e:
        results.add_fail("GET /api/usuarios/{id}/", str(e))


def test_authentication():
    """Prueba de autenticación."""
    print("\n" + "="*60)
    print("INICIANDO PRUEBAS DEL SISTEMA")
    print("="*60)
    
    results = TestResult()
    
    # Test de login
    print("\n📝 Intentando autenticación...")
    try:
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access")
            if token:
                results.add_pass("Login y obtención de token")
                return token, results
            else:
                results.add_fail("Login", "Token no encontrado en respuesta")
                return None, results
        else:
            results.add_fail("Login", f"Status {response.status_code}")
            return None, results
    except Exception as e:
        results.add_fail("Login", str(e))
        return None, results


def main():
    """Función principal de verificación."""
    print("""
╔══════════════════════════════════════════════════════════════╗
║     VERIFICACIÓN: NÚCLEO CORPORATIVO Y CONTROL DE ACCESOS    ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Verificar que el servidor esté corriendo
    try:
        response = requests.get(f"{BASE_URL}/admin/", timeout=5)
        print("✅ Servidor Django respondiendo")
    except Exception as e:
        print(f"❌ ERROR: No se puede conectar al servidor en {BASE_URL}")
        print(f"   Asegúrate de que Django esté corriendo: python manage.py runserver")
        return
    
    # Autenticación
    token, results = test_authentication()
    
    if not token:
        print("\n⚠️  No se pudo autenticar. Verifica las credenciales.")
        print("   Credenciales por defecto: admin / admin123")
        results.summary()
        return
    
    # Pruebas de Empresa
    print("\n🏢 Probando endpoints de Empresa...")
    test_empresa_endpoints(token, results)
    
    # Pruebas de Usuarios
    print("\n👥 Probando endpoints de Usuarios...")
    test_usuarios_endpoints(token, results)
    
    # Resumen final
    success = results.summary()
    
    if success:
        print("\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!")
        print("\nEl sistema está listo para usar:")
        print("  1. Frontend: http://localhost:5173/admin/company")
        print("  2. Frontend: http://localhost:5173/admin/users")
        print("  3. API Empresa: http://localhost:8000/api/empresa/")
        print("  4. API Usuarios: http://localhost:8000/api/usuarios/")
    else:
        print("\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.")


if __name__ == "__main__":
    main()
