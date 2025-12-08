<template>
  <button type="button" :class="buttonClass" @click="handleClick">
    <svg
      class="w-4 h-4 mr-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 19l-7-7 7-7"
      />
    </svg>
    <slot>{{ defaultText }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  to?: string;
  defaultText?: string;
  variant?: 'default' | 'subtle';
}

const props = withDefaults(defineProps<Props>(), {
  to: undefined,
  defaultText: 'Volver',
  variant: 'default',
});

const router = useRouter();

const buttonClass = computed(() => {
  const base = 'inline-flex items-center text-sm transition-colors mb-4';
  const variants = {
    default: 'text-gray-600 hover:text-gray-900',
    subtle: 'text-gray-500 hover:text-gray-700',
  };
  return `${base} ${variants[props.variant]}`;
});

function handleClick() {
  if (props.to) {
    router.push(props.to);
  } else {
    router.back();
  }
}
</script>
