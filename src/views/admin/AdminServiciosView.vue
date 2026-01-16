<template>
  <div class="px-2 sm:px-0">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
        Lista de Servicios
      </h1>
      <button
        @click="abrirModalCrear"
        class="w-full sm:w-auto px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium"
      >
        + Agregar Servicio
      </button>
    </div>

    <!-- Tabs para ubicaciones -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="flex space-x-8 overflow-x-auto scrollbar-hide">
        <button
          @click="seleccionarSede(null)"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
            sedeSeleccionada === null
              ? 'border-medical-blue-600 text-medical-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          Todas
        </button>
        <button
          v-for="sede in sedes"
          :key="sede._id"
          @click="seleccionarSede(sede._id || '')"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
            sedeSeleccionada === sede._id
              ? 'border-medical-blue-600 text-medical-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          {{ sede.ciudad }}
        </button>
      </nav>
    </div>

    <!-- Mensaje de carga -->
    <div v-if="isLoading" class="bg-white shadow-md rounded-lg p-8 text-center">
      <p class="text-gray-500">Cargando servicios...</p>
    </div>

    <!-- Mensaje de error -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Contenedor de servicios (tabla y tarjetas) -->
    <template v-else>
      <!-- Vista de tabla para pantallas grandes -->
      <div
        class="bg-white shadow-md rounded-lg overflow-hidden hidden md:block"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
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
                  Descripción
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Clave Sede
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Precio Unitario
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="servicios.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                  No hay servicios disponibles
                </td>
              </tr>
              <tr v-for="(servicio, index) in servicios" :key="servicio._id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ index + 1 }}
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                  {{ servicio.nombre }}
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-500 max-w-xs relative group"
                  v-if="servicio.descripcion && servicio.descripcion.length > 0"
                >
                  <div class="truncate">
                    {{ servicio.descripcion }}
                  </div>
                  <!-- Tooltip personalizado -->
                  <div
                    class="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
                  >
                    <div class="whitespace-normal break-words">
                      {{ servicio.descripcion }}
                    </div>
                    <!-- Flecha del tooltip -->
                    <div
                      class="absolute top-full left-4 border-4 border-transparent border-t-gray-900"
                    ></div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs" v-else>
                  <div class="truncate">-</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ obtenerClaveSede(servicio) || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  $ {{ servicio.precioUnitario.toFixed(2) }}
                  {{ servicio.moneda || 'MXN' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      servicio.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ servicio.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                >
                  <button
                    @click="abrirModalEditar(servicio)"
                    class="text-medical-blue-600 hover:text-medical-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    @click="eliminarServicio(servicio)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Vista de tarjetas para pantallas pequeñas -->
      <div class="md:hidden space-y-4">
        <div
          v-if="servicios.length === 0"
          class="bg-white shadow-md rounded-lg p-6 text-center"
        >
          <p class="text-gray-500">No hay servicios disponibles</p>
        </div>
        <div
          v-for="(servicio, index) in servicios"
          :key="servicio._id"
          class="bg-white shadow-md rounded-lg p-4 space-y-3"
        >
          <!-- Encabezado de la tarjeta -->
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-gray-500 font-medium"
                  >#{{ index + 1 }}</span
                >
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    servicio.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ servicio.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ servicio.nombre }}
              </h3>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="font-medium text-gray-700">Clave Sede:</span>
              <span class="ml-1 text-gray-600">{{
                obtenerClaveSede(servicio) || '-'
              }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Precio:</span>
              <span class="ml-1 text-gray-900 font-semibold">
                $ {{ servicio.precioUnitario.toFixed(2) }}
                {{ servicio.moneda || 'MXN' }}
              </span>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex flex-col gap-2 pt-2 border-t border-gray-200">
            <button
              @click="abrirModalEditar(servicio)"
              class="w-full px-4 py-2 bg-medical-blue-50 text-medical-blue-600 rounded-md hover:bg-medical-blue-100 transition-colors font-medium text-sm"
            >
              Editar
            </button>
            <button
              @click="eliminarServicio(servicio)"
              class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal para crear/editar servicio -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cerrarModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="p-4 sm:p-6">
          <div class="flex justify-between items-center mb-4 sm:mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
              {{ modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio' }}
            </h2>
            <button
              @click="cerrarModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
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

          <form @submit.prevent="guardarServicio" class="space-y-4">
            <!-- Opción para crear en todas las sedes (solo al crear) -->
            <div v-if="!modoEdicion" class="flex items-center">
              <input
                id="crearEnTodas"
                v-model="crearEnTodasLasSedes"
                type="checkbox"
                class="h-4 w-4 text-medical-blue-600 focus:ring-medical-blue-500 border-gray-300 rounded"
                :disabled="isSubmitting"
                @change="onCambiarCrearEnTodas"
              />
              <label
                for="crearEnTodas"
                class="ml-2 block text-sm text-gray-700"
              >
                Crear este servicio en todas las sedes
              </label>
            </div>

            <!-- Sede -->
            <div v-if="!crearEnTodasLasSedes || modoEdicion">
              <label
                for="sede"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Sede <span class="text-red-500">*</span>
              </label>
              <select
                id="sede"
                v-model="formulario.sedeId"
                :required="!modoEdicion && !crearEnTodasLasSedes"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmitting || modoEdicion"
              >
                <option value="">Seleccione una sede</option>
                <option v-for="sede in sedes" :key="sede._id" :value="sede._id">
                  {{ sede.ciudad }}
                </option>
              </select>
            </div>

            <!-- Mensaje informativo cuando se crea en todas las sedes -->
            <div
              v-if="crearEnTodasLasSedes && !modoEdicion"
              class="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <p class="text-blue-800 text-sm">
                <strong>Nota:</strong> Este servicio se creará en todas las
                sedes con el precio y estado especificados. Podrás editar el
                precio y estado de cada sede de manera independiente después de
                crearlo.
              </p>
            </div>

            <!-- Nombre -->
            <div>
              <label
                for="nombre"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Servicio <span class="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                v-model="formulario.nombre"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="Ej: Examen Médico Laboral"
                :disabled="isSubmitting"
              />
            </div>

            <!-- Descripción -->
            <div>
              <label
                for="descripcion"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="descripcion"
                v-model="formulario.descripcion"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="Descripción detallada del servicio"
                :disabled="isSubmitting"
              ></textarea>
            </div>

            <!-- Precio Unitario -->
            <div>
              <label
                for="precioUnitario"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Precio Unitario <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center space-x-2">
                <span class="text-gray-500">$</span>
                <input
                  id="precioUnitario"
                  v-model.number="formulario.precioUnitario"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  placeholder="0.00"
                  :disabled="isSubmitting"
                />
                <select
                  v-model="formulario.moneda"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  :disabled="isSubmitting"
                >
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <!-- Estado Activo -->
            <div class="flex items-center">
              <input
                id="activo"
                v-model="formulario.activo"
                type="checkbox"
                class="h-4 w-4 text-medical-blue-600 focus:ring-medical-blue-500 border-gray-300 rounded"
                :disabled="isSubmitting"
              />
              <label for="activo" class="ml-2 block text-sm text-gray-700">
                Servicio activo
              </label>
            </div>

            <!-- Mensaje de error -->
            <div
              v-if="errorCrear"
              class="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p class="text-red-800 text-sm">{{ errorCrear }}</p>
            </div>

            <!-- Botones -->
            <div
              class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4"
            >
              <button
                type="button"
                @click="cerrarModal"
                class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                :disabled="isSubmitting"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="w-full sm:w-auto px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Guardando...</span>
                <span v-else
                  >{{ modoEdicion ? 'Actualizar' : 'Guardar' }} Servicio</span
                >
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar servicio -->
    <ConfirmationModal
      :show="mostrarConfirmEliminar"
      title="Eliminar Servicio"
      :message="mensajeConfirmEliminar"
      type="danger"
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="ejecutarEliminacion"
      @cancel="mostrarConfirmEliminar = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  getServicios,
  createServicio,
  createServicioForAllSedes,
  updateServicio,
  deleteServicio,
  getSedes,
  type CreateServicioPayload,
  type CreateServicioGlobalPayload,
  type UpdateServicioPayload,
} from '../../services/admin-api.service';
import type { Servicio, Sede } from '../../types/backend';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';

const servicios = ref<Servicio[]>([]);
const sedes = ref<Sede[]>([]);
const sedeSeleccionada = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Estado del modal
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const servicioEditando = ref<Servicio | null>(null);
const isSubmitting = ref(false);
const errorCrear = ref<string | null>(null);

const formulario = ref<CreateServicioPayload>({
  sedeId: '',
  nombre: '',
  descripcion: '',
  precioUnitario: 0,
  moneda: 'MXN',
  activo: true,
});

// Estado para el modal de confirmación de eliminación
const mostrarConfirmEliminar = ref(false);
const mensajeConfirmEliminar = ref('');
const servicioParaEliminar = ref<Servicio | null>(null);

// Opción para crear en todas las sedes
const crearEnTodasLasSedes = ref(false);

/**
 * Obtiene la clave de la sede desde el servicio
 */
const obtenerClaveSede = (servicio: Servicio): string | undefined => {
  // Primero intentar usar la clave almacenada directamente en el documento
  if (servicio.claveSede) {
    return servicio.claveSede;
  }
  // Si no está disponible, intentar obtenerla del objeto Sede poblado
  if (typeof servicio.sedeId === 'object' && servicio.sedeId !== null) {
    return servicio.sedeId.clave;
  }
  // Si sedeId es un string, buscar la sede en el array de sedes
  const sede = sedes.value.find((s) => s._id === servicio.sedeId);
  return sede?.clave;
};

/**
 * Carga todas las sedes disponibles
 */
const cargarSedes = async () => {
  try {
    const sedesData = await getSedes();
    sedes.value = sedesData;
  } catch (err: any) {
    console.error('Error al cargar sedes:', err);
    error.value = 'No fue posible cargar las sedes';
  }
};

/**
 * Carga los servicios según la sede seleccionada
 */
const cargarServicios = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const filters: { sedeId?: string; activo?: boolean } = {};

    if (sedeSeleccionada.value) {
      filters.sedeId = sedeSeleccionada.value;
    }

    const serviciosData = await getServicios(filters);
    servicios.value = serviciosData;
  } catch (err: any) {
    console.error('Error al cargar servicios:', err);
    error.value =
      err.response?.data?.message || 'No fue posible cargar los servicios';
  } finally {
    isLoading.value = false;
  }
};

