<template>
  <div class="space-y-1.5">
    <label
      :for="inputId"
      class="block text-sm font-bold text-gray-800"
    >
      {{ label }}
    </label>
    <div
      class="flex flex-wrap items-center gap-1.5 min-h-[2.5rem] px-2.5 py-1.5 rounded-xl border bg-white focus-within:ring-2 focus-within:ring-medical-blue-500"
      :class="variantClass"
    >
      <span
        v-for="email in modelValue"
        :key="email"
        class="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-lg text-xs font-medium max-w-full"
        :class="chipClass"
      >
        <span class="truncate">{{ email }}</span>
        <button
          type="button"
          class="shrink-0 p-0.5 rounded hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-medical-blue-500"
          :aria-label="`Quitar ${email} de ${label}`"
          @mousedown.prevent="remove(email)"
        >
          ×
        </button>
      </span>
      <input
        :id="inputId"
        v-model="draft"
        type="email"
        autocomplete="email"
        class="flex-1 min-w-[8rem] border-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 py-1"
        :placeholder="placeholder"
        :aria-invalid="!!errorMsg"
        :aria-describedby="errorMsg ? `${inputId}-error` : undefined"
        @keydown.enter.prevent="tryAdd"
        @blur="tryAdd"
      />
    </div>
    <p
      v-if="errorMsg"
      :id="`${inputId}-error`"
      class="text-xs text-red-600"
      role="alert"
    >
      {{ errorMsg }}
    </p>
    <p v-else-if="hint" class="text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    label: string;
    inputId: string;
    variant?: 'para' | 'cc';
    placeholder?: string;
    hint?: string;
    /** Correos que no deben agregarse aquí (p. ej. ya en la otra lista). */
    exclude?: string[];
  }>(),
  {
    variant: 'para',
    placeholder: 'correo@empresa.com + Enter',
    hint: '',
    exclude: () => [],
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const draft = ref('');
const errorMsg = ref('');

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const variantClass = computed(() =>
  props.variant === 'para'
    ? 'border-medical-blue-200'
    : 'border-gray-200',
);

const chipClass = computed(() =>
  props.variant === 'para'
    ? 'bg-medical-blue-50 text-medical-blue-800 border border-medical-blue-100'
    : 'bg-gray-100 text-gray-700 border border-gray-200',
);

function normalize(email: string) {
  return email.trim().toLowerCase();
}

function tryAdd() {
  errorMsg.value = '';
  const raw = draft.value.trim();
  if (!raw) return;
  const email = normalize(raw);
  if (!isValidEmail(email)) {
    errorMsg.value = 'Correo no válido';
    return;
  }
  if (props.modelValue.includes(email) || props.exclude.includes(email)) {
    errorMsg.value = 'Ese correo ya está en la lista';
    draft.value = '';
    return;
  }
  if (props.modelValue.length >= 20) {
    errorMsg.value = 'Máximo 20 correos';
    return;
  }
  emit('update:modelValue', [...props.modelValue, email]);
  draft.value = '';
}

function remove(email: string) {
  errorMsg.value = '';
  emit(
    'update:modelValue',
    props.modelValue.filter((e) => e !== email),
  );
}
</script>
