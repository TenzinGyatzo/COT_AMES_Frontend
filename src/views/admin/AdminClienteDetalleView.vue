<template>
  <div class="max-w-7xl mx-auto">
    <BaseBackButton to="/admin/clientes" class="mb-4" />

    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
      Detalle del Cliente
    </h1>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <BaseSectionLoader
      v-if="isLoadingClientes && !clienteDetalle"
      message="Cargando cliente..."
    />

    <div v-else-if="clienteDetalle" class="space-y-4 md:space-y-6">
      <!-- Información Principal -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-200"
        >
          <h2 class="text-lg md:text-xl font-semibold text-gray-800">
            Información de la Empresa
          </h2>
          <span
            v-if="clienteDetalle.activo !== false"
            class="mt-2 md:mt-0 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
          >
            Activo
          </span>
          <span
            v-else
            class="mt-2 md:mt-0 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
          >
            Inactivo
          </span>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Empresa
            </label>
            <p class="text-sm md:text-base text-gray-900 font-medium">
              {{ clienteDetalle.empresa || 'No especificado' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              RFC
            </label>
            <p class="text-sm md:text-base text-gray-900 font-mono uppercase">
              {{ clienteDetalle.rfc }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Clave de la empresa
            </label>
            <div class="flex items-center gap-2">
              <p
                class="text-sm md:text-base text-gray-900 font-mono font-semibold"
              >
                {{ clienteDetalle.clave || 'No disponible' }}
              </p>
              <button
                v-if="clienteDetalle.clave"
                type="button"
                @click="copiarClave"
                class="px-2 py-1 bg-medical-blue-600 text-white rounded text-xs hover:bg-medical-blue-700 transition-colors"
                title="Copiar clave"
              >
                Copiar
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Comparte esta clave para que otros usuarios se unan a esta empresa
            </p>
          </div>

          <div v-if="sedeNombre">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Sede
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ sedeNombre }}
            </p>
          </div>

          <div v-if="clienteDetalle._id">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              ID del Cliente
            </label>
            <p class="text-xs text-gray-500 font-mono break-all">
              {{ clienteDetalle._id }}
            </p>
          </div>
        </div>
      </div>

      <!-- Usuarios del Cliente -->
      <div
        v-if="usuarios.length > 0"
        class="bg-white shadow-md rounded-lg p-4 md:p-6"
      >
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Usuarios Asociados
        </h2>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Teléfono
                </th>
                <th
                  class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  COT
                </th>
                <th
                  class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  OT
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="usuario in usuarios"
                :key="usuario._id"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-3 text-sm text-gray-900">
                  {{ usuario.nombre }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  {{ usuario.email }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  {{ usuario.telefono || '-' }}
                </td>
                <td
                  class="px-4 py-3 text-sm text-gray-900 text-center font-medium"
                >
                  {{ usuario.totalCotizaciones || 0 }}
                </td>
                <td
                  class="px-4 py-3 text-sm text-gray-900 text-center font-medium"
                >
                  {{ usuario.totalOrdenesTrabajo || 0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actividad de Órdenes de Trabajo -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Órdenes de Trabajo
        </h2>

        <BaseSectionLoader
          v-if="isLoadingOrdenesStats"
          message="Cargando estadísticas..."
        />

        <div
          v-else-if="ordenesStats"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <!-- Órdenes Pendientes -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
                <p class="text-3xl font-bold text-yellow-600">
                  {{ ordenesStats.pendientes }}
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
                  {{ ordenesStats.enProceso }}
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
                  {{ ordenesStats.completadas }}
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
                  {{ ordenesStats.canceladas }}
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
    </div>

    <div
      v-else-if="!isLoadingClientes"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">No se pudo cargar la información del cliente</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAdmin } from '../../composables/useAdmin';
import {
  getUsuariosByClienteId,
  getOrdenesAdmin,
} from '../../services/admin-api.service';
import type { UsuarioCliente, Sede } from '../../types/backend';
import BaseBackButton from '../../components/base/BaseBackButton.vue';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';

const route = useRoute();
const {
  clienteDetalle,
  isLoadingClientes,
  error,
  obtenerCliente,
  limpiarClienteDetalle,
} = useAdmin();

const usuarios = ref<UsuarioCliente[]>([]);
const isLoadingUsuarios = ref(false);

const ordenesStats = ref<{
  pendientes: number;
  enProceso: number;
  completadas: number;
  canceladas: number;
} | null>(null);
const isLoadingOrdenesStats = ref(false);

// Computed para obtener el nombre de la sede
const sedeNombre = computed((): string => {
  if (!clienteDetalle.value?.sedeId) return '';
  const sede = clienteDetalle.value.sedeId;
  if (typeof sede === 'object' && sede !== null) {
    return (sede as Sede).ciudad || (sede as Sede).clave || '';
  }
  return '';
});

// Función para copiar la clave al portapapeles
const copiarClave = async () => {
  if (clienteDetalle.value?.clave) {
    try {
      await navigator.clipboard.writeText(clienteDetalle.value.clave);
      alert('Clave copiada al portapapeles');
    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback para navegadores que no soportan clipboard API
      const input = document.createElement('input');
      input.value = clienteDetalle.value.clave;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('Clave copiada al portapapeles');
    }
  }
};

// Cargar usuarios del cliente
const cargarUsuarios = async (clienteId: string) => {
  isLoadingUsuarios.value = true;
  try {
    usuarios.value = await getUsuariosByClienteId(clienteId);
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
    usuarios.value = [];
  } finally {
    isLoadingUsuarios.value = false;
  }
};

// Cargar estadísticas de órdenes de trabajo del cliente
const cargarOrdenesStats = async (clienteId: string) => {
  isLoadingOrdenesStats.value = true;
  try {
    const [pendientes, enProceso, completadas, canceladas] = await Promise.all([
      getOrdenesAdmin({ clienteId, estado: 'pendiente', limit: 1, page: 1 }),
      getOrdenesAdmin({ clienteId, estado: 'en_proceso', limit: 1, page: 1 }),
      getOrdenesAdmin({ clienteId, estado: 'completada', limit: 1, page: 1 }),
      getOrdenesAdmin({ clienteId, estado: 'cancelada', limit: 1, page: 1 }),
    ]);

    ordenesStats.value = {
      pendientes: pendientes.total,
      enProceso: enProceso.total,
      completadas: completadas.total,
      canceladas: canceladas.total,
    };
  } catch (err) {
    console.error('Error al cargar estadísticas de órdenes:', err);
    ordenesStats.value = null;
  } finally {
    isLoadingOrdenesStats.value = false;
  }
};

// Cargar cliente al montar el componente
onMounted(async () => {
  const clienteId = route.params.id as string;
  if (clienteId) {
    try {
      await obtenerCliente(clienteId);
      await Promise.all([
        cargarUsuarios(clienteId),
        cargarOrdenesStats(clienteId),
      ]);
    } catch (err) {
      // El error ya se maneja en el store
      console.error('Error al cargar cliente:', err);
    }
  }
});

// Limpiar detalle al desmontar
onUnmounted(() => {
  limpiarClienteDetalle();
});
</script>
