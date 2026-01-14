from django.urls import path
from .views import (
    EmpleadoListView, EmpleadoCreateView, EmpleadoUpdateView, EmpleadoDeleteView, EmpleadoDetailView,
    SucursalListView, SucursalCreateView, SucursalUpdateView, SucursalDeleteView,
    CargoListView, CargoCreateView, CargoUpdateView, CargoDeleteView
)

app_name = 'employees'

urlpatterns = [
	path('', EmpleadoListView.as_view(), name='empleado-list'),
	path('nuevo/', EmpleadoCreateView.as_view(), name='empleado-create'),
	path('<int:pk>/', EmpleadoDetailView.as_view(), name='empleado-detail'),
	path('<int:pk>/editar/', EmpleadoUpdateView.as_view(), name='empleado-update'),
	path('<int:pk>/eliminar/', EmpleadoDeleteView.as_view(), name='empleado-delete'),
	path('sucursales/', SucursalListView.as_view(), name='sucursal-list'),
	path('cargos/', CargoListView.as_view(), name='cargo-list'),
    path('sucursales/nuevo/', SucursalCreateView.as_view(), name='sucursal-create'),
    path('sucursales/<int:pk>/editar/', SucursalUpdateView.as_view(), name='sucursal-update'),
    path('sucursales/<int:pk>/eliminar/', SucursalDeleteView.as_view(), name='sucursal-delete'),
    path('cargos/nuevo/', CargoCreateView.as_view(), name='cargo-create'),
    path('cargos/<int:pk>/editar/', CargoUpdateView.as_view(), name='cargo-update'),
	path('cargos/<int:pk>/eliminar/', CargoDeleteView.as_view(), name='cargo-delete'),
]
