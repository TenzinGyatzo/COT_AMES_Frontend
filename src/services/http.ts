/**
 * Servicio HTTP base con Axios
 * Instancia preconfigurada para realizar llamadas al backend
 * Incluye interceptor para agregar token JWT automáticamente
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/auth';

// Crear instancia de Axios con configuración base
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitudes: agrega token JWT si el usuario está autenticado
httpClient.interceptors.request.use(
  (config) => {
    // Leer token del store de auth
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor de respuestas: manejo básico de errores globales
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (no autorizado), limpiar sesión
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }

    return Promise.reject(error);
  },
);

export default httpClient;
