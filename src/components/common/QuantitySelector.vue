<template>
  <div class="inline-flex items-center gap-1">
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
      :value="draft"
      min="0"
      :class="inputClass"
      @input="handleInput"
      @focus="onFocus"
      @blur="commitDraft"
      @keydown.enter="commitDraft"
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
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    invalid?: boolean;
  }>(),
  {
    invalid: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const draft = ref(String(props.modelValue));
const isFocused = ref(false);

watch(
  () => props.modelValue,
  (value) => {
    if (!isFocused.value) {
      draft.value = String(value);
    }
  },
);

const inputClass = computed(() => {
  const base =
    'w-16 px-2 py-1 text-center border rounded-md focus:outline-none focus:ring-2';
  if (props.invalid) {
    return `${base} border-amber-400 bg-amber-50 focus:ring-amber-400`;
  }
  return `${base} border-gray-300 focus:ring-medical-blue-500`;
});

const increment = () => {
  isFocused.value = false;
  const next = props.modelValue + 1;
  draft.value = String(next);
  emit('update:modelValue', next);
};

const decrement = () => {
  if (props.modelValue > 0) {
    isFocused.value = false;
    const next = props.modelValue - 1;
    draft.value = String(next);
    emit('update:modelValue', next);
  }
};

const onFocus = () => {
  isFocused.value = true;
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  draft.value = target.value;
  if (target.value === '') return;
  const value = parseInt(target.value, 10);
  if (!Number.isNaN(value)) {
    emit('update:modelValue', Math.max(0, value));
  }
};

const commitDraft = () => {
  isFocused.value = false;
  if (draft.value === '') {
    draft.value = '0';
    emit('update:modelValue', 0);
    return;
  }
  const value = parseInt(draft.value, 10);
  const committed = Number.isNaN(value) ? 0 : Math.max(0, value);
  draft.value = String(committed);
  emit('update:modelValue', committed);
};
</script>
