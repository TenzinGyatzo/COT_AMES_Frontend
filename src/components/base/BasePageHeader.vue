<template>
  <div :class="headerClass">
    <div>
      <h1 :class="titleClass">
        {{ title }}
      </h1>
      <p v-if="description" :class="descriptionClass">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title: string;
  description?: string;
  align?: 'left' | 'between';
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  align: 'between',
});

const headerClass = computed(() => {
  const base = 'mb-6';
  const alignClasses = {
    left: 'flex flex-col',
    between:
      'flex flex-col md:flex-row md:items-start md:justify-between gap-4',
  };
  return `${base} ${alignClasses[props.align]}`;
});

const titleClass = computed(() => {
  return 'text-2xl font-semibold text-gray-800 mb-2';
});

const descriptionClass = computed(() => {
  return 'text-gray-600 text-sm';
});
</script>
