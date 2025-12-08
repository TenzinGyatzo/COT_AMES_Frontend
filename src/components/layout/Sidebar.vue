<template>
  <!-- Pestaña hamburguesa para móviles -->
  <button
    @click="toggleSidebar"
    class="fixed top-1/2 -translate-y-1/2 -left-8 md:hidden bg-gray-800 text-white hover:bg-gray-700 hover:translate-x-6 transition-all duration-300 shadow-lg rounded-r-lg px-3 py-4 border-r border-t border-b border-gray-700 group cursor-pointer z-50"
    aria-label="Toggle sidebar"
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
        <span class="text-2xl font-bold text-white">MOC</span>
        <button
          @click="closeSidebar"
          class="md:hidden text-gray-400 hover:text-white transition-colors"
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
      <nav class="flex-1 p-4 space-y-2">
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
          to="/admin/ordenes"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-ordenes' ||
            $route.name === 'admin-orden-detalle'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Órdenes
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
          to="/admin/sedes"
          class="block px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            $route.name === 'admin-sedes'
              ? 'bg-medical-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          "
        >
          Sedes
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
      </nav>

      <!-- Botón Cerrar Sesión -->
      <div class="p-4 border-t border-gray-700">
        <button
          class="w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
          @click="handleLogout"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../store/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Estado del sidebar
const isSidebarOpen = ref(false);

// Cerrar sidebar cuando cambia la ruta (en móviles)
watch(
  () => route.path,
  () => {
    if (window.innerWidth < 768) {
      isSidebarOpen.value = false;
    }
  },
);

// Cerrar sidebar cuando la ventana se hace más grande
const handleResize = () => {
  if (window.innerWidth >= 768) {
    isSidebarOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
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
