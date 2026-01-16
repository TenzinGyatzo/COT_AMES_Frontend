<template>
  <tr class="border-b border-gray-200 hover:bg-gray-50">
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {{ index }}
    </td>
    <td class="px-6 py-4 text-sm font-medium text-gray-900">
      <div class="w-32 break-words">{{ servicio.nombre }}</div>
    </td>
    <td
      class="px-6 py-4 text-sm text-gray-500 relative group"
      v-if="servicio.descripcion && servicio.descripcion.length > 0"
    >
      <div> <!-- Opcionalmente se puede agregar la clase truncate aquí -->
        {{ servicio.descripcion }}
      </div>
      <!-- Tooltip personalizado 
       <div
        class="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
      >
        <div class="whitespace-normal break-words">
          {{ servicio.descripcion }}
        </div>
        
        <div
          class="absolute top-full left-4 border-4 border-transparent border-t-gray-900"
        ></div> 
      </div> 
      -->
    </td>
    <td class="px-6 py-4 text-sm text-gray-500" v-else>
      <div class="truncate">-</div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <QuantitySelector
        :model-value="cantidad"
        @update:model-value="handleQuantityChange"
      />
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <button
        @click="handleRemove"
        class="text-red-600 hover:text-red-800 transition-colors"
        title="Eliminar servicio"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import QuantitySelector from './QuantitySelector.vue';

// Componente atómico con una sola responsabilidad:
// Mostrar un servicio y permitir ajustar cantidad

interface Servicio {
  nombre: string;
  descripcion?: string;
}

defineProps<{
  servicio: Servicio;
  index: number;
  cantidad: number;
}>();

const emit = defineEmits<{
  'update:cantidad': [value: number];
  remove: [];
}>();

const handleQuantityChange = (value: number) => {
  emit('update:cantidad', value);
};

const handleRemove = () => {
  emit('remove');
};
</script>
