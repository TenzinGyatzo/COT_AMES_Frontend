<template>
  <div
    class="absolute inset-0 z-10 flex items-center justify-center bg-white/60"
    aria-busy="true"
    aria-live="polite"
  >
    <BaseSpinner size="md" color="gray" />
  </div>
</template>

<script setup lang="ts">
import BaseSpinner from './BaseSpinner.vue';
</script>
