<template>
  <label
    class="inline-flex items-center gap-2.5 select-none group"
    :class="
      disabled
        ? 'cursor-not-allowed opacity-60'
        : 'cursor-pointer'
    "
  >
    <div class="relative shrink-0">
      <input
        type="checkbox"
        class="sr-only peer"
        :checked="modelValue"
        :disabled="disabled"
        :id="id"
        @change="onChange"
      />
      <div
        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-medical-blue-500 peer-focus:ring-offset-1 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-blue-600"
        aria-hidden="true"
      />
    </div>
    <span
      class="text-sm text-gray-700 transition-colors"
      :class="{ 'group-hover:text-gray-900': !disabled }"
    >
      <slot>Ver inactivos</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';

defineProps<{
  modelValue: boolean;
  id?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [];
}>();

async function onChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  emit('update:modelValue', checked);
  // Esperar a que el v-model del padre se actualice antes de recargar listados
  await nextTick();
  emit('change');
}
</script>
