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
        <span class="text-2xl font-bold text-white tracking-tight">Aestimare</span>
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
          title="Productos y servicios"
          class="block px-4 py-2 rounded-md text-sm font-medium leading-snug transition-colors"
          :class="
            $route.name === 'admin-servicios'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Productos y servicios
        </router-link>
        <router-link
          to="/admin/categorias"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-categorias'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Categorías
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
          v-if="authStore.isAdminSistema || authStore.isAdminTenant"
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
          v-if="authStore.isAdminSistema || authStore.isAdminTenant"
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
        <router-link
          v-if="authStore.isAdminSistema"
          to="/admin/tenants"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-tenants'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Tenants
        </router-link>
        <router-link
          v-if="authStore.isAdminSistema"
          to="/admin/onboard"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-onboard-tenant'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Onboard tenant
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
            class="w-full max-w-full px-2 py-2 text-sm rounded-md bg-gray-900 text-white border border-gray-600 truncate focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 disabled:opacity-60"
            :value="authStore.activeTenantId || ''"
            :title="selectedTenantOptionTitle"
            :disabled="
              tenantsLoading ||
              (tenantOptions.length === 0 && !inactiveContextTenant)
            "
            @change="onTenantChange"
          >
            <option v-if="tenantsLoading" value="" disabled>
              Cargando…
            </option>
            <option v-else-if="tenantsError" value="" disabled>
              Error al cargar tenants
            </option>
            <option
              v-else-if="tenantOptions.length === 0 && !inactiveContextTenant"
              value=""
              disabled
            >
              Sin tenants activos
            </option>
            <option
              v-else-if="!authStore.activeTenantId"
              value=""
              disabled
            >
              Seleccione…
            </option>
            <option
              v-if="inactiveContextTenant"
              :value="inactiveContextTenant._id"
              :title="formatTenantOptionLabel(inactiveContextTenant, true)"
            >
              {{ formatTenantOptionLabel(inactiveContextTenant, true) }}
            </option>
            <option
              v-for="t in tenantOptions"
              :key="t._id"
              :value="t._id"
              :title="formatTenantOptionLabel(t)"
            >
              {{ formatTenantOptionLabel(t) }}
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
            class="text-xs font-medium text-gray-400 mb-1 truncate"
            :title="fixedTenantNombreLabel"
          >
            {{ fixedTenantNombreLabel }}
          </p>
          <p
            class="text-sm text-white truncate"
            :title="fixedTenantClaveLabel"
          >
            {{ fixedTenantClaveLabel }}
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
import { getTenants, getTenantConfig } from '../../services/admin-api.service';
import type { Tenant } from '../../types/backend';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);
const tenants = ref<Tenant[]>([]);
const tenantsLoading = ref(false);
const tenantsError = ref(false);

/** Identidad del tenant fijo (admin_tenant / operativo) vía GET /tenant-config — AD-16. */
const isFixedTenantUser = () =>
  authStore.isAmesUser && !authStore.isAdminSistema;
const fixedTenantNombre = ref<string | null>(null);
const fixedTenantClave = ref<string | null>(null);
const fixedTenantLoading = ref(isFixedTenantUser());
const fixedTenantError = ref(false);
const fixedTenantIdentityLoaded = ref(false);
let fixedTenantLoadGeneration = 0;

const tenantOptions = computed(() =>
  tenants.value.filter((t) => t.activo !== false && t._id),
);

/** Story 4.3: contexto de soporte sobre tenant inactivo (fuera de opciones activas). */
const inactiveContextTenant = computed(() => {
  const id = authStore.activeTenantId;
  if (!id) return null;
  const match = tenants.value.find((t) => t._id === id);
  if (!match || match.activo !== false) return null;
  return match;
});

/** Etiqueta del selector: nombre + clave (truncate nativo del <select>). */
function formatTenantOptionLabel(
  t: Pick<Tenant, 'nombre' | 'clave'>,
  inactive = false,
): string {
  const nombre = t.nombre?.trim() || 'Sin nombre';
  const clave = t.clave?.trim();
  const base = clave ? `${nombre} (${clave})` : nombre;
  return inactive ? `${base} (inactivo)` : base;
}

const selectedTenantOptionTitle = computed(() => {
  const id = authStore.activeTenantId;
  if (!id) return '';
  if (inactiveContextTenant.value?._id === id) {
    return formatTenantOptionLabel(inactiveContextTenant.value, true);
  }
  const match = tenantOptions.value.find((t) => t._id === id);
  return match ? formatTenantOptionLabel(match) : '';
});

