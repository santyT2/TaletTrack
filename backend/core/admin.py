from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Empresa


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
	fieldsets = UserAdmin.fieldsets + (
		("Rol", {"fields": ("role",)}),
	)
	add_fieldsets = UserAdmin.add_fieldsets + (
		(None, {"fields": ("role",)}),
	)
	list_display = ("username", "email", "first_name", "last_name", "role", "is_staff")
	list_filter = ("role", "is_staff", "is_superuser", "is_active")
	search_fields = ("username", "email", "first_name", "last_name")


@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
	list_display = ("nombre_comercial", "ruc_nit", "pais", "estado")
	search_fields = ("nombre_comercial", "ruc_nit")
