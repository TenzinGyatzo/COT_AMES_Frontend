<template>
  <section class="p-5">
    <BasePageHeader
      title="Mis órdenes de trabajo"
      description="Aquí puedes consultar el historial de órdenes de trabajo asociadas a tu empresa."
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700"> Estado </label>
          <select
            v-model="selectedEstado"
            class="rounded-md border-gray-300 text-sm px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </template>
    </BasePageHeader>

    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <BaseSectionLoader
      v-if="isLoading"
      message="Cargando órdenes de trabajo..."
    />

    <div v-else>
      <BaseEmptyState
        v-if="ordenes.length === 0"
        title="No se encontraron órdenes de trabajo"
        description="No hay órdenes de trabajo que coincidan con los criterios seleccionados."
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
                class="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider"
              >
                Sede
              </th>
              <th
                class="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider"
              >
                Cotización
              </th>
              <th
                class="px-4 py-2 text-center font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="orden in ordenes"
              :key="orden.id"
              class="hover:bg-gray-50"
            >
              <td
                class="px-4 py-2 whitespace-nowrap text-gray-800 font-mono text-xs"
              >
                {{ orden.folio }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-gray-600">
                {{ formatShortDate(orden.fechaCreacion) }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap">
                <BaseBadge :estado="orden.estado" size="sm" />
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-gray-600">
                {{ orden.nombreSede || '-' }}
              </td>
              <td
                class="px-4 py-2 whitespace-nowrap text-gray-600 font-mono text-xs"
              >
                {{ orden.folioCotizacion || '-' }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                  <router-link
                    :to="`/cliente/ordenes/${orden.id}`"
                    class="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Ver detalle
                  </router-link>
                  <button
                    type="button"
                    @click="handleDownloadPDF(orden)"
                    class="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors border border-gray-400 text-gray-700 hover:bg-gray-200"
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
import { useClienteOrdenes } from '../../composables/useClienteOrdenes';
import { downloadOrdenTrabajoPDF } from '../../utils/pdfHelper';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import BaseEmptyState from '../../components/base/BaseEmptyState.vue';
import BaseBadge from '../../components/base/BaseBadge.vue';
import BasePageHeader from '../../components/base/BasePageHeader.vue';
import type { OrdenTrabajoListItemDto } from '../../types/backend';

const {
  ordenes,
  detalle,
  isLoading,
  error,
  pagination,
  fetchMisOrdenes,
  fetchOrden,
} = useClienteOrdenes();

// Computed property para ordenar por fecha (más reciente primero)


const selectedEstado = ref<
  '' | 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
>('');

// Función para cargar órdenes
async function loadOrdenes() {
  try {
    await fetchMisOrdenes({
      estado: selectedEstado.value || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
    });
  } catch (err) {
    // El error ya se maneja en el store
    console.error('Error al cargar órdenes de trabajo:', err);
  }
}

// Handlers de paginación
function goToPrevPage() {
  if (pagination.value.page > 1) {
    fetchMisOrdenes({
      estado: selectedEstado.value || undefined,
      page: pagination.value.page - 1,
      limit: pagination.value.limit,
    });
  }
}

function goToNextPage() {
  if (pagination.value.page < pagination.value.totalPages) {
    fetchMisOrdenes({
      estado: selectedEstado.value || undefined,
      page: pagination.value.page + 1,
      limit: pagination.value.limit,
    });
  }
}

// Watch para recargar cuando cambie el estado (resetear página a 1)
watch(selectedEstado, () => {
  fetchMisOrdenes({
    estado: selectedEstado.value || undefined,
    page: 1,
    limit: pagination.value.limit,
  });
});

// Cargar órdenes al montar el componente
onMounted(() => {
  loadOrdenes();
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

// Estado de carga para descarga
const isDownloading = ref<string | null>(null);

// Handler para descargar PDF
async function handleDownloadPDF(orden: OrdenTrabajoListItemDto): Promise<void> {
  try {
    isDownloading.value = orden.id;
    // Cargar detalle completo
    await fetchOrden(orden.id);
    
    if (detalle.value) {
      await downloadOrdenTrabajoPDF(detalle.value);
    }
  } catch (err) {
    console.error('Error al descargar PDF:', err);
    alert('No se pudo generar el PDF. Intente nuevamente.');
  } finally {
    isDownloading.value = null;
  }
}
</script>
