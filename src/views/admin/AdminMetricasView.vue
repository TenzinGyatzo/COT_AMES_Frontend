<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Métricas de Uso</h1>

    <!-- Mensaje de error -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>

    <!-- Filtros -->
    <div class="mb-6 space-y-4">
      <!-- Filtros por periodo -->
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-sm font-medium text-gray-700 mb-3">
          Filtro por Periodo
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label
              for="fechaDesde"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Inicial
            </label>
            <input
              id="fechaDesde"
              v-model="fechaDesde"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-medical-blue-500 focus:border-medical-blue-500"
              @change="aplicarFiltros"
            />
          </div>
          <div>
            <label
              for="fechaHasta"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Final
            </label>
            <input
              id="fechaHasta"
              v-model="fechaHasta"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-medical-blue-500 focus:border-medical-blue-500"
              @change="aplicarFiltros"
            />
          </div>
          <div>
            <button
              @click="limpiarFiltrosFecha"
              class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              Limpiar Fechas
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sección Clientes -->
      <div>
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Clientes</h2>
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="overflow-y-auto max-h-[306px]">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    #
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Empresa
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    RFC
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Última Cotización
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Total COT
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="isLoading">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    Cargando métricas de clientes...
                  </td>
                </tr>
                <tr v-else-if="metricasClientes.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="(cliente, index) in metricasClientes"
                  :key="cliente.clienteId"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ index + 1 }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ cliente.empresa || '-' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 uppercase">
                    {{ cliente.rfc }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{
                      cliente.fechaUltimaCotizacion
                        ? formatDate(cliente.fechaUltimaCotizacion)
                        : '-'
                    }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {{ cliente.totalCotizaciones }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sección Servicios -->
      <div>
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Servicios</h2>
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="overflow-y-auto max-h-[306px]">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    #
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Servicio
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Precio Unitario
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Veces Contratado
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="isLoading">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    Cargando métricas de servicios...
                  </td>
                </tr>
                <tr v-else-if="metricasServicios.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="(servicio, index) in metricasServicios"
                  :key="servicio.servicioId"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ index + 1 }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ servicio.nombreServicio }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium"
                  >
                    {{ formatMoney(servicio.precioUnitario) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {{ servicio.vecesContratado }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección Resumen Ejecutivo -->
    <div class="mt-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        Resumen Ejecutivo
      </h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-4"
      >
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Emitidas</h3>
          <p class="text-2xl font-semibold text-gray-900">
            {{ metricasTotales?.cotizacionesEmitidas ?? metricasTotales?.cotizacionesTotales ?? '-' }}
          </p>
          <p class="text-xs text-gray-500 mt-1">En el periodo filtrado</p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Aceptadas</h3>
          <p class="text-2xl font-semibold text-gray-900">
            {{ metricasTotales?.cotizacionesAceptadas ?? '-' }}
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Rechazadas</h3>
          <p class="text-2xl font-semibold text-gray-900">
            {{ metricasTotales?.cotizacionesRechazadas ?? '-' }}
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Hoy</h3>
          <p class="text-2xl font-semibold text-gray-900">
            {{ metricasTotales?.cotizacionesHoy ?? '-' }}
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Este mes</h3>
          <p class="text-2xl font-semibold text-gray-900">
            {{ metricasTotales?.cotizacionesMes ?? '-' }}
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Este año</h3>
          <p class="text-2xl font-semibold text-gray-900">
            {{ metricasTotales?.cotizacionesAnio ?? '-' }}
          </p>
        </div>
      </div>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
      >
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Mayor Solicitante
          </h3>
          <p
            v-if="metricasTotales?.mayorSolicitante"
            class="text-lg font-semibold text-gray-900"
          >
            {{
              metricasTotales.mayorSolicitante.empresa ||
              metricasTotales.mayorSolicitante.rfc ||
              '-'
            }}
          </p>
          <p v-else class="text-lg font-semibold text-gray-900">-</p>
          <p
            v-if="metricasTotales?.mayorSolicitante"
            class="text-xs text-gray-500 mt-1"
          >
            {{ metricasTotales.mayorSolicitante.totalCotizaciones }}
            cotizaciones
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Cliente más activo del mes
          </h3>
          <p
            v-if="metricasTotales?.clienteMasActivoMes"
            class="text-lg font-semibold text-gray-900"
          >
            {{
              metricasTotales.clienteMasActivoMes.empresa ||
              metricasTotales.clienteMasActivoMes.rfc ||
              '-'
            }}
          </p>
          <p v-else class="text-lg font-semibold text-gray-900">-</p>
          <p
            v-if="metricasTotales?.clienteMasActivoMes"
            class="text-xs text-gray-500 mt-1"
          >
            {{ metricasTotales.clienteMasActivoMes.totalCotizaciones }}
            cotizaciones este mes
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Servicio más contratado
          </h3>
          <p class="text-lg font-semibold text-gray-900">
            {{ metricasTotales?.servicioMasSolicitado?.nombreServicio || '-' }}
          </p>
          <p
            v-if="metricasTotales?.servicioMasSolicitado"
            class="text-xs text-gray-500"
          >
            {{ metricasTotales.servicioMasSolicitado.vecesSolicitado }} veces
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Servicio más rentable
          </h3>
          <p class="text-lg font-semibold text-gray-900">
            {{ metricasTotales?.servicioMasRentable?.nombreServicio || '-' }}
          </p>
          <p
            v-if="metricasTotales?.servicioMasRentable"
            class="text-xs text-gray-500"
          >
            {{ formatMoney(metricasTotales.servicioMasRentable.ingresosTotales) }}
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Tasa de conversión
          </h3>
          <p class="text-lg font-semibold text-gray-900">
            {{
              metricasTotales?.tasaConversion !== undefined &&
              metricasTotales?.cotizacionesEmitidas
                ? (metricasTotales.tasaConversion * 100).toFixed(1) + '%'
                : metricasTotales?.tasaConversion === 0
                  ? '0.0%'
                  : '-'
            }}
          </p>
          <p
            v-if="metricasTotales?.cotizacionesEmitidas !== undefined"
            class="text-xs text-gray-500 mt-1"
          >
            {{ metricasTotales.cotizacionesAceptadas ?? 0 }} aceptadas de
            {{ metricasTotales.cotizacionesEmitidas }} emitidas
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Ingresos totales
          </h3>
          <p class="text-lg font-semibold text-gray-900">
            {{
              metricasTotales
                ? formatMoney(metricasTotales.ingresosTotales)
                : '-'
            }}
          </p>
          <p class="text-xs text-gray-500 mt-1">No incluye IVA</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdmin } from '../../composables/useAdmin';
import { formatMoney } from '../../utils/currency';

// Vista de métricas admin: orquesta la carga de datos usando el composable useAdmin
// Toda la lógica de negocio está en el composable, la vista solo maneja UI

const {
  metricasClientes,
  metricasServicios,
  metricasTotales,
  isLoading,
  error,
  obtenerMetricas,
} = useAdmin();

const fechaDesde = ref<string>('');
const fechaHasta = ref<string>('');

/**
 * Construye los filtros actuales y aplica las métricas
 */
const aplicarFiltros = async () => {
  try {
    const filters: {
      fechaDesde?: string;
      fechaHasta?: string;
    } = {};

    // Filtros por fecha
    if (fechaDesde.value) {
      // Crear fecha en hora local (no UTC) para evitar problemas de zona horaria
      // fechaDesde.value viene en formato "YYYY-MM-DD"
      const dateParts = fechaDesde.value.split('-').map(Number);
      if (
        dateParts.length === 3 &&
        dateParts[0] &&
        dateParts[1] &&
        dateParts[2]
      ) {
        const [year, month, day] = dateParts;
        const fechaDesdeDate = new Date(year, month - 1, day, 0, 0, 0, 0); // month - 1 porque Date usa 0-11
        filters.fechaDesde = fechaDesdeDate.toISOString();
      }
    }

    if (fechaHasta.value) {
      // Crear fecha en hora local (no UTC) para evitar problemas de zona horaria
      // fechaHasta.value viene en formato "YYYY-MM-DD"
      const dateParts = fechaHasta.value.split('-').map(Number);
      if (
        dateParts.length === 3 &&
        dateParts[0] &&
        dateParts[1] &&
        dateParts[2]
      ) {
        const [year, month, day] = dateParts;
        const fechaHastaDate = new Date(year, month - 1, day, 23, 59, 59, 999); // month - 1 porque Date usa 0-11
        filters.fechaHasta = fechaHastaDate.toISOString();
      }
    }

    // Recargar métricas con los filtros aplicados
    await obtenerMetricas(filters);
  } catch (err) {
    console.error('Error al aplicar filtros:', err);
  }
};

/**
 * Limpia los filtros de fecha
 */
const limpiarFiltrosFecha = async () => {
  fechaDesde.value = '';
  fechaHasta.value = '';
  await aplicarFiltros();
};

onMounted(async () => {
  try {
    await aplicarFiltros();
  } catch (err) {
    // El error ya está manejado en el store/composable
  }
});

// Formatear fecha para mostrar
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style scoped>
/* Scrollbar sutil y casi invisible */
.scrollbar-sutil::-webkit-scrollbar {
  height: 3px;
}
.scrollbar-sutil::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-sutil::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
.scrollbar-sutil::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Para Firefox */
.scrollbar-sutil {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}
</style>
