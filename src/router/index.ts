/**
 * Configuración de Vue Router
 * Define todas las rutas de la aplicación
 */

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../store/auth';

// Importar layouts
import MainLayout from '../layouts/MainLayout.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import ClienteLayout from '../layouts/ClienteLayout.vue';

// Importar vistas principales
import HomeView from '../views/HomeView.vue';
import CotizadorView from '../views/CotizadorView.vue';
import LoginView from '../views/LoginView.vue';
import ClienteLoginView from '../views/ClienteLoginView.vue';
import ClienteRegisterView from '../views/ClienteRegisterView.vue';

// Importar vistas de administración
import AdminDashboardView from '../views/admin/AdminDashboardView.vue';
import AdminCotizacionesView from '../views/admin/AdminCotizacionesView.vue';
import AdminCotizacionDetalleView from '../views/admin/AdminCotizacionDetalleView.vue';
import AdminClientesView from '../views/admin/AdminClientesView.vue';
import AdminClienteDetalleView from '../views/admin/AdminClienteDetalleView.vue';
import AdminOrdenesView from '../views/admin/AdminOrdenesView.vue';
import AdminOrdenDetalleView from '../views/admin/AdminOrdenDetalleView.vue';
import AdminServiciosView from '../views/admin/AdminServiciosView.vue';
import AdminSedesView from '../views/admin/AdminSedesView.vue';
import AdminMetricasView from '../views/admin/AdminMetricasView.vue';

// Importar vistas del portal cliente
import ClienteDashboardView from '../views/cliente/ClienteDashboardView.vue';
import ClienteCotizacionesView from '../views/cliente/ClienteCotizacionesView.vue';
import ClienteCotizacionDetalleView from '../views/cliente/ClienteCotizacionDetalleView.vue';
import ClienteOrdenesView from '../views/cliente/ClienteOrdenesView.vue';
import ClienteOrdenDetalleView from '../views/cliente/ClienteOrdenDetalleView.vue';
import ClientePerfilView from '../views/cliente/ClientePerfilView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
      },
      {
        path: 'admin/login',
        name: 'admin-login',
        component: LoginView,
      },
      {
        path: 'cliente/login',
        name: 'cliente-login',
        component: ClienteLoginView,
      },
      {
        path: 'cliente/register',
        name: 'cliente-register',
        component: ClienteRegisterView,
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, allowedRoles: ['admin'] },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboardView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
      {
        path: 'clientes',
        name: 'admin-clientes',
        component: AdminClientesView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
      {
        path: 'clientes/:id',
        name: 'admin-cliente-detalle',
        component: AdminClienteDetalleView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
      {
        path: 'cotizaciones',
        name: 'admin-cotizaciones',
        component: AdminCotizacionesView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
      {
        path: 'cotizaciones/:id',
        name: 'admin-cotizacion-detalle',
        component: AdminCotizacionDetalleView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
      {
        path: 'ordenes',
        name: 'admin-ordenes',
        component: AdminOrdenesView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
      {
        path: 'ordenes/:id',
        name: 'admin-orden-detalle',
        component: AdminOrdenDetalleView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
      {
        path: 'servicios',
        name: 'admin-servicios',
        component: AdminServiciosView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
      {
        path: 'sedes',
        name: 'admin-sedes',
        component: AdminSedesView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
      {
        path: 'metricas',
        name: 'admin-metricas',
        component: AdminMetricasView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
      },
    ],
  },
  {
    path: '/cliente',
    component: ClienteLayout,
    meta: { requiresAuth: true, allowedRoles: ['cliente'] },
    children: [
      {
        path: '',
        name: 'cliente-dashboard',
        component: ClienteDashboardView,
        meta: { requiresAuth: true, allowedRoles: ['cliente'] },
      },
      {
        path: 'cotizaciones',
        name: 'cliente-cotizaciones',
        component: ClienteCotizacionesView,
        meta: { requiresAuth: true, allowedRoles: ['cliente'] },
      },
      {
        path: 'cotizaciones/nueva',
        name: 'cliente-cotizacion-nueva',
        component: CotizadorView,
        meta: { requiresAuth: true, allowedRoles: ['cliente'] },
      },
      {
        path: 'cotizaciones/:id',
        name: 'cliente-cotizacion-detalle',
        component: ClienteCotizacionDetalleView,
        meta: { requiresAuth: true, allowedRoles: ['cliente'] },
      },
      {
        path: 'ordenes',
        name: 'cliente-ordenes',
        component: ClienteOrdenesView,
        meta: { requiresAuth: true, allowedRoles: ['cliente'] },
      },
      {
        path: 'ordenes/:id',
        name: 'cliente-orden-detalle',
        component: ClienteOrdenDetalleView,
        meta: { requiresAuth: true, allowedRoles: ['cliente'] },
      },
      {
        path: 'perfil',
        name: 'cliente-perfil',
        component: ClientePerfilView,
        meta: { requiresAuth: true, allowedRoles: ['cliente'] },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guards de rutas: protege rutas según roles usando metadatos
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // Determinar si la ruta requiere autenticación y qué roles acepta
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);
  const allowedRoles = new Set<string>();
  to.matched.forEach((record) => {
    const roles = record.meta?.allowedRoles as string[] | undefined;
    roles?.forEach((r) => allowedRoles.add(r));
  });

  // Manejar redirecciones de login cuando ya está autenticado
  if (to.name === 'admin-login' && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      return next('/admin');
    }
    // Cliente autenticado: no tiene sentido ir al login admin
    return next('/');
  }

  if (to.name === 'cliente-login' && authStore.isAuthenticated) {
    if (authStore.isCliente) {
      return next('/cliente');
    }
    // Admin autenticado: no tiene sentido ir al login cliente
    return next('/admin');
  }

  if (to.name === 'cliente-register' && authStore.isAuthenticated) {
    if (authStore.isCliente) {
      return next('/cliente');
    }
    // Admin autenticado: no tiene sentido ir al registro cliente
    return next('/admin');
  }

  // Si no requiere auth, permitir el acceso
  if (!requiresAuth) {
    return next();
  }

  // Si requiere auth y no está autenticado, redirigir al login correcto
  if (!authStore.isAuthenticated) {
    // Si la ruta permite múltiples roles, redirigir por defecto al login de cliente
    if (allowedRoles.has('cliente')) {
      return next({ name: 'cliente-login', query: { redirect: to.fullPath } });
    }
    if (allowedRoles.has('admin')) {
      return next({ name: 'admin-login', query: { redirect: to.fullPath } });
    }
    // Fallback: redirigir al login de cliente por defecto
    return next({ name: 'cliente-login', query: { redirect: to.fullPath } });
  }

  // Si está autenticado pero su rol no está permitido en esa ruta
  const user = authStore.user;
  if (allowedRoles.size > 0) {
    const userRole = user?.tipoUsuario; // 'admin' | 'cliente'

    if (!userRole || !allowedRoles.has(userRole)) {
      // Acceso denegado por rol
      if (authStore.isAdmin) {
        return next('/admin');
      }
      if (authStore.isCliente) {
        return next('/cliente');
      }
      // Fallback genérico
      return next('/');
    }
  }

  // Si pasa todas las validaciones, permitir acceso
  return next();
});

export default router;
