import axios from 'axios';

const api = axios.create({
    // API REST base para módulo de empleados
    // Rutas disponibles: /api/employees/api/{empleados|sucursales|cargos|contratos|solicitudes|onboarding}/
    baseURL: 'http://localhost:8000/api/employees/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token de autenticación a cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas (opcional: manejo global de errores)
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default api;
