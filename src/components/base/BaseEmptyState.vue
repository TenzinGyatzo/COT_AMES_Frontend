<template>
  <div :class="containerClass">
    <div v-if="icon" :class="iconContainerClass">
      <component :is="icon" :class="iconClass" />
    </div>
    <h3 v-if="title" :class="titleClass">
      {{ title }}
    </h3>
    <p v-if="description" :class="descriptionClass">
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="mt-6">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  description?: string;
  icon?: any;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  icon: null,
  size: 'md',
  fullHeight: false,
});

const containerClass = computed(() => {
  const base = 'flex flex-col items-center justify-center text-center';
  const height = props.fullHeight ? 'min-h-[400px]' : 'py-12';
  return `${base} ${height}`;
});

const iconContainerClass = computed(() => {
  const sizeMap = {
    sm: 'mb-4',
    md: 'mb-6',
    lg: 'mb-8',
  };
  return sizeMap[props.size];
});

const iconClass = computed(() => {
  const sizeMap = {
    sm: 'h-12 w-12 text-gray-400',
    md: 'h-16 w-16 text-gray-400',
    lg: 'h-20 w-20 text-gray-400',
  };
  return sizeMap[props.size];
});

const titleClass = computed(() => {
  const sizeMap = {
    sm: 'text-base font-medium text-gray-700 mb-2',
    md: 'text-lg font-semibold text-gray-800 mb-2',
    lg: 'text-xl font-semibold text-gray-800 mb-3',
  };
  return sizeMap[props.size];
});

const descriptionClass = computed(() => {
  const sizeMap = {
    sm: 'text-sm text-gray-500',
    md: 'text-sm text-gray-500 max-w-md',
    lg: 'text-base text-gray-500 max-w-lg',
  };
  return sizeMap[props.size];
});
</script>
