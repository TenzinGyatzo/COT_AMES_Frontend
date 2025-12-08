<template>
  <span :class="badgeClasses">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  getEstadoBadgeClass,
  getEstadoLabel,
} from '../../constants/badgeStyles';

interface Props {
  estado?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  estado: '',
  label: '',
  size: 'md',
});

const label = computed(() => {
  if (props.label) return props.label;
  if (props.estado) return getEstadoLabel(props.estado);
  return '';
});

const badgeClasses = computed(() => {
  const base = 'inline-flex rounded-full font-medium';
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  const estadoClass = props.estado
    ? getEstadoBadgeClass(props.estado)
    : 'bg-gray-100 text-gray-800';
  return `${base} ${sizeClasses[props.size]} ${estadoClass}`;
});
</script>
