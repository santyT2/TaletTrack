from django import forms
from .models import Empleado, Sucursal, Cargo


class EmpleadoForm(forms.ModelForm):
    class Meta:
        model = Empleado
        exclude = ['created_at', 'updated_at']
        widgets = {
            'cedula': forms.TextInput(attrs={'class': 'form-control'}),
            'nombres': forms.TextInput(attrs={'class': 'form-control'}),
            'apellidos': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control'}),
            'cargo': forms.Select(attrs={'class': 'form-control'}),
            'sucursal': forms.Select(attrs={'class': 'form-control'}),
            'fecha_ingreso': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'fecha_nacimiento': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'foto': forms.FileInput(attrs={'class': 'form-control'}),
            'estado': forms.Select(attrs={'class': 'form-control'}),
        }


class SucursalForm(forms.ModelForm):
    class Meta:
        model = Sucursal
        exclude = ['created_at', 'updated_at']
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'direccion': forms.TextInput(attrs={'class': 'form-control'}),
            'ciudad': forms.TextInput(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control'}),
        }


class CargoForm(forms.ModelForm):
    class Meta:
        model = Cargo
        exclude = ['created_at', 'updated_at']
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'descripcion': forms.Textarea(attrs={'class': 'form-control'}),
            'salario_base': forms.NumberInput(attrs={'class': 'form-control'}),
            'nivel_requerido': forms.Select(attrs={'class': 'form-control'}),
        }