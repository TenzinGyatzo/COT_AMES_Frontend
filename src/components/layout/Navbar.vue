<template>
  <nav class="bg-white shadow-md relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex-shrink-0">
          <RouterLink
            :to="logoTarget"
            class="text-2xl font-bold text-medical-blue-600"
          >
            <img
              src="../../assets/logos/ames-logo-cuadrado.png"
              alt="AMES"
              class="w-24"
            />
          </RouterLink>
        </div>

        <div class="hidden md:flex items-center gap-3">
          <template v-if="showAuthLinks">
            <RouterLink
              to="/admin/login"
              class="px-3 py-1.5 text-xs font-normal text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            >
              Acceso AMES
            </RouterLink>
          </template>
        </div>

        <div v-if="showAuthLinks" class="md:hidden">
          <RouterLink
            to="/admin/login"
            class="inline-flex items-center px-3 py-1.5 text-xs font-normal text-gray-500 border border-gray-200 rounded-md"
          >
            Acceso AMES
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

/** Sin CTA redundante en auth ni en magic-link guest. */
const HIDE_AUTH_CTA = new Set([
  'admin-login',
  'admin-forgot-password',
  'admin-reset-password',
  'guest-cotizacion-detalle',
]);

const showAuthLinks = computed(
  () => !HIDE_AUTH_CTA.has(String(route.name ?? '')),
);

const isGuest = computed(() => route.name === 'guest-cotizacion-detalle');

const logoTarget = computed(() =>
  isGuest.value ? route.fullPath : '/admin/login',
);
</script>
