<template>
  <tr class="border-b border-gray-200 hover:bg-gray-50">
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {{ index }}
    </td>
    <td class="px-6 py-4 text-sm">
      <input
        type="text"
        :value="nombre"
        class="w-full min-w-[8rem] px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-medical-blue-400 focus:bg-white outline-none"
        @input="
          $emit(
            'update:nombre',
            ($event.target as HTMLInputElement).value,
          )
        "
      />
    </td>
    <td class="px-6 py-4 text-sm">
      <textarea
        :value="descripcion"
        rows="2"
        class="w-full min-w-[14rem] px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-medical-blue-400 focus:bg-white outline-none resize-y"
        @input="
          $emit(
            'update:descripcion',
            ($event.target as HTMLTextAreaElement).value,
          )
        "
      />
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm">
      <input
        type="number"
        min="0"
        step="0.01"
        :value="precioUnitario"
        class="w-28 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-medical-blue-400 focus:bg-white outline-none"
        @input="onPrecioInput"
      />
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <QuantitySelector
        :model-value="cantidad"
        @update:model-value="handleQuantityChange"
      />
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
      {{ formatMoney(subtotal) }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <button
        type="button"
        class="text-red-600 hover:text-red-800 transition-colors"
        title="Eliminar servicio"
        @click="handleRemove"
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

defineProps<{
  index: number;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}>();

const emit = defineEmits<{
  'update:nombre': [value: string];
  'update:descripcion': [value: string];
  'update:precioUnitario': [value: number];
  'update:cantidad': [value: number];
  remove: [];
}>();

function formatMoney(n: number): string {
  return n.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

function onPrecioInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  const n = Number(raw);
  emit('update:precioUnitario', Number.isFinite(n) && n >= 0 ? n : 0);
}

const handleQuantityChange = (value: number) => {
  emit('update:cantidad', value);
};

const handleRemove = () => {
  emit('remove');
};
</script>
