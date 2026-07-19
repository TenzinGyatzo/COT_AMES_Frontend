<template>
  <!-- Pestaña hamburguesa para móviles -->
  <button
    @click="toggleSidebar"
    class="fixed top-1/2 -translate-y-1/2 -left-8 md:hidden bg-gray-800 text-white hover:bg-gray-700 hover:translate-x-6 transition-all duration-300 shadow-lg rounded-r-lg px-3 py-4 border-r border-t border-b border-gray-700 group cursor-pointer z-50 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
    aria-label="Abrir o cerrar menú lateral"
    aria-controls="admin-sidebar"
    :aria-expanded="isSidebarOpen"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        v-if="!isSidebarOpen"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
      <path
        v-else
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>

  <!-- Overlay para móviles -->
  <div
    v-if="isSidebarOpen"
    @click="closeSidebar"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
  ></div>

  <!-- Sidebar -->
  <aside
    id="admin-sidebar"
    :class="[
      'fixed md:static inset-y-0 left-0 z-40 w-64 md:w-40 lg:w-48 xl:w-56 2xl:w-64 bg-gray-800 min-h-screen transform transition-all duration-300 ease-in-out',
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]"
  >
    <div class="flex flex-col h-full">
      <!-- Logo -->
      <div
        class="p-6 border-b border-gray-700 flex items-center justify-between"
      >
        <span class="text-2xl font-bold text-white tracking-tight">AMES</span>
        <button
          @click="closeSidebar"
          class="md:hidden text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-medical-blue-500 rounded"
          aria-label="Cerrar sidebar"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Navegación -->
      <nav class="flex-1 p-4 space-y-2" aria-label="Navegación principal">
        <router-link
          to="/admin"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-dashboard'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Dashboard
        </router-link>
        <router-link
          to="/admin/clientes"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-clientes' ||
            $route.name === 'admin-cliente-detalle'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Clientes
        </router-link>
        <router-link
          to="/admin/cotizaciones"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-cotizaciones' ||
            $route.name === 'admin-cotizacion-detalle'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Cotizaciones
        </router-link>
        <router-link
          to="/admin/cotizaciones/nueva"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-cotizacion-nueva'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Crear Cotización
        </router-link>
        <router-link
          to="/admin/servicios"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-servicios'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Servicios
        </router-link>
        <router-link
          to="/admin/metricas"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-metricas'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Métricas
        </router-link>
        <router-link
          to="/admin/plantillas"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-plantillas'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Plantillas
        </router-link>
        <router-link
          v-if="authStore.isAdminSistema"
          to="/admin/configuracion"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-configuracion'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Configuración
        </router-link>
        <router-link
          v-if="authStore.isAdminSistema"
          to="/admin/usuarios"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-usuarios'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Usuarios
        </router-link>
      </nav>

      <!-- Pie: contexto tenant + logout -->
      <div class="p-4 border-t border-gray-700 space-y-3">
        <div v-if="authStore.isAdminSistema">
          <label
            for="sidebar-tenant-select"
            class="block text-xs font-medium text-gray-400 mb-1"
          >
            Administración
          </label>
          <select
            id="sidebar-tenant-select"
            class="w-full px-2 py-2 text-sm rounded-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 disabled:opacity-60"
            :value="authStore.activeTenantId || ''"
            :disabled="tenantsLoading || tenantOptions.length === 0"
            @change="onTenantChange"
          >
            <option v-if="tenantsLoading" value="" disabled>
              Cargando…
            </option>
            <option v-else-if="tenantsError" value="" disabled>
              Error al cargar tenants
            </option>
            <option v-else-if="tenantOptions.length === 0" value="" disabled>
              Sin tenants activos
            </option>
            <option
              v-for="t in tenantOptions"
              :key="t._id"
              :value="t._id"
            >
              {{ t.nombre }}
            </option>
          </select>
          <button
            v-if="tenantsError"
            type="button"
            class="mt-1 text-xs text-red-300 underline hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
            @click="loadTenants"
          >
            Reintentar
          </button>
        </div>
        <div
          v-else-if="authStore.isAmesUser"
          role="group"
          aria-labelledby="sidebar-tenant-label"
        >
          <p
            id="sidebar-tenant-label"
            class="text-xs font-medium text-gray-400 mb-1"
          >
            Administración
          </p>
          <p
            class="text-sm text-white truncate"
            :title="operativoTenantLabel"
          >
            {{ operativoTenantLabel }}
          </p>
        </div>

        <button
          type="button"
          class="w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded-md"
          @click="handleLogout"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { getTenants } from '../../services/admin-api.service';
import type { Tenant } from '../../types/backend';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);
const tenants = ref<Tenant[]>([]);
const tenantsLoading = ref(false);
const tenantsError = ref(false);

const tenantOptions = computed(() =>
  tenants.value.filter((t) => t.activo !== false && t._id),
);

const operativoTenantLabel = computed(() => {
  const tid = authStore.user?.tenantId;
  if (!tid) return 'Sin administración asignada';
  const match = tenants.value.find((t) => t._id === tid);
  if (match?.nombre) return match.nombre;
  if (tenantsLoading.value) return 'Cargando…';
  if (tenantsError.value) return 'Administración (no disponible)';
  return tid.slice(-6);
});

function syncActiveTenantWithOptions() {
  if (!authStore.isAdminSistema) return;
  const options = tenantOptions.value;
  if (!options.length) return;
  const active = authStore.activeTenantId;
  if (!active || !options.some((t) => t._id === active)) {
    authStore.setActiveTenantId(options[0]._id!);
  }
}

async function loadTenants() {
  tenantsLoading.value = true;
  tenantsError.value = false;
  try {
    tenants.value = await getTenants();
    syncActiveTenantWithOptions();
  } catch {
    tenants.value = [];
    tenantsError.value = true;
  } finally {
    tenantsLoading.value = false;
  }
}

/** Si estamos en detalle con :id, volver al listado al cambiar tenant. */
function listPathForDetailRoute(): string | null {
  const name = route.name;
  if (name === 'admin-cliente-detalle') return '/admin/clientes';
  if (name === 'admin-cotizacion-detalle') return '/admin/cotizaciones';
  return null;
}

function onTenantChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (!value || value === authStore.activeTenantId) return;
  authStore.setActiveTenantId(value);
  closeSidebar();
  const listPath = listPathForDetailRoute();
  if (listPath) {
    void router.replace(listPath);
  }
}

watch(
  () => route.path,
  () => {
    if (window.innerWidth < 768) {
      isSidebarOpen.value = false;
    }
  },
);

const handleResize = () => {
  if (window.innerWidth >= 768) {
    isSidebarOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  void loadTenants();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

function handleLogout() {
  authStore.logout();
  router.push('/admin/login');
}
</script>
