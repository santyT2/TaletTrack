from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class LoginWithProfileSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Embed role if needed for refresh usage
        if hasattr(user, "role"):
            token["role"] = user.role
        if hasattr(user, "must_change_password"):
            token["must_change_password"] = user.must_change_password
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}".strip() or user.username,
            "role": getattr(user, "role", "EMPLOYEE"),
            "must_change_password": getattr(user, "must_change_password", False),
            "username": user.username,
        }
        return data


class LoginWithProfileView(TokenObtainPairView):
    serializer_class = LoginWithProfileSerializer


class ChangePasswordInitialView(APIView):
    """Cambia la contraseña inicial y desactiva must_change_password."""

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_password = request.data.get("new_password", "")
        if not new_password or len(new_password) < 6:
            return Response({"detail": "La nueva contraseña debe tener al menos 6 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if user.is_anonymous:
            return Response({"detail": "Autenticación requerida."}, status=status.HTTP_401_UNAUTHORIZED)
        if hasattr(user, "must_change_password") and not user.must_change_password:
            return Response({"detail": "La contraseña ya fue actualizada."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        if hasattr(user, "must_change_password"):
            user.must_change_password = False
        user.save(update_fields=["password", *( ["must_change_password"] if hasattr(user, "must_change_password") else [] )])

        return Response({"detail": "Contraseña actualizada."}, status=status.HTTP_200_OK)
