<template>
  <div class="flex items-center space-x-2">
    <button
      type="button"
      @click="decrement"
      class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
      :disabled="modelValue <= 0"
    >
      <span class="text-gray-600">-</span>
    </button>
    <input
      type="number"
      :value="modelValue"
      @input="handleInput"
      min="0"
      class="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
    />
    <button
      type="button"
      @click="increment"
      class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
    >
      <span class="text-gray-600">+</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Componente autocontenido y reutilizable
// Maneja la selección de cantidad con botones + y -

const props = defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const increment = () => {
  emit('update:modelValue', props.modelValue + 1);
};

const decrement = () => {
  if (props.modelValue > 0) {
    emit('update:modelValue', props.modelValue - 1);
  }
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = parseInt(target.value) || 0;
  emit('update:modelValue', Math.max(0, value));
};
</script>
