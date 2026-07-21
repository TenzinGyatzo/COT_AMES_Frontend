/**
 * Servicio HTTP base con Axios
 * Instancia preconfigurada para realizar llamadas al backend
 * Incluye interceptor para agregar token JWT automáticamente
 * y X-Tenant-Id para admin_sistema (AD-2 / Story 1.5)
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/auth';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** True solo para el catálogo GET /tenants (con o sin slash/query). */
function isTenantsCatalogUrl(url?: string): boolean {
  if (!url) return false;
  let path = url;
  try {
    // Axios a veces pasa path relativo; otras, URL absoluta.
    if (/^https?:\/\//i.test(url)) {
      path = new URL(url).pathname;
    }
  } catch {
    /* keep path */
  }
  path = (path.split('?')[0] ?? path).replace(/\/+$/, '') || '/';
  return path === '/tenants' || path.endsWith('/tenants');
}

httpClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData: no forzar application/json ni multipart sin boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Content-Type', false);
      } else {
        delete (config.headers as Record<string, unknown>)['Content-Type'];
      }
    }

    // Solo admin_sistema envía X-Tenant-Id; operativo nunca (AD-2).
    // GET /tenants no necesita header (chicken-egg).
    if (
      authStore.user?.rol === 'admin_sistema' &&
      authStore.activeTenantId &&
      !isTenantsCatalogUrl(config.url)
    ) {
      config.headers['X-Tenant-Id'] = authStore.activeTenantId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

function isAuthCredentialRequest(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/password-reset')
  );
}

/** Story 6.9 — 401 de magic link no es sesión AMES vencida. */
function isPublicCotizacionUrl(url?: string): boolean {
  if (!url) return false;
  let path = url;
  try {
    if (/^https?:\/\//i.test(url)) {
      path = new URL(url).pathname;
    }
  } catch {
    /* keep path */
  }
  path = path.split('?')[0] ?? path;
  return path.includes('/cotizaciones/public/');
}

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 en login/register/público no es "sesión vencida": no limpiar store
    if (
      error.response?.status === 401 &&
      !isAuthCredentialRequest(error.config?.url) &&
      !isPublicCotizacionUrl(error.config?.url)
    ) {
      const authStore = useAuthStore();
      authStore.logout();
    }

    return Promise.reject(error);
  },
);

export default httpClient;
