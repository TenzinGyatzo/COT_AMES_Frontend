<template>
  <section class="p-5">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-800 mb-2">Panel principal</h1>
      <p class="text-gray-600 mb-6">
        Aquí verás un resumen de tus cotizaciones y órdenes de trabajo.
      </p>

      <!-- Mensaje de error -->
      <div
        v-if="error"
        class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- Estado de carga -->
      <BaseSectionLoader v-if="isLoading" message="Cargando resumen..." />

      <!-- Contadores -->
      <div v-else-if="counters" class="space-y-6">
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
                    {{ counters.cotizaciones.vigentes }}
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

            <!-- Cotizaciones Aceptadas -->
            <div
              class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">
                    Aceptadas
                  </p>
                  <p class="text-3xl font-bold text-blue-600">
                    {{ counters.cotizaciones.aceptadas }}
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

            <!-- Cotizaciones Rechazadas -->
            <div
              class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">
                    Rechazadas
                  </p>
                  <p class="text-3xl font-bold text-red-600">
                    {{ counters.cotizaciones.rechazadas }}
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

            <!-- Cotizaciones Vencidas -->
            <div
              class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Vencidas</p>
                  <p class="text-3xl font-bold text-gray-600">
                    {{ counters.cotizaciones.vencidas }}
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Órdenes Pendientes -->
            <div
              class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">
                    Pendientes
                  </p>
                  <p class="text-3xl font-bold text-yellow-600">
                    {{ counters.ordenes.pendientes }}
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
                  <p class="text-sm font-medium text-gray-600 mb-1">
                    En Proceso
                  </p>
                  <p class="text-3xl font-bold text-blue-600">
                    {{ counters.ordenes.enProceso }}
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
                    {{ counters.ordenes.completadas }}
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
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Acciones rápidas
          </h2>
          <router-link
            :to="{ name: 'cliente-cotizacion-nueva' }"
            class="inline-flex items-center px-6 py-3 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-base shadow-sm"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Crear nueva cotización
          </router-link>
        </div>
      </div>

      <!-- Estado vacío (sin contadores pero sin error) -->
      <div
        v-else
        class="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200"
      >
        <p class="text-gray-500">No se pudieron cargar los contadores</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useClienteDashboard } from '../../composables/useClienteDashboard';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';

const { counters, isLoading, error, fetchDashboardCounters, clearDashboard } =
  useClienteDashboard();

// Cargar contadores al montar el componente
onMounted(async () => {
  try {
    await fetchDashboardCounters();
  } catch (err) {
    // El error ya se maneja en el store
    console.error('Error al cargar contadores del dashboard:', err);
  }
});

// Limpiar estado al desmontar
onUnmounted(() => {
  clearDashboard();
});
</script>
