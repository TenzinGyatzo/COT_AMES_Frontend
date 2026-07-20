<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Guest: menos padding (evita doble marco con la vista pública). -->
    <main
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      :class="isGuestPublic ? 'py-4 sm:py-6' : 'py-8'"
    >
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isGuestPublic = computed(
  () => route.name === 'guest-cotizacion-detalle',
);
</script>
