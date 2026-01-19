<template>
  <div class="max-w-6xl mx-auto p-5 animate-in fade-in duration-700">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">
        Generador de Cotizaciones
      </h1>
      <p class="mt-2 text-gray-500 text-lg">Selecciona los servicios que deseas para obtener tu presupuesto oficial.</p>
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
            <p class="text-sm text-gray-500">¿En qué ubicación requieres los servicios médicos?</p>
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
          Cargando opciones...
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
        titulo="Servicios a Cotizar"
        subtitulo="Agrega los estudios o servicios médicos a cotizar."
        texto-vacio="Aún no has agregado servicios"
        ayuda-vacia="Tu selección aparecerá aquí para que la revises antes de enviar."
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
      <!-- PASO 3: Confirmación de Datos -->
      <div class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">Verificar Información</h2>
            <p class="text-sm text-gray-500">Datos registrados en tu perfil para el documento PDF.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Empresa</span>
            <p class="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm overflow-y-auto">{{ datosCliente.empresa || 'N/A' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Nombre Solicitante</span>
            <p class="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm overflow-y-auto">{{ datosCliente.nombreContacto || 'N/A' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Correo</span>
            <p class="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm overflow-y-auto">{{ datosCliente.correo || 'N/A' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Teléfono</span>
            <p class="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm overflow-y-auto">{{ datosCliente.telefono || 'N/A' }}</p>
          </div>
        </div>
        
        <div class="mt-4 flex items-start gap-3 px-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-medical-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs text-gray-500">
            ¿Estos datos no son correctos? Puedes actualizarlos en 
            <router-link :to="{ name: 'cliente-perfil' }" class="text-medical-blue-600 font-bold hover:underline">Mi Perfil</router-link>.
          </p>
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
          @click="solicitarCotizacion"
          :disabled="isLoading"
          class="group relative px-12 py-4 bg-medical-blue-600 text-white rounded-2xl hover:bg-medical-blue-700 active:scale-95 transition-all font-extrabold text-xl shadow-2xl shadow-medical-blue-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span v-if="isLoading" class="flex items-center gap-3">
            <svg class="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Enviando...
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
      @close="cerrarModal"
      @ver-cotizaciones="verCotizaciones"
      @ver-detalles="verDetalles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import ModalSeleccionServicios from '../components/common/ModalSeleccionServicios.vue';
import ModalCotizacionCreada from '../components/common/ModalCotizacionCreada.vue';
import CustomSedeSelect from '../components/common/CustomSedeSelect.vue';
import TablaServiciosCotizador from '../components/cotizador/TablaServiciosCotizador.vue';
import { useCotizador } from '../composables/useCotizador';
import { useClientePerfil } from '../composables/useClientePerfil';
import type { Servicio } from '../types/backend';

// Vista del cotizador: orquesta la lógica usando el composable useCotizador
// Toda la lógica de negocio está en el composable, la vista solo maneja UI
// Esta vista solo es accesible desde rutas autenticadas del portal cliente

const router = useRouter();

const {
  sedes,
  servicios,
  selectedSedeId,
  cantidadesPorServicio,
  isLoading,
  error,
  ultimaRespuesta,
  cargarSedes,
  cargarServiciosPorSede,
  actualizarCantidad,
  enviarCotizacion,
  validarFormulario,
  resetSelection,
} = useCotizador();

// Servicios disponibles (para el modal) y servicios seleccionados (para la tabla)
const serviciosDisponibles = ref<Servicio[]>([]);
const isLoadingServicios = ref(false);
const modalAbierto = ref(false);

const { data: perfilCliente, fetchMiPerfil } = useClientePerfil();

const sedeSeleccionada = ref<string>('');
const datosCliente = ref({
  empresa: '',
  nombreContacto: '',
  correo: '',
  telefono: '',
});
const mensajeValidacion = ref<string>('');

// Cargar sedes y perfil del cliente autenticado
onMounted(async () => {
  try {
    await cargarSedes();

    // Cargar y prellenar datos del cliente desde su perfil
    try {
      await fetchMiPerfil();
      if (perfilCliente.value?.cliente && perfilCliente.value?.usuario) {
        datosCliente.value = {
          empresa: perfilCliente.value.cliente.empresa || '',
          nombreContacto: perfilCliente.value.usuario.nombre || '',
          correo: perfilCliente.value.usuario.email || '',
          telefono: perfilCliente.value.usuario.telefono || '',
        };
      }
    } catch (err) {
      // Si falla cargar el perfil, continuar sin prellenar
    }
  } catch (err) {
    // El error ya está manejado en el store/composable
  }
});

// Sincronizar sedeSeleccionada con el store
watch(sedeSeleccionada, (newValue) => {
  selectedSedeId.value = newValue || null;
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

// Cargar servicios cuando cambia la sede seleccionada (solo para el modal, no se muestran automáticamente)
const onSedeChange = async () => {
  mensajeValidacion.value = ''; // Limpiar mensaje al cambiar de sede
  // Limpiar servicios seleccionados al cambiar de sede
  Object.keys(cantidadesPorServicio.value).forEach((key) => {
    actualizarCantidad(key, 0);
  });

  if (sedeSeleccionada.value) {
    // Cargar servicios disponibles para el modal
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
    // Copiar servicios al array local para el modal
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

  // Si no hay servicios cargados, cargarlos ahora
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
    // Reemplazar la cantidad (el usuario puede ajustar desde la tabla principal)
    actualizarCantidad(servicioId, cantidad);
  });
};

// Eliminar servicio de la lista
const eliminarServicio = (servicioId: string) => {
  actualizarCantidad(servicioId, 0);
};

// Enviar cotización al backend
const solicitarCotizacion = async () => {
  // Limpiar mensaje de validación anterior
  mensajeValidacion.value = '';

  // Validar formulario usando el composable
  if (!validarFormulario(datosCliente.value)) {
    // Verificar qué falta específicamente para dar feedback más preciso
    const tieneServicios = Object.values(cantidadesPorServicio.value).some(
      (cantidad) => cantidad > 0,
    );

    if (!tieneServicios) {
      mensajeValidacion.value =
        'Por favor, selecciona al menos un servicio para continuar';
    } else if (!selectedSedeId.value) {
      mensajeValidacion.value = 'Por favor, selecciona una sede';
    } else if (!datosCliente.value.correo) {
      mensajeValidacion.value = 'Por favor, completa tu correo electrónico';
    }
    return;
  }

  try {
    await enviarCotizacion(datosCliente.value);
    // El modal se mostrará automáticamente con ultimaRespuesta
    mensajeValidacion.value = ''; // Limpiar mensaje si todo está bien
  } catch (err) {
    // El error ya está manejado en el store/composable
  }
};

// Cerrar modal de éxito y limpiar selección
const cerrarModal = () => {
  ultimaRespuesta.value = null;
  resetSelection();
  
  // Limpiar datos locales de selección
  sedeSeleccionada.value = '';
  serviciosDisponibles.value = [];
  mensajeValidacion.value = '';
  
  // No limpiamos datosCliente porque vienen del perfil del usuario
};

// Ver lista de cotizaciones
const verCotizaciones = () => {
  const needsReset = !!ultimaRespuesta.value;
  ultimaRespuesta.value = null;
  
  if (needsReset) {
    cerrarModal();
  }
  
  router.push({ name: 'cliente-cotizaciones' });
};

// Ver detalles de la cotización creada
const verDetalles = () => {
  if (!ultimaRespuesta.value) {
    console.error('No hay respuesta de cotización disponible');
    return;
  }

  // El backend puede devolver _id o id, manejar ambos casos
  const cotizacionId = ultimaRespuesta.value._id || ultimaRespuesta.value.id;

  if (cotizacionId) {
    // Resetear antes de navegar
    const id = String(cotizacionId);
    cerrarModal();
    
    router.push({
      name: 'cliente-cotizacion-detalle',
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
