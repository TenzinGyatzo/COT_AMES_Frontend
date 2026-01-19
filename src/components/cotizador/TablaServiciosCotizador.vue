<template>
  <div class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
    <!-- Encabezado de la sección -->
    <div class="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors shrink-0"
          :class="[serviciosSeleccionados.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500']"
        >
          <svg v-if="serviciosSeleccionados.length > 0" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span v-else>2</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">{{ titulo }}</h2>
          <p class="text-sm text-gray-500">{{ subtitulo }}</p>
        </div>
      </div>
      <button
        @click="$emit('abrir-modal')"
        :disabled="!sedeSeleccionada || isLoading"
        class="w-full md:w-auto px-5 py-2.5 bg-medical-green-500 text-white rounded-xl hover:bg-medical-green-600 active:scale-95 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-medical-green-100 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Agregar Servicios
      </button>
    </div>

    <!-- VISTA MOBILE: Tarjetas (Visible solo en < md) -->
    <div class="md:hidden">
      <div v-if="serviciosSeleccionados.length === 0" class="p-10 text-center">
        <div class="flex flex-col items-center opacity-40">
          <svg class="w-16 h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-gray-500 font-medium">{{ textoVacio }}</p>
          <p class="text-xs text-gray-400">{{ ayudaVacia }}</p>
        </div>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div 
          v-for="(servicio, index) in serviciosSeleccionados" 
          :key="servicio._id"
          class="p-4 bg-white hover:bg-gray-50/50 transition-colors"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-start gap-3">
              <span class="text-xs font-bold text-gray-300 mt-1">#{{ index + 1 }}</span>
              <div>
                <h4 class="font-bold text-gray-900 leading-tight mb-1">{{ servicio.nombre }}</h4>
                <p v-if="servicio.descripcion" class="text-sm text-gray-500 line-clamp-7">
                  {{ servicio.descripcion }}
                </p>
              </div>
            </div>
            <button
              @click="$emit('eliminar-servicio', servicio._id || '')"
              class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <div class="flex items-center justify-between pt-3 border-t border-gray-50">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Unidades</span>
            <QuantitySelector
              :model-value="cantidadesPorServicio[servicio._id || ''] || 0"
              @update:model-value="(value) => $emit('actualizar-cantidad', servicio._id || '', value)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- VISTA DESKTOP: Tabla (Visible solo en >= md) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50/50">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">#</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Servicio</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Unidades</th>
            <th class="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="serviciosSeleccionados.length === 0">
            <td colspan="5" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center opacity-40">
                <svg class="w-16 h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-gray-500 font-medium">{{ textoVacio }}</p>
                <p class="text-xs text-gray-400">{{ ayudaVacia }}</p>
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
            @update:cantidad="(value) => $emit('actualizar-cantidad', servicio._id || '', value)"
            @remove="$emit('eliminar-servicio', servicio._id || '')"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import ServiceItemRow from '../common/ServiceItemRow.vue';
import QuantitySelector from '../common/QuantitySelector.vue';
import type { Servicio } from '@/types/backend';

interface Props {
  serviciosSeleccionados: Servicio[];
  cantidadesPorServicio: Record<string, number>;
  sedeSeleccionada: string;
  isLoading?: boolean;
  titulo?: string;
  subtitulo?: string;
  textoVacio?: string;
  ayudaVacia?: string;
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  titulo: 'Servicios a Cotizar',
  subtitulo: 'Agrega los estudios o servicios médicos solicitados.',
  textoVacio: 'Lista de servicios vacía',
  ayudaVacia: 'Haz clic en el botón verde para comenzar a añadir items.',
});

defineEmits<{
  (e: 'abrir-modal'): void;
  (e: 'actualizar-cantidad', id: string, cantidad: number): void;
  (e: 'eliminar-servicio', id: string): void;
}>();
</script>