/**
 * Selecciona una sede y recarga los servicios
 */
const seleccionarSede = (sedeId: string | null) => {
  sedeSeleccionada.value = sedeId;
};

/**
 * Maneja el cambio de la opción "crear en todas las sedes"
 */
const onCambiarCrearEnTodas = () => {
  if (crearEnTodasLasSedes.value) {
    formulario.value.sedeId = '';
  }
};

/**
 * Abre el modal para crear una nueva servicio
 */
const abrirModalCrear = () => {
  modoEdicion.value = false;
  servicioEditando.value = null;
  crearEnTodasLasSedes.value = false;
  formulario.value = {
    sedeId: '',
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    moneda: 'MXN',
    activo: true,
  };
  errorCrear.value = null;
  mostrarModal.value = true;
};

/**
 * Abre el modal para editar un servicio existente
 */
const abrirModalEditar = (servicio: Servicio) => {
  modoEdicion.value = true;
  servicioEditando.value = servicio;
  // Obtener el ID de la sede (puede ser string o objeto Sede poblado)
  const sedeId =
    typeof servicio.sedeId === 'string'
      ? servicio.sedeId
      : servicio.sedeId._id || '';

  formulario.value = {
    sedeId,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion || '',
    precioUnitario: servicio.precioUnitario,
    moneda: servicio.moneda || 'MXN',
    activo: servicio.activo !== undefined ? servicio.activo : true,
  };
  errorCrear.value = null;
  mostrarModal.value = true;
};

