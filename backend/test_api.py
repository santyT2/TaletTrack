import requests
import json

API_BASE = "http://127.0.0.1:8000/api"

print("=" * 60)
print("🧪 PROBANDO ENDPOINTS DE LA API")
print("=" * 60)

def test_endpoint(name, url, method="GET"):
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        else:
            response = requests.post(url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            count = len(data) if isinstance(data, list) else 1
            print(f"✅ {name}: {count} resultados (Status {response.status_code})")
            return True
        else:
            print(f"⚠️  {name}: Status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ {name}: No se puede conectar al servidor")
        return False
    except Exception as e:
        print(f"❌ {name}: Error - {str(e)}")
        return False

# Probar endpoints de Employees
print("\n📊 ENDPOINTS DE EMPLOYEES")
print("-" * 60)
test_endpoint("Listar Empleados", f"{API_BASE}/employees/api/empleados/")
test_endpoint("Listar Sucursales", f"{API_BASE}/employees/api/sucursales/")
test_endpoint("Listar Cargos", f"{API_BASE}/employees/api/cargos/")
test_endpoint("KPI Dashboard", f"{API_BASE}/employees/api/dashboard/kpi/")
test_endpoint("Organigrama", f"{API_BASE}/employees/api/organigram/")

# Probar endpoints de Attendance
print("\n⏰ ENDPOINTS DE ATTENDANCE")
print("-" * 60)
test_endpoint("Asistencia Hoy", f"{API_BASE}/attendance/today/")

print("\n" + "=" * 60)
print("✅ Pruebas Completadas")
print("=" * 60)
