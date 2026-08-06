<template>
  <div class="space-y-1.5">
    <label
      :for="inputId"
      class="block text-sm font-bold text-gray-800"
    >
      {{ label }}
    </label>
    <div class="relative">
      <div
        role="group"
        class="flex flex-wrap items-center gap-1.5 min-h-[2.5rem] px-2.5 py-1.5 rounded-xl border bg-white focus-within:ring-2 focus-within:ring-medical-blue-500"
        :class="[variantClass, disabled ? 'opacity-50 pointer-events-none bg-gray-50' : '']"
        :aria-disabled="disabled || undefined"
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
            :disabled="disabled"
            @mousedown.prevent="remove(email)"
          >
            ×
          </button>
        </span>
        <input
          :id="inputId"
          ref="inputRef"
          v-model="draft"
          type="email"
          autocomplete="off"
          class="flex-1 min-w-[8rem] border-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 py-1"
          :placeholder="placeholder"
          :disabled="disabled"
          :aria-invalid="!!errorMsg"
          :aria-describedby="errorMsg ? `${inputId}-error` : undefined"
          :aria-expanded="showSuggestions"
          :aria-controls="showSuggestions ? `${inputId}-suggestions` : undefined"
          aria-autocomplete="list"
          role="combobox"
          @focus="onInputFocus"
          @input="onInputChange"
          @keydown="onKeydown"
          @blur="onInputBlur"
        />
      </div>
      <ul
        v-if="showSuggestions"
        :id="`${inputId}-suggestions`"
        role="listbox"
        class="absolute z-20 left-0 right-0 mt-1 py-1 rounded-lg border border-gray-200 bg-white shadow-md max-h-32 overflow-y-auto"
      >
        <li
          v-for="(email, index) in filteredSuggestions"
          :key="email"
          role="option"
          :aria-selected="index === highlightIndex"
          class="px-3 py-1.5 text-xs cursor-pointer truncate"
          :class="
            index === highlightIndex
              ? 'bg-medical-blue-50 text-medical-blue-800'
              : 'text-gray-700 hover:bg-gray-50'
          "
          @mousedown.prevent="selectSuggestion(email)"
        >
          {{ email }}
        </li>
      </ul>
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
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    label: string;
    inputId: string;
    variant?: 'para' | 'cc';
    placeholder?: string;
    hint?: string;
    disabled?: boolean;
    /** Correos que no deben agregarse aquí (p. ej. ya en la otra lista). */
    exclude?: string[];
    /** Sugerencias para autocompletado (p. ej. correosNotificacion del tenant). */
    suggestions?: string[];
  }>(),
  {
    variant: 'para',
    placeholder: 'correo@empresa.com + Enter',
    hint: '',
    disabled: false,
    exclude: () => [],
    suggestions: () => [],
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const draft = ref('');
const errorMsg = ref('');
const suggestionsOpen = ref(false);
const highlightIndex = ref(-1);
const inputRef = ref<HTMLInputElement | null>(null);
let blurTimer: ReturnType<typeof setTimeout> | null = null;

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

const excludedSet = computed(
  () => new Set([...props.modelValue, ...props.exclude]),
);

const filteredSuggestions = computed(() => {
  const query = draft.value.trim().toLowerCase();
  if (query.length < 1 || !props.suggestions.length) return [];
  return props.suggestions
    .filter(
      (email) =>
        email.toLowerCase().includes(query) && !excludedSet.value.has(email),
    )
    .slice(0, 5);
});

const showSuggestions = computed(
  () =>
    suggestionsOpen.value &&
    !props.disabled &&
    draft.value.trim().length >= 1 &&
    filteredSuggestions.value.length > 0,
);

watch(draft, () => {
  highlightIndex.value =
    filteredSuggestions.value.length > 0 ? 0 : -1;
});

function normalize(email: string) {
  return email.trim().toLowerCase();
}

function closeSuggestions() {
  suggestionsOpen.value = false;
  highlightIndex.value = -1;
}

function onInputFocus() {
  if (props.disabled) return;
  suggestionsOpen.value = true;
}

function onInputChange() {
  if (props.disabled) return;
  suggestionsOpen.value = true;
}

function onInputBlur() {
  if (blurTimer) clearTimeout(blurTimer);
  blurTimer = setTimeout(() => {
    closeSuggestions();
    tryAdd();
  }, 150);
}

function addEmail(email: string): boolean {
  if (props.disabled) return false;
  errorMsg.value = '';
  const normalized = normalize(email);
  if (!isValidEmail(normalized)) {
    errorMsg.value = 'Correo no válido';
    return false;
  }
  if (
    props.modelValue.includes(normalized) ||
    props.exclude.includes(normalized)
  ) {
    errorMsg.value = 'Ese correo ya está en la lista';
    draft.value = '';
    return false;
  }
  if (props.modelValue.length >= 20) {
    errorMsg.value = 'Máximo 20 correos';
    return false;
  }
  emit('update:modelValue', [...props.modelValue, normalized]);
  draft.value = '';
  return true;
}

function tryAdd() {
  const raw = draft.value.trim();
  if (!raw) return;
  if (addEmail(raw)) {
    closeSuggestions();
  }
}

function selectSuggestion(email: string) {
  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }
  if (addEmail(email)) {
    closeSuggestions();
    inputRef.value?.focus();
  }
}

function onKeydown(event: KeyboardEvent) {
  if (showSuggestions.value) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const max = filteredSuggestions.value.length - 1;
      highlightIndex.value = Math.min(highlightIndex.value + 1, max);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightIndex.value = Math.max(highlightIndex.value - 1, 0);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSuggestions();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = filteredSuggestions.value[highlightIndex.value];
      if (selected) {
        selectSuggestion(selected);
      } else {
        tryAdd();
      }
      return;
    }
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    tryAdd();
  }
}

function remove(email: string) {
  if (props.disabled) return;
  errorMsg.value = '';
  emit(
    'update:modelValue',
    props.modelValue.filter((e) => e !== email),
  );
}
</script>
