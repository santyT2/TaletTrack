from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib import messages
from django.shortcuts import redirect
from .models import Empleado, Sucursal, Cargo
from .forms import EmpleadoForm


class StaffRequiredMixin(UserPassesTestMixin):
    """Mixin to require staff or manager role"""
    def test_func(self):
        return self.request.user.is_staff or self.request.user.groups.filter(name='Gerente').exists()


class EmpleadoListView(LoginRequiredMixin, ListView):
    model = Empleado
    template_name = 'employees/lista.html'
    context_object_name = 'empleados'
    paginate_by = 10


class EmpleadoDetailView(LoginRequiredMixin, DetailView):
    model = Empleado
    template_name = 'employees/detalle.html'
    context_object_name = 'empleado'


class EmpleadoCreateView(LoginRequiredMixin, StaffRequiredMixin, SuccessMessageMixin, CreateView):
    model = Empleado
    form_class = EmpleadoForm
    template_name = 'employees/formulario.html'
    success_url = reverse_lazy('employees:empleado-list')
    success_message = 'Empleado "%(nombres)s %(apellidos)s" creado exitosamente.'

    def form_invalid(self, form):
        # Debug: print form errors
        print("Form errors:", form.errors)
        # Add a message to show errors
        from django.contrib import messages
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(self.request, f"{field}: {error}")
        return super().form_invalid(form)


class EmpleadoUpdateView(LoginRequiredMixin, StaffRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Empleado
    form_class = EmpleadoForm
    template_name = 'employees/formulario.html'
    success_url = reverse_lazy('employees:empleado-list')
    success_message = 'Empleado "%(nombres)s %(apellidos)s" actualizado exitosamente.'


class EmpleadoDeleteView(LoginRequiredMixin, StaffRequiredMixin, DeleteView):
    model = Empleado
    success_url = reverse_lazy('employees:empleado-list')

    def delete(self, request, *args, **kwargs):
        messages.success(request, f'Empleado "{self.get_object().nombres} {self.get_object().apellidos}" eliminado exitosamente.')
        return super().delete(request, *args, **kwargs)


class SucursalListView(LoginRequiredMixin, StaffRequiredMixin, ListView):
    model = Sucursal
    template_name = 'employees/sucursal_list.html'
    context_object_name = 'sucursales'
    paginate_by = 10


class CargoListView(LoginRequiredMixin, StaffRequiredMixin, ListView):
    model = Cargo
    template_name = 'employees/cargo_list.html'
    context_object_name = 'cargos'
    paginate_by = 10

