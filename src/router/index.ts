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

// Importar vistas principales
import LoginView from '../views/LoginView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';
import GuestCotizacionDetalleView from '../views/GuestCotizacionDetalleView.vue';

// Importar vistas de administración
import AdminDashboardView from '../views/admin/AdminDashboardView.vue';
import AdminCotizacionesView from '../views/admin/AdminCotizacionesView.vue';
import AdminCotizacionDetalleView from '../views/admin/AdminCotizacionDetalleView.vue';
import AdminCotizadorView from '../views/admin/AdminCotizadorView.vue';
import AdminClientesView from '../views/admin/AdminClientesView.vue';
import AdminClienteDetalleView from '../views/admin/AdminClienteDetalleView.vue';
import AdminServiciosView from '../views/admin/AdminServiciosView.vue';
import AdminMetricasView from '../views/admin/AdminMetricasView.vue';
import AdminUsuariosView from '../views/admin/AdminUsuariosView.vue';
import AdminPlantillasView from '../views/admin/AdminPlantillasView.vue';
import AdminConfiguracionView from '../views/admin/AdminConfiguracionView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: { name: 'admin-login' },
      },
      {
        path: 'admin/login',
        name: 'admin-login',
        component: LoginView,
      },
      {
        path: 'admin/forgot-password',
        name: 'admin-forgot-password',
        component: ForgotPasswordView,
      },
      {
        path: 'admin/reset-password',
        name: 'admin-reset-password',
        component: ResetPasswordView,
      },
      {
        path: 'cotizacion-publica/:token',
        name: 'guest-cotizacion-detalle',
        component: GuestCotizacionDetalleView,
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboardView,
        meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
      },
      {
        path: 'clientes',
        name: 'admin-clientes',
        component: AdminClientesView,
        meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
      },
      {
        path: 'clientes/:id',
        name: 'admin-cliente-detalle',
        component: AdminClienteDetalleView,
        meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
      },
      {
        path: 'cotizaciones',
        name: 'admin-cotizaciones',
        component: AdminCotizacionesView,
        meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
      },
      {
        path: 'cotizaciones/nueva',
        name: 'admin-cotizacion-nueva',
        component: AdminCotizadorView,
        meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
      },
      {
        path: 'cotizaciones/:id',
        name: 'admin-cotizacion-detalle',
        component: AdminCotizacionDetalleView,
        meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
      },
      {
        path: 'servicios',
        name: 'admin-servicios',
        component: AdminServiciosView,
        meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
      },
      {
        path: 'metricas',
        name: 'admin-metricas',
        component: AdminMetricasView,
        meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
      },
      {
        path: 'plantillas',
        name: 'admin-plantillas',
        component: AdminPlantillasView,
        meta: { requiresAuth: true, allowedRoles: ['operativo', 'admin_sistema'] },
      },
      {
        path: 'configuracion',
        name: 'admin-configuracion',
        component: AdminConfiguracionView,
        meta: { requiresAuth: true, allowedRoles: ['admin_sistema'] },
      },
      {
        path: 'usuarios',
        name: 'admin-usuarios',
        component: AdminUsuariosView,
        meta: { requiresAuth: true, allowedRoles: ['admin_sistema'] },
      },
    ],
  },
  // Deep-links heredados MOC → redirigir (Story 1.1)
  { path: '/cliente/:pathMatch(.*)*', redirect: { name: 'admin-login' } },
  { path: '/admin/ordenes/:pathMatch(.*)*', redirect: '/admin/cotizaciones' },
  { path: '/admin/ordenes', redirect: '/admin/cotizaciones' },
  { path: '/admin/sedes/:pathMatch(.*)*', redirect: '/admin' },
  { path: '/admin/sedes', redirect: '/admin' },
  // Emails viejos / path incorrecto → ruta FE real (Story 1.4)
  {
    path: '/reset-password',
    redirect: (to) => ({
      path: '/admin/reset-password',
      query: to.query,
    }),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated && authStore.isAmesUser) {
        return { path: '/admin' };
      }
      return { name: 'admin-login' };
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);
  // Deepest route wins (child overrides parent) — evita unión que debilitaba AC #3
  let allowedRolesList: string[] = [];
  for (const record of to.matched) {
    const roles = record.meta?.allowedRoles as string[] | undefined;
    if (roles?.length) {
      allowedRolesList = roles;
    }
  }
  const allowedRoles = new Set(allowedRolesList);

  if (to.name === 'admin-login' && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      return next('/admin');
    }
    authStore.logout();
    return next();
  }

  if (!requiresAuth) {
    return next();
  }

  if (!authStore.isAuthenticated) {
    return next({ name: 'admin-login', query: { redirect: to.fullPath } });
  }

  const user = authStore.user;
  if (allowedRoles.size > 0) {
    const userRole = user?.rol;

    if (!userRole || !allowedRoles.has(userRole)) {
      // Soft-deny: no tumbar sesión AMES por deep-link a ruta admin-only
      if (authStore.isAmesUser) {
        return next({ name: 'admin-dashboard' });
      }
      authStore.logout();
      return next({ name: 'admin-login', query: { redirect: to.fullPath } });
    }
  }

  return next();
});

export default router;
