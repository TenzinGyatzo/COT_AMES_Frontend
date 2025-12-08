<template>
  <div :class="containerClass">
    <BaseSpinner :size="size" :color="color" />
    <p v-if="message" :class="messageClass">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseSpinner from './BaseSpinner.vue';

interface Props {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'gray';
  fullHeight?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  size: 'md',
  color: 'gray',
  fullHeight: false,
});

const containerClass = computed(() => {
  const base = 'flex flex-col items-center justify-center';
  const height = props.fullHeight ? 'min-h-[400px]' : 'py-8';
  return `${base} ${height}`;
});

const messageClass = computed(() => {
  const base = 'mt-4 text-center';
  const colorMap = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    gray: 'text-gray-500',
  };
  return `${base} ${colorMap[props.color]}`;
});
</script>
