<template>
  <div class="max-w-6xl mx-auto p-5">
    <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
      Crear Cotización para Cliente No Registrado
    </h1>

    <!-- Sección de selección de sede -->
    <div class="mb-8">
      <label for="sede" class="block text-sm font-medium text-gray-700 mb-2">
        Seleccionar Sede *
      </label>
      <select
        id="sede"
        v-model="sedeSeleccionada"
        @change="onSedeChange"
        :disabled="isLoading"
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500 disabled:opacity-50"
      >
        <option value="">Seleccione una sede</option>
        <option v-for="sede in sedes" :key="sede._id" :value="sede._id">
          {{ sede.ciudad }}
        </option>
      </select>
      <p v-if="isLoading" class="mt-2 text-sm text-gray-500">
        Cargando sedes...
      </p>
    </div>

    <!-- Tabla de servicios seleccionados -->
    <div class="mb-8">
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <!-- Contenedor con scroll horizontal para dispositivos pequeños -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  #
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div class="w-32">Servicio</div>
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[251px]"
                >
                  Descripción
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  Unidades
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="serviciosSeleccionados.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  <div
                    class="flex flex-col items-center transition-colors duration-200"
                    :class="sedeSeleccionada ? 'cursor-pointer hover:text-medical-blue-600' : 'opacity-70'"
                    @click="abrirModal"
                  >
                    <svg
                      class="w-12 h-12 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p class="text-sm">No hay servicios seleccionados</p>
                    <p class="text-xs text-gray-400 mt-1">
                      Haz clic en "Agregar" para seleccionar servicios
                    </p>
                  </div>
                </td>
              </tr>
              <ServiceItemRow
                v-else
                v-for="(servicio, index) in serviciosSeleccionados"
                :key="servicio._id"
                :servicio="servicio"
                :index="index + 1"
                :cantidad="cantidadesPorServicio[servicio._id || ''] || 0"
                @update:cantidad="
                  (value) => actualizarCantidad(servicio._id || '', value)
                "
                @remove="eliminarServicio(servicio._id || '')"
              />
            </tbody>
          </table>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button
          @click="abrirModal"
          :disabled="!sedeSeleccionada || isLoadingServicios"
          class="px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Agregar Servicios
        </button>
      </div>
    </div>

    <!-- Sección de datos del cliente NO REGISTRADO -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">
        Datos del Cliente
      </h2>
      <div class="bg-white shadow-md rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="empresa"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre Empresa *
            </label>
            <input
              id="empresa"
              v-model="datosCliente.empresa"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="Nombre de la empresa"
            />
          </div>
          <div>
            <label
              for="nombreContacto"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Contacto *
            </label>
            <input
              id="nombreContacto"
              v-model="datosCliente.nombreContacto"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label
              for="correo"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico (opcional)
            </label>
            <input
              id="correo"
              v-model="datosCliente.correo"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label
              for="telefono"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Teléfono (opcional)
            </label>
            <input
              id="telefono"
              v-model="datosCliente.telefono"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="+52 662 123 4567"
            />
          </div>
        </div>
        
        <!-- Checkbox para enviar email -->
        <div class="mt-4">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="enviarEmail"
              :disabled="!datosCliente.correo"
              class="w-4 h-4 text-medical-blue-600 border-gray-300 rounded focus:ring-medical-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span class="ml-2 text-sm text-gray-700">
              Enviar cotización por correo electrónico
            </span>
          </label>
          <p v-if="!datosCliente.correo" class="mt-1 text-xs text-gray-500">
            Ingresa un correo electrónico para habilitar esta opción
          </p>
        </div>

        <!-- <p class="mt-3 text-sm text-gray-500">
          Esta cotización será para un cliente no registrado en el sistema.
        </p> -->
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>

    <!-- Botón Generar Cotización -->
    <div class="flex flex-col items-center">
      <button
        @click="crearCotizacion"
        :disabled="isCreating"
        class="px-8 py-3 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isCreating">Generando cotización...</span>
        <span v-else>Generar Cotización</span>
      </button>
      <!-- Mensaje de validación -->
      <div
        v-if="mensajeValidacion"
        class="mt-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm max-w-md text-center"
      >
        {{ mensajeValidacion }}
      </div>
    </div>

    <!-- Modal de selección de servicios -->
    <ModalSeleccionServicios
      :is-open="modalAbierto"
      :servicios="serviciosDisponibles"
      :is-loading="isLoadingServicios"
      :servicios-ya-seleccionados="cantidadesPorServicio"
      @close="cerrarModalServicios"
      @agregar-servicios="agregarServiciosSeleccionados"
    />

    <!-- Modal de éxito -->
    <ModalCotizacionCreada
      :cotizacion="ultimaRespuesta"
      @close="cerrarModal"
      @ver-cotizaciones="verCotizaciones"
      @ver-detalles="verDetalles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import ServiceItemRow from '../../components/common/ServiceItemRow.vue';
