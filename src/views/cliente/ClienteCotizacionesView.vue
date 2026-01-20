<template>
  <section class="p-5">
    <BasePageHeader
      title="Mis cotizaciones"
      description="Aquí puedes consultar el historial de cotizaciones asociadas a tu empresa."
    >
      <template #actions>
        <div class="flex items-center gap-3">
          <router-link
            :to="{ name: 'cliente-cotizacion-nueva' }"
            class="inline-flex items-center px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-sm shadow-sm"
          >
            <svg
              class="w-4 h-4 mr-2"
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
            <span>Nueva</span>
            <span class="hidden sm:inline">&nbsp;Cotización</span>
          </router-link>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700"> Estado </label>
            <select
              v-model="selectedEstado"
              class="rounded-md border-gray-300 text-sm px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="vigente">Vigente</option>
              <option value="vencida">Vencida</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        </div>
      </template>
    </BasePageHeader>

    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <BaseSectionLoader v-if="isLoading" message="Cargando cotizaciones..." />

    <div v-else>
      <BaseEmptyState
        v-if="listado.length === 0"
        title="No se encontraron cotizaciones"
        description="No hay cotizaciones que coincidan con los criterios seleccionados."
        size="md"
      />

      <div
        v-else
        class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md"
      >
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider"
              >
                Folio
              </th>
              <th
                class="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha
              </th>
              <th
                class="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider"
              >
                Total
              </th>
              <th
                class="px-4 py-2 text-center font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="cot in listado" :key="cot.id" class="hover:bg-gray-50">
              <td
                class="px-4 py-2 whitespace-nowrap text-gray-800 font-mono text-xs"
              >
                {{ cot.folio }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-gray-600">
                {{ formatShortDate(cot.fecha) }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap">
                <BaseBadge :estado="cot.estado" size="sm" />
              </td>
              <td
                class="px-4 py-2 whitespace-nowrap text-right text-gray-800 font-medium"
              >
                {{ formatCurrency(cot.montoTotal) }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                  <router-link
                    :to="`/cliente/cotizaciones/${cot.id}`"
                    class="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Ver detalle
                  </router-link>
                  <button
                    type="button"
                    @click="handleDownloadPDF(cot)"
                    class="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors border border-gray-400 text-gray-700 hover:bg-gray-200"
                    title="Descargar PDF"
                  >
                    Descargar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 flex items-center justify-between text-sm text-gray-600">
        <div>Página {{ pagination.page }} de {{ pagination.totalPages }}</div>
        <div class="space-x-2">
          <button
            type="button"
            class="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.page <= 1"
            @click="goToPrevPage"
          >
            Anterior
          </button>
          <button
            type="button"
            class="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.page >= pagination.totalPages"
            @click="goToNextPage"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useClienteCotizaciones } from '../../composables/useClienteCotizaciones';
import { downloadCotizacionPDF } from '../../utils/pdfHelper';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import BaseEmptyState from '../../components/base/BaseEmptyState.vue';
import BaseBadge from '../../components/base/BaseBadge.vue';
import BasePageHeader from '../../components/base/BasePageHeader.vue';
import type { CotizacionListItemDto } from '../../types/backend';

const {
  listado,
  detalle,
  isLoading,
  error,
  pagination,
  fetchMisCotizaciones,
  fetchCotizacion,
} = useClienteCotizaciones();

const selectedEstado = ref<
  | 'todas'
  | 'vigente'
  | 'vencida'
  | 'aceptada'
  | 'rechazada'
  | 'en_proceso'
  | 'completada'
>('todas');

// Función para cargar cotizaciones
async function loadCotizaciones() {
  try {
    await fetchMisCotizaciones({
      estado:
        selectedEstado.value === 'todas' ? undefined : selectedEstado.value,
      page: pagination.value.page,
      limit: pagination.value.limit,
    });
  } catch (err) {
    // El error ya se maneja en el store
    console.error('Error al cargar cotizaciones:', err);
  }
}

// Handlers de paginación
function goToPrevPage() {
  if (pagination.value.page > 1) {
    fetchMisCotizaciones({
      estado:
        selectedEstado.value === 'todas' ? undefined : selectedEstado.value,
      page: pagination.value.page - 1,
      limit: pagination.value.limit,
    });
  }
}

function goToNextPage() {
  if (pagination.value.page < pagination.value.totalPages) {
    fetchMisCotizaciones({
      estado:
        selectedEstado.value === 'todas' ? undefined : selectedEstado.value,
      page: pagination.value.page + 1,
      limit: pagination.value.limit,
    });
  }
}

// Watch para recargar cuando cambie el estado (resetear página a 1)
watch(selectedEstado, () => {
  fetchMisCotizaciones({
    estado: selectedEstado.value === 'todas' ? undefined : selectedEstado.value,
    page: 1,
    limit: pagination.value.limit,
  });
});

// Cargar cotizaciones al montar el componente
onMounted(() => {
  loadCotizaciones();
});

// Helpers de formato
function formatShortDate(iso: string | Date | undefined): string {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(value: number | undefined): string {
  if (value == null) return '';
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

// Estado de carga para descarga
const isDownloading = ref<string | null>(null);

// Handler para descargar PDF
async function handleDownloadPDF(cotizacion: CotizacionListItemDto): Promise<void> {
  try {
    isDownloading.value = cotizacion.id;
    // Cargar detalle completo
    await fetchCotizacion(cotizacion.id);
    
    if (detalle.value) {
      await downloadCotizacionPDF(detalle.value);
    }
  } catch (err) {
    console.error('Error al descargar PDF:', err);
    alert('No se pudo generar el PDF. Intente nuevamente.');
  } finally {
    isDownloading.value = null;
  }
}
</script>
