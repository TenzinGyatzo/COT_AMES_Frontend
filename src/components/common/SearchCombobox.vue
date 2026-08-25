<template>
  <div
    ref="rootRef"
    class="relative min-w-0"
    @keydown="onRootKeydown"
    @focusout="onFocusOut"
  >
    <label
      :for="inputId"
      :class="
        hideLabel
          ? 'sr-only'
          : 'block text-sm font-medium text-gray-600 mb-1.5'
      "
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        :value="inputDisplay"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="open && !disabled"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendantId"
        :aria-disabled="disabled || undefined"
        :disabled="disabled"
        :placeholder="effectivePlaceholder"
        class="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        @focus="onFocus"
        @input="onInput"
        @keydown="onInputKeydown"
      />
      <button
        v-if="modelValue && !disabled"
        type="button"
        tabindex="-1"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue-400"
        :aria-label="clearAriaLabel"
        @mousedown.prevent="clearSelection"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>

    <div
      v-if="open && !disabled"
      :id="listboxId"
      role="listbox"
      :aria-label="label"
      class="absolute z-30 left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden max-h-[min(16rem,50dvh)] flex flex-col"
    >
      <ul
        ref="listRef"
        class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        <li
          v-if="filtered.length === 0"
          :id="`${inputId}-empty`"
          class="px-3 py-2.5 text-sm text-gray-500"
          role="status"
        >
          {{ emptyMessage }}
        </li>
        <li
          v-for="(item, index) in filtered"
          :id="optionId(index)"
          :key="item.id"
          role="option"
          :aria-selected="item.id === modelValue"
          class="px-3 py-2 cursor-pointer"
          :class="
            index === highlightIndex
              ? 'bg-medical-blue-50 text-medical-blue-800'
              : 'text-gray-700 hover:bg-gray-50'
          "
          @mouseenter="highlightIndex = index"
          @mousedown.prevent="selectItem(item)"
        >
          <div class="text-sm font-medium truncate">{{ item.primary }}</div>
          <div
            v-if="item.secondary"
            class="text-xs text-gray-500 truncate"
          >
            {{ item.secondary }}
          </div>
        </li>
      </ul>
      <div
        v-if="actionLabel"
        :id="actionOptionId"
        role="option"
        tabindex="-1"
        :aria-selected="highlightIndex === actionIndex"
        class="shrink-0 w-full text-left px-3 py-2.5 text-sm font-medium border-t border-gray-100 cursor-pointer"
        :class="
          highlightIndex === actionIndex
            ? 'bg-medical-blue-50 text-medical-blue-800'
            : 'text-medical-blue-700 hover:bg-gray-50'
        "
        @mouseenter="highlightIndex = actionIndex"
        @mousedown.prevent="emitAction"
      >
        {{ actionLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { filterBySearch } from '../../utils/searchNormalize';

export interface SearchComboboxItem {
  id: string;
  primary: string;
  secondary?: string;
  searchFields: Array<string | undefined | null>;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    items: SearchComboboxItem[];
    label: string;
    inputId: string;
    placeholder: string;
    disabled?: boolean;
    disabledPlaceholder?: string;
    emptyNoItems: string;
    emptyNoMatch: string;
    actionLabel?: string;
    clearAriaLabel?: string;
    hideLabel?: boolean;
    loading?: boolean;
  }>(),
  {
    disabled: false,
    disabledPlaceholder: '',
    actionLabel: '',
    clearAriaLabel: 'Quitar selección',
    hideLabel: false,
    loading: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  action: [];
}>();

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const open = ref(false);
const query = ref('');
const highlightIndex = ref(0);
const typing = ref(false);
let blurTimer: ReturnType<typeof setTimeout> | null = null;

const listboxId = computed(() => `${props.inputId}-listbox`);
const actionOptionId = computed(() => `${props.inputId}-action`);

const selectedItem = computed(
  () => props.items.find((item) => item.id === props.modelValue) ?? null,
);

const effectivePlaceholder = computed(() =>
  props.disabled && props.disabledPlaceholder
    ? props.disabledPlaceholder
    : props.placeholder,
);

const inputDisplay = computed(() => {
  if (props.disabled) return '';
  if (typing.value) return query.value;
  return selectedItem.value?.primary ?? '';
});

const filtered = computed(() =>
  filterBySearch(props.items, query.value, (item) => item.searchFields),
);

const emptyMessage = computed(() => {
  if (props.loading) return 'Cargando…';
  return props.items.length === 0 ? props.emptyNoItems : props.emptyNoMatch;
});

const actionIndex = computed(() =>
  props.actionLabel ? filtered.value.length : -1,
);

const maxIndex = computed(() => {
  if (props.actionLabel) return filtered.value.length;
  return Math.max(filtered.value.length - 1, 0);
});

function optionId(index: number): string {
  return `${props.inputId}-opt-${index}`;
}

const activeDescendantId = computed(() => {
  if (!open.value || props.disabled) return undefined;
  if (props.actionLabel && highlightIndex.value === actionIndex.value) {
    return actionOptionId.value;
  }
  if (filtered.value[highlightIndex.value]) {
    return optionId(highlightIndex.value);
  }
  return undefined;
});

function resetHighlight() {
  highlightIndex.value = filtered.value.length
    ? 0
    : props.actionLabel
      ? actionIndex.value
      : 0;
}

function closeMenu() {
  open.value = false;
  typing.value = false;
  query.value = selectedItem.value?.primary ?? '';
  highlightIndex.value = 0;
}

function openMenu() {
  if (props.disabled) return;
  open.value = true;
  if (!typing.value) {
    query.value = '';
  }
  resetHighlight();
}

function onFocus() {
  if (props.disabled) return;
  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }
  typing.value = false;
  query.value = '';
  openMenu();
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null;
  if (next && rootRef.value?.contains(next)) return;
  blurTimer = setTimeout(() => {
    closeMenu();
  }, 120);
}

function onInput(event: Event) {
  if (props.disabled) return;
  const value = (event.target as HTMLInputElement).value;
  typing.value = true;
  query.value = value;
  open.value = true;
  resetHighlight();
}

function selectItem(item: SearchComboboxItem) {
  emit('update:modelValue', item.id);
  query.value = item.primary;
  typing.value = false;
  open.value = false;
  highlightIndex.value = 0;
}

function clearSelection() {
  emit('update:modelValue', '');
  query.value = '';
  typing.value = true;
  open.value = true;
  resetHighlight();
  void nextTick(() => inputRef.value?.focus());
}

function emitAction() {
  closeMenu();
  emit('action');
}

function moveHighlight(delta: number) {
  const max = maxIndex.value;
  if (max < 0) return;
  const next = highlightIndex.value + delta;
  if (next < 0) {
    highlightIndex.value = max;
  } else if (next > max) {
    highlightIndex.value = 0;
  } else {
    highlightIndex.value = next;
  }
}

function activateHighlighted() {
  if (props.actionLabel && highlightIndex.value === actionIndex.value) {
    emitAction();
    return;
  }
  const item = filtered.value[highlightIndex.value];
  if (item) selectItem(item);
}

function onInputKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (!open.value) {
      openMenu();
      return;
    }
    moveHighlight(1);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (!open.value) {
      openMenu();
      return;
    }
    moveHighlight(-1);
    return;
  }
  if (event.key === 'Home' && open.value && !typing.value) {
    event.preventDefault();
    highlightIndex.value = 0;
    return;
  }
  if (event.key === 'End' && open.value && !typing.value) {
    event.preventDefault();
    highlightIndex.value = Math.max(maxIndex.value, 0);
    return;
  }
  if (event.key === 'Enter') {
    if (!open.value) return;
    event.preventDefault();
    activateHighlighted();
    return;
  }
  if (event.key === 'Escape') {
    if (!open.value) return;
    event.preventDefault();
    closeMenu();
  }
}

function onRootKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault();
    closeMenu();
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!rootRef.value?.contains(event.target as Node)) {
    closeMenu();
  }
}

function scrollOptionIntoList(id: string) {
  const list = listRef.value;
  const el = document.getElementById(id);
  if (!list || !el || !list.contains(el)) return;
  const top = el.offsetTop;
  const bottom = top + el.offsetHeight;
  if (top < list.scrollTop) {
    list.scrollTop = top;
  } else if (bottom > list.scrollTop + list.clientHeight) {
    list.scrollTop = bottom - list.clientHeight;
  }
}

watch(
  () => props.modelValue,
  () => {
    if (!open.value) {
      query.value = selectedItem.value?.primary ?? '';
      typing.value = false;
    }
  },
);

watch(highlightIndex, (index) => {
  if (!open.value) return;
  const id =
    props.actionLabel && index === actionIndex.value
      ? actionOptionId.value
      : filtered.value[index]
        ? optionId(index)
        : '';
  if (!id) return;
  void nextTick(() => scrollOptionIntoList(id));
});

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) closeMenu();
  },
);

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', onDocumentPointerDown);
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
  if (blurTimer) clearTimeout(blurTimer);
});
</script>
