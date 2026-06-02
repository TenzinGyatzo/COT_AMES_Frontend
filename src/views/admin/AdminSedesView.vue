<template>
  <div>
    <div class="flex justify-between items-center mb-6 gap-3">
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Gestión de Sedes</h1>
      <button
        @click="abrirModalCrear"
        class="px-3 sm:px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0"
      >
        <span>+ Agregar</span>
        <span class="hidden sm:inline"> Sede</span>
      </button>
    </div>

    <!-- Mensaje de carga -->
    <div v-if="isLoading" class="bg-white shadow-md rounded-lg p-8 text-center">
      <p class="text-gray-500">Cargando sedes...</p>
    </div>

    <!-- Mensaje de error -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Tabla de sedes -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="overflow-y-auto max-h-[calc(100vh-115px)]">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                #
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Clave
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Ciudad
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Estado Activo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="sedes.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                No hay sedes registradas
              </td>
            </tr>
            <tr v-for="(sede, index) in sedes" :key="sede._id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ sede.clave || '-' }}
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ sede.ciudad }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ sede.estado || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    sede.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ sede.activo ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
              >
                <button
                  @click="abrirModalEditar(sede)"
                  class="text-medical-blue-600 hover:text-medical-blue-900"
                >
                  Editar
                </button>
                <button
                  @click="toggleActivo(sede)"
                  :class="[
                    'transition-colors',
                    sede.activo
                      ? 'text-red-600 hover:text-red-900'
                      : 'text-green-600 hover:text-green-900',
                  ]"
                >
                  {{ sede.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para crear/editar sede -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @pointerdown="onBackdropPointerDown"
      @pointerup="onBackdropPointerUp"
      @pointercancel="onBackdropPointerCancel"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ modoEdicion ? 'Editar Sede' : 'Nueva Sede' }}
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

          <form @submit.prevent="guardarSede" class="space-y-4">
            <!-- Clave -->
            <div>
              <label
                for="clave"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Clave
              </label>
              <input
                id="clave"
                v-model="formulario.clave"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="Ej: CAB"
                :disabled="isSubmitting"
              />
            </div>

            <!-- Ciudad -->
            <div>
              <label
                for="ciudad"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Ciudad <span class="text-red-500">*</span>
              </label>
              <input
                id="ciudad"
                v-model="formulario.ciudad"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="Ej: Caborca"
                :disabled="isSubmitting"
              />
            </div>

            <!-- Estado -->
            <div>
              <label
                for="estado"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Estado
              </label>
              <select
                id="estado"
                v-model="formulario.estado"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmitting"
              >
                <option :value="undefined">Seleccione un estado</option>
                <option
                  v-for="(estado, key) in estadosMexico"
                  :key="key"
                  :value="estado"
                >
                  {{ estado }}
                </option>
              </select>
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
                Sede activa
              </label>
            </div>

            <!-- Mensaje de error -->
            <div
              v-if="errorFormulario"
              class="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p class="text-red-800 text-sm">{{ errorFormulario }}</p>
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="cerrarModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                :disabled="isSubmitting"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Guardando...</span>
                <span v-else
                  >{{ modoEdicion ? 'Actualizar' : 'Guardar' }} Sede</span
                >
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para activar/desactivar sede -->
    <ConfirmationModal
      :show="mostrarConfirmacion"
      :title="confirmacionTitulo"
      :message="confirmacionMensaje"
      :type="confirmacionTipo"
      confirm-text="Aceptar"
      cancel-text="Cancelar"
      @confirm="ejecutarToggleActivo"
      @cancel="mostrarConfirmacion = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getSedes,
  createSede,
  updateSede,
  toggleSedeActivo,
  type CreateSedePayload,
  type UpdateSedePayload,
} from '../../services/admin-api.service';
import type { Sede } from '../../types/backend';
import { EstadoMexico } from '../../types/estado-mexico.enum';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import { useModalDismiss } from '../../composables/useModalDismiss';

