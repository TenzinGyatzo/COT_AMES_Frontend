<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[buttonClasses, props.customClass]"
    @click="$emit('click', $event)"
  >
    <BaseSpinner
      v-if="loading"
      :size="spinnerSize"
      color="white"
      class="mr-2"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseSpinner from './BaseSpinner.vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'secondaryOutline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  type: 'button',
  customClass: '',
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const baseClasses =
  'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  secondaryOutline:
    'bg-white text-gray-700 border border-gray-400 hover:bg-gray-200 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const spinnerSize = computed(() => {
  const sizeMap = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  };
  return sizeMap[props.size];
});

const buttonClasses = computed(() => {
  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ');
});
</script>