const fixedTenantNombreLabel = computed(() => {
  if (fixedTenantNombre.value) return fixedTenantNombre.value;
  if (fixedTenantLoading.value) return 'Cargando…';
  if (fixedTenantError.value) return 'Administración (no disponible)';
  return 'Administración';
});

const fixedTenantClaveLabel = computed(() => {
  if (fixedTenantClave.value) return fixedTenantClave.value;
  if (fixedTenantLoading.value) return '…';
  // No presentar ObjectId como si fuera clave cuando ya hay nombre.
  if (fixedTenantNombre.value) return '—';
  if (fixedTenantError.value) return 'no disponible';
  const tid = authStore.user?.tenantId;
  if (tid) return tid.length > 6 ? `…${tid.slice(-6)}` : tid;
  return 'Sin administración asignada';
});

function syncActiveTenantWithOptions() {
  if (!authStore.isAdminSistema) return;
  const active = authStore.activeTenantId;
  // AD-14 / 4.3: no expulsar contexto inactivo intencional.
  if (
    active &&
    tenants.value.some((t) => t._id === active && t.activo === false)
  ) {
    return;
  }
  const options = tenantOptions.value;
  if (!options.length) return;
  if (!active || !options.some((t) => t._id === active)) {
    const first = options[0];
    if (first?._id) authStore.setActiveTenantId(first._id);
  }
}

async function loadTenants() {
  // GET /tenants = solo admin_sistema (AD-16 / Story 2.1).
  // Operativo y admin_tenant: identidad vía getTenantConfig (sin catálogo).
  if (!authStore.isAdminSistema) {
    tenants.value = [];
    tenantsLoading.value = false;
    tenantsError.value = false;
    return;
  }
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

/** Carga nombre/clave del tenant fijo. Cache local del componente (Ask First: no composable). */
async function loadFixedTenantIdentity(force = false) {
  if (!isFixedTenantUser()) {
    fixedTenantNombre.value = null;
    fixedTenantClave.value = null;
    fixedTenantLoading.value = false;
    fixedTenantError.value = false;
    fixedTenantIdentityLoaded.value = false;
    return;
  }
  if (fixedTenantIdentityLoaded.value && !force) return;
  const generation = ++fixedTenantLoadGeneration;
  fixedTenantLoading.value = true;
  fixedTenantError.value = false;
  try {
    const cfg = await getTenantConfig();
    if (generation !== fixedTenantLoadGeneration) return;
    fixedTenantNombre.value = cfg.tenantNombre?.trim() || null;
    fixedTenantClave.value = cfg.tenantClave?.trim() || null;
    fixedTenantIdentityLoaded.value = true;
  } catch {
    if (generation !== fixedTenantLoadGeneration) return;
    fixedTenantNombre.value = null;
    fixedTenantClave.value = null;
    fixedTenantError.value = true;
    fixedTenantIdentityLoaded.value = false;
  } finally {
    if (generation === fixedTenantLoadGeneration) {
      fixedTenantLoading.value = false;
    }
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
  // Limpiar query de filtros del tenant anterior (listados persisten en route.query).
  const listPath = listPathForDetailRoute();
  if (listPath) {
    void router.replace({ path: listPath, query: {} });
  } else {
    void router.replace({ path: route.path, query: {} });
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

/** Tras onboard (4.1): activeTenantId nuevo aún no está en el catálogo local → recargar. */
watch(
  () => authStore.activeTenantId,
  (id) => {
    if (
      authStore.isAdminSistema &&
      id &&
      !tenants.value.some((t) => t._id === id)
    ) {
      void loadTenants();
    }
  },
);

watch(
  () => authStore.user?.tenantId,
  () => {
    if (!isFixedTenantUser()) return;
    fixedTenantIdentityLoaded.value = false;
    void loadFixedTenantIdentity(true);
  },
);

const handleResize = () => {
  if (window.innerWidth >= 768) {
    isSidebarOpen.value = false;
  }
};

const onTenantsCatalogChanged = () => {
  void loadTenants();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('ames:tenants-catalog-changed', onTenantsCatalogChanged);
  void loadTenants();
  void loadFixedTenantIdentity();
});

onUnmounted(() => {
  fixedTenantLoadGeneration += 1;
  window.removeEventListener('resize', handleResize);
  window.removeEventListener(
    'ames:tenants-catalog-changed',
    onTenantsCatalogChanged,
  );
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