/**
 * Cierra el modal y resetea el formulario
 */
const cerrarModal = () => {
  mostrarModal.value = false;
  modoEdicion.value = false;
  servicioEditando.value = null;
  crearEnTodasLasSedes.value = false;
  errorCrear.value = null;
  formulario.value = {
    sedeId: '',
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    moneda: 'MXN',
    activo: true,
  };
};

/**
 * Guarda un servicio (crear o actualizar)
 */
const guardarServicio = async () => {
  isSubmitting.value = true;
  errorCrear.value = null;

  try {
    if (modoEdicion.value && servicioEditando.value?._id) {
      // Actualizar servicio existente
      const payload: UpdateServicioPayload = {
        nombre: formulario.value.nombre,
        descripcion: formulario.value.descripcion || undefined,
        precioUnitario: formulario.value.precioUnitario,
        moneda: formulario.value.moneda,
        activo: formulario.value.activo,
      };
      await updateServicio(servicioEditando.value._id, payload);
    } else if (crearEnTodasLasSedes.value) {
      // Crear servicio en todas las sedes
      const payload: CreateServicioGlobalPayload = {
        nombre: formulario.value.nombre,
        descripcion: formulario.value.descripcion || undefined,
        precioUnitario: formulario.value.precioUnitario,
        moneda: formulario.value.moneda,
        activo: formulario.value.activo,
      };
      await createServicioForAllSedes(payload);
    } else {
      // Crear nuevo servicio en una sede específica
      if (!formulario.value.sedeId) {
        errorCrear.value =
          'Debe seleccionar una sede o marcar la opción de crear en todas las sedes';
        isSubmitting.value = false;
        return;
      }
      await createServicio(formulario.value);
    }
    cerrarModal();
    // Recargar servicios después de guardar
    await cargarServicios();
  } catch (err: any) {
    console.error('Error al guardar servicio:', err);
    errorCrear.value =
      err.response?.data?.message || 'No fue posible guardar el servicio';
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Elimina completamente un servicio de la base de datos
 */
const eliminarServicio = (servicio: Servicio) => {
  if (!servicio._id) return;

  servicioParaEliminar.value = servicio;
  mensajeConfirmEliminar.value = `¿Estás seguro de que deseas eliminar permanentemente el servicio "${servicio.nombre}"?\n\nEsta acción no se puede deshacer y el servicio será eliminado completamente de la base de datos.`;
  mostrarConfirmEliminar.value = true;
};

const ejecutarEliminacion = async () => {
  if (!servicioParaEliminar.value?._id) return;

  mostrarConfirmEliminar.value = false;
  try {
    await deleteServicio(servicioParaEliminar.value._id);
    // Recargar servicios después de eliminar
    await cargarServicios();
  } catch (err: any) {
    console.error('Error al eliminar servicio:', err);
    alert(err.response?.data?.message || 'No fue posible eliminar el servicio');
  } finally {
    servicioParaEliminar.value = null;
  }
};

// Cargar datos al montar el componente
onMounted(async () => {
  await cargarSedes();
  await cargarServicios();
});

// Recargar servicios cuando cambia la sede seleccionada
watch(sedeSeleccionada, () => {
  cargarServicios();
});
</script>

<style scoped>
/* Scrollbar más sutil y casi invisible */
.scrollbar-hide::-webkit-scrollbar {
  height: 3px;
}
.scrollbar-hide::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-hide::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
.scrollbar-hide::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Para Firefox */
.scrollbar-hide {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}
</style>
