<template>
  <div class="max-w-6xl mx-auto p-5 animate-in fade-in duration-700">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">
        Cotizador
      </h1>
      <p class="mt-2 text-gray-500 text-lg">Envía cotizaciones profesionales a tus clientes en segundos.</p>
    </div>

    <!-- PASO 1: Selección de sede (Con resaltado si está vacío) -->
    <div 
      class="mb-10 transition-all duration-500 transform relative"
      :class="[!sedeSeleccionada ? 'scale-[1.02] z-30' : 'z-10']"
    >
      <div 
        class="bg-white rounded-2xl p-6 shadow-xl border-2 transition-all duration-300"
        :class="[!sedeSeleccionada ? 'border-medical-blue-400 ring-4 ring-medical-blue-50 animate-pulse-subtle' : 'border-transparent shadow-md']"
      >
        <div class="flex items-center gap-3 mb-4">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
            :class="[sedeSeleccionada ? 'bg-green-100 text-green-600' : 'bg-medical-blue-600 text-white']"
          >
            <svg v-if="sedeSeleccionada" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else>1</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">Seleccionar Sede de Atención</h2>
            <p class="text-sm text-gray-500">Define la ubicación donde se realizará el servicio.</p>
          </div>
        </div>

        <CustomSedeSelect
          v-model="sedeSeleccionada"
          :sedes="sedes"
          placeholder="Seleccione una ciudad o sede..."
          :disabled="isLoading"
          @change="onSedeChange"
        />
        
        <p v-if="isLoading" class="mt-3 text-sm text-medical-blue-600 flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Sincronizando sedes...
        </p>
      </div>
    </div>

    <!-- CONTENEDOR BLOQUEADO HASTA SELECCIONAR SEDE -->
    <div 
      class="transition-all duration-700"
      :class="[!sedeSeleccionada ? 'opacity-40 grayscale pointer-events-none blur-[1px]' : 'opacity-100']"
    >
      <!-- PASO 2: Selección de servicios (Extraído a componente) -->
      <TablaServiciosCotizador
        :servicios-seleccionados="serviciosSeleccionados"
        :cantidades-por-servicio="cantidadesPorServicio"
        :sede-seleccionada="sedeSeleccionada"
        :is-loading="isLoadingServicios"
        @abrir-modal="abrirModal"
        @actualizar-cantidad="actualizarCantidad"
        @eliminar-servicio="eliminarServicio"
      />
    </div>

    <!-- PASO 3 y FINALIZAR: Bloqueados hasta agregar al menos 1 servicio -->
    <div 
      class="transition-all duration-700"
      :class="[serviciosSeleccionados.length === 0 ? 'opacity-40 grayscale pointer-events-none blur-[1px]' : 'opacity-100']"
    >
      <!-- PASO 3: Datos del cliente -->
      <div class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
            :class="[datosCliente.empresa && datosCliente.nombreContacto ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500']"
          >
            <svg v-if="datosCliente.empresa && datosCliente.nombreContacto" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else>3</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">Información del Cliente</h2>
            <p class="text-sm text-gray-500">Datos mínimos para generar el documento PDF.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label for="empresa" class="text-sm font-bold text-gray-700 ml-1">Nombre de la Empresa *</label>
            <input
              id="empresa"
              v-model="datosCliente.empresa"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
              placeholder="Ej. Empresa General del Norte"
            />
          </div>
          <div class="space-y-1.5">
            <label for="nombreContacto" class="text-sm font-bold text-gray-700 ml-1">Nombre del Contacto *</label>
            <input
              id="nombreContacto"
              v-model="datosCliente.nombreContacto"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
              placeholder="Ej. Lic. Roberto Gómez"
            />
          </div>
          <div class="space-y-1.5">
            <label for="correo" class="text-sm font-bold text-gray-700 ml-1">Correo Electrónico</label>
            <input
              id="correo"
              v-model="datosCliente.correo"
              type="email"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
              placeholder="correo@empresa.com"
            />
          </div>
          <div class="space-y-1.5">
            <label for="telefono" class="text-sm font-bold text-gray-700 ml-1">Teléfono de Contacto</label>
            <input
              id="telefono"
              v-model="datosCliente.telefono"
              type="tel"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
              placeholder="Ej. 6681702850"
            />
          </div>
        </div>
        
        <!-- Notificación por Email -->
        <div class="mt-8 p-4 bg-medical-blue-50/50 rounded-2xl border border-medical-blue-100">
          <label class="flex items-center cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                v-model="enviarEmail"
                :disabled="!isEmailValid"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-blue-600 disabled:opacity-30"></div>
            </div>
            <div class="ml-4">
              <span class="block text-sm font-bold text-gray-800 group-hover:text-medical-blue-700 transition-colors">
                Enviar cotización por correo
              </span>
              <span v-if="isEmailValid" class="text-xs text-medical-blue-600/70">
                Se enviará una copia al correo: {{ datosCliente.correo }}
              </span>
              <span v-else class="text-xs text-gray-400 italic">
                Requiere un correo electrónico válido para activar esta opción.
              </span>
            </div>
          </label>
        </div>
      </div>

      <!-- FINALIZAR -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">{{ error }}</p>
      </div>

      <div class="flex flex-col items-center">
        <button
          @click="crearCotizacion"
          :disabled="isCreating"
          class="group relative px-12 py-4 bg-medical-blue-600 text-white rounded-2xl hover:bg-medical-blue-700 active:scale-95 transition-all font-extrabold text-xl shadow-2xl shadow-medical-blue-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span v-if="isCreating" class="flex items-center gap-3">
            <svg class="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Procesando...
          </span>
          <span v-else class="flex items-center gap-2">
            Generar Cotización
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
        
        <div v-if="mensajeValidacion" class="mt-4 animate-bounce">
          <div class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200 shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ mensajeValidacion }}
          </div>
        </div>
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
      :mostrar-mensaje-email="true"
      :email-enviado="enviarEmail"
      @close="cerrarModal"
      @ver-cotizaciones="verCotizaciones"
      @ver-detalles="verDetalles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import ModalSeleccionServicios from '../../components/common/ModalSeleccionServicios.vue';
