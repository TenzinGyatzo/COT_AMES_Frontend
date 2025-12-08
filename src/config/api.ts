/**
 * Configuración de la API
 * Define la URL base para las llamadas al backend
 */

// URL base de la API, se obtiene de las variables de entorno o usa un valor por defecto
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
