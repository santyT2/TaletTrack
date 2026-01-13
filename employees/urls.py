from django.urls import path
from .views import EmpleadoListView, EmpleadoCreateView, EmpleadoUpdateView, EmpleadoDeleteView, EmpleadoDetailView, SucursalListView, CargoListView

app_name = 'employees'

urlpatterns = [
	path('', EmpleadoListView.as_view(), name='empleado-list'),
	path('nuevo/', EmpleadoCreateView.as_view(), name='empleado-create'),
	path('<int:pk>/', EmpleadoDetailView.as_view(), name='empleado-detail'),
	path('<int:pk>/editar/', EmpleadoUpdateView.as_view(), name='empleado-update'),
	path('<int:pk>/eliminar/', EmpleadoDeleteView.as_view(), name='empleado-delete'),
	path('sucursales/', SucursalListView.as_view(), name='sucursal-list'),
	path('cargos/', CargoListView.as_view(), name='cargo-list'),
]
