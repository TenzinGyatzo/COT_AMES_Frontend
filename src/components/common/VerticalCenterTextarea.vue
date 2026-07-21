<template>
  <textarea
    ref="textareaRef"
    :value="modelValue"
    rows="3"
    :class="resolvedClass"
    @input="onInput"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { syncTextareaVerticalAlign } from '@/utils/syncTextareaVerticalAlign';

const props = defineProps<{
  modelValue: string;
  textareaClass?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

const defaultClass =
  'w-full min-w-0 px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm leading-snug focus:ring-2 focus:ring-medical-blue-400 focus:bg-white outline-none resize-y min-h-[4.5rem]';

const resolvedClass = computed(() => props.textareaClass || defaultClass);

function refreshAlign() {
  if (textareaRef.value) {
    syncTextareaVerticalAlign(textareaRef.value);
  }
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
  refreshAlign();
}

onMounted(() => {
  void nextTick(() => {
    refreshAlign();
    if (!textareaRef.value || typeof ResizeObserver === 'undefined') return;
    resizeObserver = new ResizeObserver(() => refreshAlign());
    resizeObserver.observe(textareaRef.value);
  });
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

watch(
  () => props.modelValue,
  () => {
    void nextTick(refreshAlign);
  },
);
</script>
