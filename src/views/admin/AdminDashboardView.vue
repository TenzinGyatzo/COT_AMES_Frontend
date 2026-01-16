<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Estado de carga -->
    <BaseSectionLoader
      v-if="isLoadingDashboard"
      message="Cargando resumen..."
    />

    <!-- Contadores -->
    <div v-else-if="dashboardCounters" class="space-y-6">
      <!-- Métricas Principales -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Métricas Principales
        </h2>
        <div class="grid grid-cols-1  sm:grid-cols-2 gap-4">
          <!-- Cotizaciones Aceptadas -->
          <div
            class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-7 border-2 border-blue-400 hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide"
                >
                  Cotizaciones Aceptadas
                </p>
                <p class="text-4xl font-extrabold text-blue-700">
                  {{ dashboardCounters.cotizaciones.aceptadas }}
                </p>
              </div>
              <div class="p-4 bg-blue-200 rounded-full shadow-md">
                <svg
                  class="w-7 h-7 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Órdenes Pendientes -->
          <div
            class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-lg p-7 border-2 border-yellow-400 hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-sm font-semibold text-yellow-700 mb-2 uppercase tracking-wide"
                >
                  Órdenes Pendientes
                </p>
                <p class="text-4xl font-extrabold text-yellow-700">
                  {{ dashboardCounters.ordenes.pendientes }}
                </p>
              </div>
              <div class="p-4 bg-yellow-200 rounded-full shadow-md">
                <svg
                  class="w-7 h-7 text-yellow-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contadores de Cotizaciones -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Cotizaciones</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Cotizaciones Vigentes -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Vigentes</p>
                <p class="text-3xl font-bold text-green-600">
                  {{ dashboardCounters.cotizaciones.vigentes }}
                </p>
              </div>
              <div class="p-3 bg-green-100 rounded-full">
                <svg
                  class="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Cotizaciones Rechazadas -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Rechazadas</p>
                <p class="text-3xl font-bold text-red-600">
                  {{ dashboardCounters.cotizaciones.rechazadas }}
                </p>
              </div>
              <div class="p-3 bg-red-100 rounded-full">
                <svg
                  class="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Cotizaciones Aceptadas -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Aceptadas</p>
                <p class="text-3xl font-bold text-blue-600">
                  {{ dashboardCounters.cotizaciones.aceptadas }}
                </p>
              </div>
              <div class="p-3 bg-blue-100 rounded-full">
                <svg
                  class="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Cotizaciones Vencidas -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Vencidas</p>
                <p class="text-3xl font-bold text-gray-600">
                  {{ dashboardCounters.cotizaciones.vencidas }}
                </p>
              </div>
              <div class="p-3 bg-gray-100 rounded-full">
                <svg
                  class="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Contadores de Órdenes -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Órdenes de Trabajo
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Órdenes Pendientes -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
                <p class="text-3xl font-bold text-yellow-600">
                  {{ dashboardCounters.ordenes.pendientes }}
                </p>
              </div>
              <div class="p-3 bg-yellow-100 rounded-full">
                <svg
                  class="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Órdenes en Proceso -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">En Proceso</p>
                <p class="text-3xl font-bold text-blue-600">
                  {{ dashboardCounters.ordenes.enProceso }}
                </p>
              </div>
              <div class="p-3 bg-blue-100 rounded-full">
                <svg
                  class="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Órdenes Completadas -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">
                  Completadas
                </p>
                <p class="text-3xl font-bold text-green-600">
                  {{ dashboardCounters.ordenes.completadas }}
                </p>
              </div>
              <div class="p-3 bg-green-100 rounded-full">
                <svg
                  class="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Órdenes Canceladas -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Canceladas</p>
                <p class="text-3xl font-bold text-red-600">
                  {{ dashboardCounters.ordenes.canceladas }}
                </p>
              </div>
              <div class="p-3 bg-red-100 rounded-full">
                <svg
                  class="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Totales -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Totales</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Empresas Clientes -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">
                  Empresas Clientes
                </p>
                <p class="text-3xl font-bold text-indigo-600">
                  {{ dashboardCounters.totales.clientesActivos }}
                </p>
              </div>
              <div class="p-3 bg-indigo-100 rounded-full">
                <svg
                  class="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Usuarios Cliente -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">
                  Usuarios Cliente
                </p>
                <p class="text-3xl font-bold text-purple-600">
                  {{ dashboardCounters.totales.usuariosCliente }}
                </p>
              </div>
              <div class="p-3 bg-purple-100 rounded-full">
                <svg
                  class="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Sedes -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Sedes</p>
                <p class="text-3xl font-bold text-orange-600">
                  {{ dashboardCounters.totales.sedes }}
                </p>
              </div>
              <div class="p-3 bg-orange-100 rounded-full">
                <svg
                  class="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Servicios -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Servicios</p>
                <p class="text-3xl font-bold text-teal-600">
                  {{ dashboardCounters.totales.servicios }}
                </p>
              </div>
              <div class="p-3 bg-teal-100 rounded-full">
                <svg
                  class="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío (sin contadores pero sin error) -->
    <div
      v-else-if="!isLoadingDashboard"
      class="bg-white shadow-md rounded-lg p-8 text-center border border-gray-200"
    >
      <p class="text-gray-500">No se pudieron cargar los contadores</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useAdmin } from '../../composables/useAdmin';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';

const {
  dashboardCounters,
  isLoadingDashboard,
  error,
  obtenerDashboardCounters,
  limpiarDashboardCounters,
} = useAdmin();

// Cargar contadores al montar el componente
onMounted(async () => {
  try {
    await obtenerDashboardCounters();
  } catch (err) {
    // El error ya se maneja en el store
    console.error('Error al cargar contadores del dashboard:', err);
  }
});

// Limpiar estado al desmontar
onUnmounted(() => {
  limpiarDashboardCounters();
});
</script>
