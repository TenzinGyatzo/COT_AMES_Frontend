<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300"
    @click.self="cerrar"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
      @click.stop
    >
      <!-- Header del modal -->
      <div
        class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white"
      >
        <div>
          <h3 class="text-xl font-bold text-gray-900">
            Catálogo de Servicios
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">Explora y añade servicios a tu cotización</p>
        </div>
        <button
          @click="cerrar"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          aria-label="Cerrar"
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

      <!-- Buscador -->
      <div class="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
        <div class="relative">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por nombre (ej. Análisis, Rayos X...)"
            class="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all shadow-sm"
          />
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Lista de servicios -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
          <svg class="animate-spin h-8 w-8 text-medical-blue-500" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span class="font-medium">Cargando catálogo...</span>
        </div>
        
        <div
          v-else-if="serviciosFiltrados.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <div class="bg-gray-100 p-4 rounded-full mb-4">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p class="text-gray-900 font-bold">No se encontraron resultados</p>
          <p class="text-sm text-gray-500 max-w-xs mx-auto mt-1">
            Intenta con otros términos o revisa que la palabra esté bien escrita.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="servicio in serviciosFiltrados"
            :key="servicio._id"
            class="group border border-gray-100 bg-white rounded-2xl p-4 hover:border-medical-blue-200 hover:shadow-md transition-all duration-300"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-bold text-gray-800 leading-tight group-hover:text-medical-blue-700 transition-colors">
                    {{ servicio.nombre }}
                  </h4>
                </div>
                <p
                  v-if="servicio.descripcion"
                  class="text-sm text-gray-500 line-clamp-2 sm:line-clamp-1 mb-2"
                >
                  {{ servicio.descripcion }}
                </p>
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-100">
                    ${{ servicio.precioUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} {{ servicio.moneda }}
                  </span>
                </div>
              </div>
              
              <div class="flex-shrink-0 flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                <span class="sm:hidden text-xs font-bold text-gray-400 uppercase tracking-widest">Cantidad</span>
                <QuantitySelector
                  :model-value="cantidadesSeleccionadas[servicio._id || ''] || 0"
                  @update:model-value="(value) => actualizarCantidad(servicio._id || '', value)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con resumen y botones -->
      <div class="px-6 py-5 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
        <div class="flex flex-row items-center justify-between gap-2 mb-6">
          <div class="text-[11px] sm:text-sm font-semibold text-gray-500 tracking-widest leading-tight">
            {{ serviciosSeleccionadosCount }} servicio(s) seleccionado(s)
          </div>
          <div class="text-base sm:text-2xl font-bold text-medical-blue-700 whitespace-nowrap">
            Total: ${{ totalSeleccionado.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}
          </div>
        </div>
        
        <div class="flex flex-row gap-3 justify-end">
          <button
            @click="cerrar"
            class="hidden sm:block px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-95 transition-all font-bold text-sm shadow-sm"
          >
            Cancelar
          </button>
          <button
            @click="agregarServicios"
            :disabled="serviciosSeleccionadosCount === 0"
            class="w-full sm:w-auto px-8 py-3 bg-medical-green-500 text-white rounded-xl hover:bg-medical-green-600 active:scale-95 transition-all font-bold text-base shadow-lg shadow-medical-green-100 disabled:opacity-50 disabled:pointer-events-none"
          >
            Añadir Servicios
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import QuantitySelector from './QuantitySelector.vue';
import type { Servicio } from '../../types/backend';

interface Props {
  isOpen: boolean;
  servicios: Servicio[];
  isLoading?: boolean;
  serviciosYaSeleccionados: Record<string, number>;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits<{
  close: [];
  'agregar-servicios': [servicios: Record<string, number>];
}>();

const busqueda = ref('');
const cantidadesSeleccionadas = ref<Record<string, number>>({});

// Inicializar cantidades con los servicios ya seleccionados
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      cantidadesSeleccionadas.value = { ...props.serviciosYaSeleccionados };
    }
  },
);

// Filtrar servicios por búsqueda
const serviciosFiltrados = computed(() => {
  if (!busqueda.value.trim()) {
    return props.servicios;
  }
  const termino = busqueda.value.toLowerCase();
  return props.servicios.filter((servicio) =>
    servicio.nombre.toLowerCase().includes(termino),
  );
});

// Contar servicios seleccionados
const serviciosSeleccionadosCount = computed(() => {
  return Object.values(cantidadesSeleccionadas.value).filter(
    (cantidad) => cantidad > 0,
  ).length;
});

// Calcular total de servicios seleccionados
const totalSeleccionado = computed(() => {
  return Object.entries(cantidadesSeleccionadas.value).reduce(
    (total, [servicioId, cantidad]) => {
      if (cantidad > 0) {
        const servicio = props.servicios.find((s) => s._id === servicioId);
        if (servicio) {
          return total + servicio.precioUnitario * cantidad;
        }
      }
      return total;
    },
    0,
  );
});

const actualizarCantidad = (servicioId: string, cantidad: number) => {
  if (cantidad <= 0) {
    delete cantidadesSeleccionadas.value[servicioId];
  } else {
    cantidadesSeleccionadas.value[servicioId] = cantidad;
  }
};

const agregarServicios = () => {
  // Filtrar solo servicios con cantidad > 0
  const serviciosParaAgregar: Record<string, number> = {};
  Object.entries(cantidadesSeleccionadas.value).forEach(
    ([servicioId, cantidad]) => {
      if (cantidad > 0) {
        serviciosParaAgregar[servicioId] = cantidad;
      }
    },
  );

  emit('agregar-servicios', serviciosParaAgregar);
  cerrar();
};

const cerrar = () => {
  busqueda.value = '';
  emit('close');
};
</script>