import ModalSeleccionServicios from '../../components/common/ModalSeleccionServicios.vue';
import ModalCotizacionCreada from '../../components/common/ModalCotizacionCreada.vue';
import { useCotizador } from '../../composables/useCotizador';
import type { Servicio } from '../../types/backend';
import { createAdminCotizacion } from '../../services/admin-api.service';

const router = useRouter();

const {
  sedes,
  servicios,
  selectedSedeId,
  cantidadesPorServicio,
  isLoading,
  error,
  cargarSedes,
  cargarServiciosPorSede,
  actualizarCantidad,
} = useCotizador();

// Servicios disponibles (para el modal) y servicios seleccionados (para la tabla)
const serviciosDisponibles = ref<Servicio[]>([]);
const isLoadingServicios = ref(false);
const modalAbierto = ref(false);

const sedeSeleccionada = ref<string>('');
const datosCliente = ref({
  empresa: '',
  nombreContacto: '',
  correo: '',
  telefono: '',
});
const enviarEmail = ref(false);
const mensajeValidacion = ref<string>('');
const isCreating = ref(false);
const ultimaRespuesta = ref<any>(null);

// Cargar sedes al montar el componente
onMounted(async () => {
  try {
    await cargarSedes();
  } catch (err) {
    // El error ya está manejado en el store/composable
  }
});

// Sincronizar sedeSeleccionada con el store
watch(sedeSeleccionada, (newValue) => {
  if (newValue) {
    selectedSedeId.value = newValue;
  }
});

// Desactivar checkbox de email si no hay correo
watch(() => datosCliente.value.correo, (newCorreo) => {
  if (!newCorreo) {
    enviarEmail.value = false;
  }
});

// Servicios seleccionados (solo los que tienen cantidad > 0)
const serviciosSeleccionados = computed(() => {
  return serviciosDisponibles.value.filter(
    (servicio) => (cantidadesPorServicio.value[servicio._id || ''] || 0) > 0,
  );
});

// Limpiar mensaje de validación cuando se seleccionen servicios
watch(
  cantidadesPorServicio,
  () => {
    const tieneServicios = Object.values(cantidadesPorServicio.value).some(
      (cantidad) => cantidad > 0,
    );
    if (tieneServicios && mensajeValidacion.value.includes('servicio')) {
      mensajeValidacion.value = '';
    }
  },
  { deep: true },
);

// Cargar servicios cuando cambia la sede seleccionada
const onSedeChange = async () => {
  mensajeValidacion.value = '';
  // Limpiar servicios seleccionados al cambiar de sede
  Object.keys(cantidadesPorServicio.value).forEach((key) => {
    actualizarCantidad(key, 0);
  });

  if (sedeSeleccionada.value) {
    await cargarServiciosDisponibles();
  } else {
    serviciosDisponibles.value = [];
  }
};