const sedes = ref<Sede[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Estados de México para el select
const estadosMexico = Object.values(EstadoMexico);

// Estado del modal
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const sedeEditando = ref<Sede | null>(null);
const isSubmitting = ref(false);
const errorFormulario = ref<string | null>(null);

// Formulario para crear/editar sede
const formulario = ref<CreateSedePayload>({
  clave: '',
  ciudad: '',
  estado: undefined,
  activo: true,
});

// Estado para el modal de confirmación
const mostrarConfirmacion = ref(false);
const confirmacionTitulo = ref('');
const confirmacionMensaje = ref('');
const confirmacionTipo = ref<'info' | 'warning' | 'danger'>('info');
const sedeSeleccionada = ref<Sede | null>(null);

/**
 * Carga todas las sedes
 */
const cargarSedes = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const sedesData = await getSedes();
    sedes.value = sedesData;
  } catch (err: any) {
    console.error('Error al cargar sedes:', err);
    error.value =
      err.response?.data?.message || 'No fue posible cargar las sedes';
  } finally {
    isLoading.value = false;
  }
};

/**
 * Abre el modal para crear una nueva sede
 */
const abrirModalCrear = () => {
  modoEdicion.value = false;
  sedeEditando.value = null;
  formulario.value = {
    clave: '',
    ciudad: '',
    estado: undefined,
    activo: true,
  };
  errorFormulario.value = null;
  mostrarModal.value = true;
};

/**
 * Abre el modal para editar una sede existente
 */
const abrirModalEditar = (sede: Sede) => {
  modoEdicion.value = true;
  sedeEditando.value = sede;
  formulario.value = {
    clave: sede.clave || '',
    ciudad: sede.ciudad,
    estado: sede.estado,
    activo: sede.activo !== undefined ? sede.activo : true,
  };
  errorFormulario.value = null;
  mostrarModal.value = true;
};

/**
 * Cierra el modal y resetea el formulario
 */
const cerrarModal = () => {
  mostrarModal.value = false;
  modoEdicion.value = false;
  sedeEditando.value = null;
  errorFormulario.value = null;
  formulario.value = {
    clave: '',
    ciudad: '',
    estado: undefined,
    activo: true,
  };
};

const {
  onBackdropPointerDown,
  onBackdropPointerUp,
  onBackdropPointerCancel,
} = useModalDismiss(cerrarModal, mostrarModal);

/**
 * Guarda una sede (crear o actualizar)
 */
const guardarSede = async () => {
  isSubmitting.value = true;
  errorFormulario.value = null;

  try {
    if (modoEdicion.value && sedeEditando.value?._id) {
      // Actualizar sede existente
      const payload: UpdateSedePayload = {
        clave: formulario.value.clave || undefined,
        ciudad: formulario.value.ciudad,
        estado: formulario.value.estado || undefined,
        activo: formulario.value.activo,
      };
      await updateSede(sedeEditando.value._id, payload);
    } else {
      // Crear nueva sede
      await createSede(formulario.value);
    }
    cerrarModal();
    // Recargar sedes después de guardar
    await cargarSedes();
  } catch (err: any) {
    console.error('Error al guardar sede:', err);
    errorFormulario.value =
      err.response?.data?.message || 'No fue posible guardar la sede';
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Activa o desactiva una sede
 */
const toggleActivo = async (sede: Sede) => {
  if (!sede._id) return;

  sedeSeleccionada.value = sede;
  confirmacionTitulo.value = sede.activo ? 'Desactivar sede' : 'Activar sede';
  confirmacionMensaje.value = `¿Estás seguro de que deseas ${sede.activo ? 'desactivar' : 'activar'} la sede "${sede.ciudad}"?`;
  confirmacionTipo.value = sede.activo ? 'warning' : 'info';
  mostrarConfirmacion.value = true;
};

const ejecutarToggleActivo = async () => {
  if (!sedeSeleccionada.value?._id) return;

  mostrarConfirmacion.value = false;
  try {
    await toggleSedeActivo(sedeSeleccionada.value._id);
    // Recargar sedes después de cambiar el estado
    await cargarSedes();
  } catch (err: any) {
    console.error('Error al cambiar estado de la sede:', err);
    alert(
      err.response?.data?.message ||
        'No fue posible cambiar el estado de la sede',
    );
  } finally {
    sedeSeleccionada.value = null;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarSedes();
});
</script>