import ModalCotizacionCreada from '../../components/common/ModalCotizacionCreada.vue';
import CustomSedeSelect from '../../components/common/CustomSedeSelect.vue';
import TablaServiciosCotizador from '../../components/cotizador/TablaServiciosCotizador.vue';
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
  resetSelection,
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
  selectedSedeId.value = newValue || null;
});

// Email validation helper
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isEmailValid = computed(() => isValidEmail(datosCliente.value.correo));

// Manejar estado del checkbox de email según la validez del correo
let correoPrevioValido = false;
watch(() => datosCliente.value.correo, (newCorreo) => {
  const esValido = isValidEmail(newCorreo);
  
  // Si pasa de no válido a válido, marcar automáticamente
  if (esValido && !correoPrevioValido) {
    enviarEmail.value = true;
  }
  
  // Si se limpia el correo, desmarcar
  if (!newCorreo) {
    enviarEmail.value = false;
  }
  
  correoPrevioValido = esValido;
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

// Cerrar modal de éxito y limpiar formulario completo
const cerrarModal = () => {
  ultimaRespuesta.value = null;
  
  // 1. Limpiar el store
  resetSelection();
  
  // 2. Limpiar datos locales del cliente
  datosCliente.value = {
    empresa: '',
    nombreContacto: '',
    correo: '',
    telefono: '',
  };
  enviarEmail.value = false;
  mensajeValidacion.value = '';
  
  // 3. Limpiar sede y servicios (esto disparará la limpieza de serviciosSeleccionados)
  sedeSeleccionada.value = '';
  serviciosDisponibles.value = [];
};

// Ver lista de cotizaciones
const verCotizaciones = () => {
  const needsReset = !!ultimaRespuesta.value;
  ultimaRespuesta.value = null;
  
  if (needsReset) {
    cerrarModal();
  }
  
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
    // Resetear antes de navegar
    const id = String(cotizacionId);
    cerrarModal();
    
    router.push({
      name: 'admin-cotizacion-detalle',
      params: { id },
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