// Cargar servicios disponibles para el modal
const cargarServiciosDisponibles = async () => {
  if (!sedeSeleccionada.value) return;

  isLoadingServicios.value = true;
  try {
    await cargarServiciosPorSede(sedeSeleccionada.value);
    serviciosDisponibles.value = [...servicios.value];
  } catch (err) {
    serviciosDisponibles.value = [];
  } finally {
    isLoadingServicios.value = false;
  }
};

// Abrir modal de selección de servicios
const abrirModal = async () => {
  if (!sedeSeleccionada.value) return;

  if (serviciosDisponibles.value.length === 0 && !isLoadingServicios.value) {
    await cargarServiciosDisponibles();
  }

  modalAbierto.value = true;
};

// Cerrar modal de selección de servicios
const cerrarModalServicios = () => {
  modalAbierto.value = false;
};

// Agregar servicios seleccionados desde el modal
const agregarServiciosSeleccionados = (
  serviciosParaAgregar: Record<string, number>,
) => {
  Object.entries(serviciosParaAgregar).forEach(([servicioId, cantidad]) => {
    actualizarCantidad(servicioId, cantidad);
  });
};

// Eliminar servicio de la lista
const eliminarServicio = (servicioId: string) => {
  actualizarCantidad(servicioId, 0);
};

// Crear cotización admin
const crearCotizacion = async () => {
  mensajeValidacion.value = '';

  // Validación de campos requeridos
  if (!datosCliente.value.empresa.trim()) {
    mensajeValidacion.value = 'Por favor, ingresa el nombre de la empresa';
    return;
  }

  if (!datosCliente.value.nombreContacto.trim()) {
    mensajeValidacion.value = 'Por favor, ingresa el nombre del contacto';
    return;
  }

  if (!sedeSeleccionada.value) {
    mensajeValidacion.value = 'Por favor, selecciona una sede';
    return;
  }

  const tieneServicios = Object.values(cantidadesPorServicio.value).some(
    (cantidad) => cantidad > 0,
  );

  if (!tieneServicios) {
    mensajeValidacion.value =
      'Por favor, selecciona al menos un servicio para continuar';
    return;
  }

  // Preparar payload
  const items = Object.entries(cantidadesPorServicio.value)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([servicioId, cantidad]) => ({
      servicioId,
      cantidad,
    }));

  const payload = {
    sedeId: sedeSeleccionada.value,
    nombreEmpresa: datosCliente.value.empresa,
    nombreContacto: datosCliente.value.nombreContacto,
    emailContacto: datosCliente.value.correo || undefined,
    telefonoContacto: datosCliente.value.telefono || undefined,
    items,
    enviarEmail: enviarEmail.value,
  };

  isCreating.value = true;
  try {
    const response = await createAdminCotizacion(payload);
    ultimaRespuesta.value = response;
    mensajeValidacion.value = '';
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      'Error al crear la cotización. Por favor intenta de nuevo.';
  } finally {
    isCreating.value = false;
  }
};

// Cerrar modal de éxito
const cerrarModal = () => {
  ultimaRespuesta.value = null;
};

// Ver lista de cotizaciones
const verCotizaciones = () => {
  ultimaRespuesta.value = null;
  router.push({ name: 'admin-cotizaciones' });
};

// Ver detalles de la cotización creada
const verDetalles = () => {
  if (!ultimaRespuesta.value) {
    console.error('No hay respuesta de cotización disponible');
    return;
  }

  const cotizacionId = ultimaRespuesta.value._id || ultimaRespuesta.value.id;

  if (cotizacionId) {
    ultimaRespuesta.value = null;
    router.push({
      name: 'admin-cotizacion-detalle',
      params: { id: String(cotizacionId) },
    });
  } else {
    console.error(
      'No se encontró el ID de la cotización en la respuesta:',
      ultimaRespuesta.value,
    );
    alert(
      'Error: No se pudo obtener el ID de la cotización. Por favor, intente ver las cotizaciones desde el listado.',
    );
  }
};
</script>
