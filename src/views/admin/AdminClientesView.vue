<template>
  <div class="max-w-7xl mx-auto">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Clientes</h1>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Filtros -->
    <div class="mb-4 md:mb-6 bg-white shadow-md rounded-lg p-4 md:p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          <input
            v-model="filters.empresa"
            type="text"
            placeholder="Buscar por empresa..."
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @input="handleFilterChange"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            RFC
          </label>
          <input
            v-model="filters.rfc"
            type="text"
            placeholder="Buscar por RFC..."
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500 uppercase"
            @input="handleFilterChange"
          />
        </div>
      </div>
    </div>

    <!-- Tabla de clientes agrupados por empresa -->
    <BaseSectionLoader
      v-if="isLoadingClientes"
      message="Cargando clientes..."
    />

    <div v-else>
      <div
        v-if="clientesAgrupados.length === 0"
        class="bg-white shadow-md rounded-lg p-6 md:p-8 text-center"
      >
        <p class="text-sm md:text-base text-gray-500">
          No se encontraron clientes
        </p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <div
          v-for="grupo in clientesAgrupados"
          :key="grupo.clienteId"
          class="bg-white shadow-md rounded-lg overflow-hidden"
        >
          <!-- Encabezado de la empresa -->
          <div
            class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gray-50 border-b border-gray-200"
          >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div class="flex-1 min-w-0">
                <div class="mb-2 sm:mb-3">
                  <span
                    class="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words"
                  >
                    {{ grupo.empresa || 'Sin nombre' }}
                  </span>
                </div>
                <div class="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <span class="text-xs sm:text-sm text-gray-600 break-all">{{ grupo.rfc }}</span>
                  <span class="sm:ml-3 md:ml-4">
                    <span
                      v-if="grupo.activo !== false"
                      class="inline-block px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                    >
                      Activo
                    </span>
                    <span
                      v-else
                      class="inline-block px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                    >
                      Inactivo
                    </span>
                  </span>
                </div>
                <div
                  class="mt-2 sm:mt-3 flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600"
                >
                  <span class="whitespace-nowrap">
                    <span class="font-medium">Usuarios:</span>
                    <span class="ml-1 font-semibold text-gray-900">{{
                      grupo.totalUsuarios || 0
                    }}</span>
                  </span>
                  <span class="whitespace-nowrap">
                    <span class="font-medium">Cotizaciones:</span>
                    <span class="ml-1 font-semibold text-gray-900">{{
                      grupo.totalCotizaciones || 0
                    }}</span>
                  </span>
                  <span class="whitespace-nowrap">
                    <span class="font-medium">Órdenes:</span>
                    <span class="ml-1 font-semibold text-gray-900">{{
                      grupo.totalOrdenesTrabajo || 0
                    }}</span>
                  </span>
                </div>
                <div
                  v-if="grupo.clave"
                  class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mt-2 sm:mt-3 md:mt-4"
                >
                  <label class="text-xs font-medium text-gray-700 whitespace-nowrap">
                    Clave de la empresa:
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      :value="grupo.clave"
                      type="text"
                      readonly
                      class="w-20 sm:w-24 rounded-md border-gray-300 text-xs px-2 py-1.5 border bg-gray-50 text-gray-900 font-mono font-semibold"
                    />
                    <button
                      type="button"
                      @click="copiarClave(grupo.clave)"
                      class="px-2 sm:px-3 py-1.5 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors text-xs font-medium whitespace-nowrap"
                      title="Copiar clave"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <!-- Mensaje de éxito -->
                <div
                  v-if="successMessage"
                  class="mt-2 sm:mt-3 md:mt-4 rounded-md bg-green-50 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm text-green-700 max-w-full sm:max-w-xs"
                >
                  {{ successMessage }}
                </div>
              </div>
              <div
                class="flex items-center justify-end sm:justify-start sm:flex-shrink-0 sm:ml-4 md:ml-6"
              >
                <router-link
                  :to="{
                    name: 'admin-cliente-detalle',
                    params: { id: grupo.clienteId },
                  }"
                  class="inline-flex items-center px-3 sm:px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap w-full sm:w-auto justify-center"
                >
                  Ver detalle
                  <svg
                    class="w-4 h-4 ml-1 sm:ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdmin } from '../../composables/useAdmin';
import type { AdminClientesFilters } from '../../services/admin-api.service';
import type { Cliente } from '../../types/backend';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';

const { clientes, isLoadingClientes, error, obtenerClientes } = useAdmin();

const filters = ref<AdminClientesFilters>({
  empresa: '',
  rfc: '',
});

const successMessage = ref<string | null>(null);

let filterTimeout: ReturnType<typeof setTimeout> | null = null;

// Manejar cambios en filtros con debounce
function handleFilterChange() {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
  }

  filterTimeout = setTimeout(() => {
    loadClientes();
  }, 500);
}

async function loadClientes() {
  try {
    const activeFilters: AdminClientesFilters = {};

    if (filters.value.empresa) {
      activeFilters.empresa = filters.value.empresa;
    }
    if (filters.value.rfc) {
      activeFilters.rfc = filters.value.rfc;
    }

    await obtenerClientes(activeFilters);
  } catch (err) {
    // El error ya se maneja en el store
    console.error('Error al cargar clientes:', err);
  }
}

// Agrupar clientes por empresa (clienteId)
const clientesAgrupados = computed(() => {
  const grupos = new Map<
    string,
    {
      clienteId: string;
      empresa?: string;
      rfc: string;
      clave?: string;
      activo?: boolean;
      totalUsuarios?: number;
      totalCotizaciones?: number;
      totalOrdenesTrabajo?: number;
    }
  >();

  clientes.value.forEach((cliente: Cliente) => {
    const clienteId = cliente._id || '';
    if (!grupos.has(clienteId)) {
      grupos.set(clienteId, {
        clienteId,
        empresa: cliente.empresa,
        rfc: cliente.rfc,
        clave: cliente.clave,
        activo: cliente.activo,
        totalUsuarios: cliente.totalUsuarios,
        totalCotizaciones: cliente.totalCotizaciones,
        totalOrdenesTrabajo: cliente.totalOrdenesTrabajo,
      });
    }
  });

  return Array.from(grupos.values());
});

// Función para copiar la clave al portapapeles
const copiarClave = async (clave: string) => {
  try {
    await navigator.clipboard.writeText(clave);
    successMessage.value = 'Clave copiada al portapapeles';
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err) {
    console.error('Error al copiar:', err);
    // Fallback para navegadores que no soportan clipboard API
    const input = document.createElement('input');
    input.value = clave;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    successMessage.value = 'Clave copiada al portapapeles';
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  }
};

// Cargar clientes al montar el componente
onMounted(() => {
  loadClientes();
});
</script>
