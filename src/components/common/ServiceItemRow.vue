<template>
  <tr class="border-b border-gray-200 hover:bg-gray-50 align-top">
    <td class="w-10 px-3 py-3 text-sm text-gray-500 text-center align-middle">
      {{ index }}
    </td>
    <td class="w-[14rem] px-3 py-3 text-sm align-top">
      <VerticalCenterTextarea
        :model-value="nombre"
        textarea-class="w-full min-w-0 px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 leading-snug focus:ring-2 focus:ring-medical-blue-400 focus:bg-white outline-none resize-y min-h-[4.5rem]"
        @update:model-value="$emit('update:nombre', $event)"
      />
    </td>
    <td class="px-3 py-3 text-sm align-top">
      <VerticalCenterTextarea
        :model-value="descripcion"
        textarea-class="w-full min-w-0 px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 leading-snug focus:ring-2 focus:ring-medical-blue-400 focus:bg-white outline-none resize-y min-h-[4.5rem]"
        @update:model-value="$emit('update:descripcion', $event)"
      />
    </td>
    <td class="w-24 pl-3 pr-5 py-3 text-sm align-middle">
      <input
        type="number"
        min="0"
        step="0.01"
        :value="precioUnitario"
        class="ml-auto block w-20 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 text-right focus:ring-2 focus:ring-medical-blue-400 focus:bg-white outline-none"
        @input="onPrecioInput"
      />
    </td>
    <td class="w-[8.75rem] pl-4 pr-2 py-3 align-middle">
      <div class="flex justify-center">
        <QuantitySelector
          :model-value="cantidad"
          @update:model-value="handleQuantityChange"
        />
      </div>
    </td>
    <td
      class="w-32 px-3 py-3 text-sm font-semibold text-gray-900 text-right align-middle tabular-nums"
    >
      {{ formatMoney(subtotal) }}
    </td>
    <td class="w-12 px-2 py-3 align-middle">
      <div class="flex justify-center">
        <button
          type="button"
          class="inline-flex items-center justify-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import QuantitySelector from './QuantitySelector.vue';
import VerticalCenterTextarea from './VerticalCenterTextarea.vue';
import { formatMoney } from '../../utils/currency';

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
