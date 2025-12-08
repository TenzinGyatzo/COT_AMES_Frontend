<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="cerrar"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header del modal -->
      <div
        class="px-6 py-4 border-b border-gray-200 flex justify-between items-center"
      >
        <h3 class="text-xl font-semibold text-gray-900">
          Seleccionar Servicios
        </h3>
        <button
          @click="cerrar"
          class="text-gray-400 hover:text-gray-600 transition-colors"
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
      <div class="px-6 py-4 border-b border-gray-200">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar servicios por nombre..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        />
      </div>

      <!-- Lista de servicios -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <div v-if="isLoading" class="text-center py-8 text-gray-500">
          Cargando servicios...
        </div>
        <div
          v-else-if="serviciosFiltrados.length === 0"
          class="text-center py-8 text-gray-500"
        >
          {{
            busqueda
              ? 'No se encontraron servicios con ese nombre'
              : 'No hay servicios disponibles'
          }}
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="servicio in serviciosFiltrados"
            :key="servicio._id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 mb-1">
                  {{ servicio.nombre }}
                </h4>
                <p
                  v-if="servicio.descripcion"
                  class="text-sm text-gray-600 line-clamp-2"
                >
                  {{ servicio.descripcion }}
                </p>
                <p class="text-sm font-medium text-medical-blue-600 mt-2">
                  ${{
                    servicio.precioUnitario.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                  <span v-if="servicio.moneda" class="text-gray-500">
                    {{ servicio.moneda }}</span
                  >
                </p>
              </div>
              <div class="flex-shrink-0">
                <QuantitySelector
                  :model-value="
                    cantidadesSeleccionadas[servicio._id || ''] || 0
                  "
                  @update:model-value="
                    (value) => actualizarCantidad(servicio._id || '', value)
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con resumen y botones -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ serviciosSeleccionadosCount }}</span>
            servicio(s) seleccionado(s)
          </div>
          <div class="text-sm font-medium text-gray-900">
            Total: ${{
              totalSeleccionado.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })
            }}
          </div>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="cerrar"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="agregarServicios"
            :disabled="serviciosSeleccionadosCount === 0"
            class="px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar Servicios
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
