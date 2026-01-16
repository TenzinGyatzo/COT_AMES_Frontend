<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Cotizaciones</h1>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Filtros -->
    <div class="mb-6 bg-white shadow-md rounded-lg p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            v-model="filters.estado"
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @change="loadCotizaciones"
          >
            <option :value="undefined">Todos</option>
            <option value="vigente">Vigente</option>
            <option value="vencida">Vencida</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Búsqueda
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Buscar por folio, empresa, estado, sede, contacto..."
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @input="handleSearchChange"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fecha desde
          </label>
          <input
            v-model="filters.fechaDesde"
            type="date"
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @change="loadCotizaciones"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fecha hasta
          </label>
          <input
            v-model="filters.fechaHasta"
            type="date"
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @change="loadCotizaciones"
          />
        </div>
      </div>
    </div>

    <!-- Tabla de cotizaciones -->
    <BaseSectionLoader
      v-if="isLoadingCotizaciones"
      message="Cargando cotizaciones..."
    />

    <div v-else>
      <div
        v-if="resumenCotizaciones.length === 0"
        class="bg-white shadow-md rounded-lg p-8 text-center"
      >
        <p class="text-gray-500">No se encontraron cotizaciones</p>
      </div>

      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Folio
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Empresa
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sede
                </th>
                <th
                  class="table-cell md:hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contacto
                </th>
                <th
                  class="table-cell md:hidden lg:table-cell px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="cotizacion in resumenCotizaciones"
                :key="cotizacion.id"
                class="hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-mono"
                >
                  {{ cotizacion.folio }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(cotizacion.fecha) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getEstadoBadgeClass(cotizacion.estado)"
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ getEstadoLabel(cotizacion.estado) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ cotizacion.empresa || '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ cotizacion.sede || '-' }}
                </td>
                <td
                  class="table-cell md:hidden xl:table-cell px-6 py-4 text-sm text-gray-900"
                >
                  {{ cotizacion.nombreSolicitante || '-' }}
                </td>
                <td
                  class="table-cell md:hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right"
                >
                  ${{
                    cotizacion.montoTotal.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"
                >
                  <router-link
                    :to="{
                      name: 'admin-cotizacion-detalle',
                      params: { id: cotizacion.id },
                    }"
                    class="text-medical-blue-600 hover:text-medical-blue-900"
                  >
                    Ver detalle
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div
          v-if="cotizacionesPagination.totalPages > 1"
          class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200"
        >
          <div class="text-sm text-gray-700">
            Mostrando
            {{
              (cotizacionesPagination.page - 1) * cotizacionesPagination.limit +
              1
            }}
            a
            {{
              Math.min(
                cotizacionesPagination.page * cotizacionesPagination.limit,
                cotizacionesPagination.total,
              )
            }}
            de {{ cotizacionesPagination.total }} resultados
          </div>
          <div class="flex gap-2">
            <button
              :disabled="cotizacionesPagination.page === 1"
              @click="goToPrevPage"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              :disabled="
                cotizacionesPagination.page >= cotizacionesPagination.totalPages
              "
              @click="goToNextPage"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdmin } from '../../composables/useAdmin';
import type { AdminCotizacionesFilters } from '../../services/admin-api.service';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';

const {
  resumenCotizaciones,
  cotizacionesPagination,
  isLoadingCotizaciones,
  error,
  obtenerCotizacionesAdmin,
} = useAdmin();

const filters = ref<AdminCotizacionesFilters>({
  estado: undefined,
  search: '',
  fechaDesde: '',
  fechaHasta: '',
  page: 1,
  limit: 10,
});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

// Manejar cambios en búsqueda con debounce
function handleSearchChange() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    filters.value.page = 1;
    loadCotizaciones();
  }, 500);
}

async function loadCotizaciones() {
  try {
    const activeFilters: AdminCotizacionesFilters = {
      page: filters.value.page,
      limit: filters.value.limit,
    };

    if (filters.value.estado) {
      activeFilters.estado = filters.value.estado;
    }
    if (filters.value.search) {
      activeFilters.search = filters.value.search;
    }
    if (filters.value.fechaDesde) {
      // Crear fecha en hora local (no UTC) para evitar problemas de zona horaria
      // filters.value.fechaDesde viene en formato "YYYY-MM-DD"
      const dateParts = filters.value.fechaDesde.split('-').map(Number);
      if (
        dateParts.length === 3 &&
        dateParts[0] &&
        dateParts[1] &&
        dateParts[2]
      ) {
        const [year, month, day] = dateParts;
        const fechaDesdeDate = new Date(year, month - 1, day, 0, 0, 0, 0); // month - 1 porque Date usa 0-11
        activeFilters.fechaDesde = fechaDesdeDate.toISOString();
      }
    }
    if (filters.value.fechaHasta) {
      // Crear fecha en hora local (no UTC) para evitar problemas de zona horaria
      // filters.value.fechaHasta viene en formato "YYYY-MM-DD"
      const dateParts = filters.value.fechaHasta.split('-').map(Number);
      if (
        dateParts.length === 3 &&
        dateParts[0] &&
        dateParts[1] &&
        dateParts[2]
      ) {
        const [year, month, day] = dateParts;
        const fechaHastaDate = new Date(year, month - 1, day, 23, 59, 59, 999); // month - 1 porque Date usa 0-11
        activeFilters.fechaHasta = fechaHastaDate.toISOString();
      }
    }

    await obtenerCotizacionesAdmin(activeFilters);
  } catch (err) {
    // El error ya se maneja en el store
    console.error('Error al cargar cotizaciones:', err);
  }
}

function goToPrevPage() {
  if (cotizacionesPagination.value.page > 1) {
    filters.value.page = cotizacionesPagination.value.page - 1;
    loadCotizaciones();
  }
}

function goToNextPage() {
  if (
    cotizacionesPagination.value.page < cotizacionesPagination.value.totalPages
  ) {
    filters.value.page = cotizacionesPagination.value.page + 1;
    loadCotizaciones();
  }
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getEstadoLabel(estado: string): string {
  const labels: Record<string, string> = {
    vigente: 'Vigente',
    vencida: 'Vencida',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
  };
  return labels[estado] || estado;
}

function getEstadoBadgeClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-100 text-green-800',
    vencida: 'bg-gray-100 text-gray-800',
    aceptada: 'bg-blue-100 text-blue-800',
    rechazada: 'bg-red-100 text-red-800',
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
}

// Cargar cotizaciones al montar el componente
onMounted(() => {
  loadCotizaciones();
});
</script>
