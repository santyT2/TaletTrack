from rest_framework import serializers
from .models import Empresa, Usuario


class EmpresaSerializer(serializers.ModelSerializer):
    """Serializer profesional para el módulo de Empresa."""
    
    logo_url = serializers.ImageField(source='logo', required=False, allow_null=True)
    
    class Meta:
        model = Empresa
        fields = [
            'id',
            'razon_social',
            'nombre_comercial',
            'ruc',
            'direccion_fiscal',
            'telefono_contacto',
            'email_contacto',
            'sitio_web',
            'representante_legal',
            'pais',
            'moneda',
            'logo',
            'logo_url',
            'estado',
            'creada_el',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'creada_el', 'created_at', 'updated_at']
    
    def validate_ruc(self, value):
        """Validación básica de RUC."""
        if value and len(value) < 10:
            raise serializers.ValidationError("El RUC debe tener al menos 10 caracteres.")
        return value


class UsuarioListSerializer(serializers.ModelSerializer):
    """Serializer para listar usuarios con información del empleado."""
    
    empleado_nombre = serializers.SerializerMethodField()
    empleado_id = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'role_display',
            'is_active',
            'must_change_password',
            'date_joined',
            'last_login',
            'empleado_nombre',
            'empleado_id',
        ]
    
    def get_empleado_nombre(self, obj):
        """Obtiene el nombre del empleado vinculado."""
        if hasattr(obj, 'empleado') and obj.empleado:
            return f"{obj.empleado.nombres} {obj.empleado.apellidos}"
        return None
    
    def get_empleado_id(self, obj):
        """Obtiene el ID del empleado vinculado."""
        if hasattr(obj, 'empleado') and obj.empleado:
            return obj.empleado.id
        return None


class UsuarioDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para ver/editar un usuario."""
    
    empleado_nombre = serializers.SerializerMethodField(read_only=True)
    empleado_id = serializers.SerializerMethodField(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'role_display',
            'is_active',
            'must_change_password',
            'date_joined',
            'last_login',
            'empleado_nombre',
            'empleado_id',
        ]
        read_only_fields = ['id', 'username', 'date_joined', 'last_login']
    
    def get_empleado_nombre(self, obj):
        if hasattr(obj, 'empleado') and obj.empleado:
            return f"{obj.empleado.nombres} {obj.empleado.apellidos}"
        return None
    
    def get_empleado_id(self, obj):
        if hasattr(obj, 'empleado') and obj.empleado:
            return obj.empleado.id
        return None


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar roles y estado de usuario."""
    
    class Meta:
        model = Usuario
        fields = ['role', 'is_active']
    
    def validate_role(self, value):
        """Solo SUPERADMIN puede crear otros SUPERADMIN."""
        request = self.context.get('request')
        if value == 'SUPERADMIN' and request and request.user.role != 'SUPERADMIN':
            raise serializers.ValidationError("Solo un SuperAdmin puede asignar el rol de SuperAdmin.")
        return value


class PasswordResetSerializer(serializers.Serializer):
    """Serializer para resetear contraseña de usuario."""
    
    new_password = serializers.CharField(min_length=6, write_only=True)
    
    def validate_new_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("La contraseña debe tener al menos 6 caracteres.")
        return value
