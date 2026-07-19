<template>
  <div class="flex min-h-screen bg-gray-100">
    <Sidebar />

    <main class="flex-1 overflow-auto md:ml-0">
      <div class="p-4 md:p-8">
        <!-- Remount al cambiar tenant admin → refresca listados (UX EXPERIENCE) -->
        <router-view :key="viewKey" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Sidebar from '../components/layout/Sidebar.vue';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();

const viewKey = computed(() =>
  authStore.isAdminSistema
    ? authStore.activeTenantId || 'admin-no-tenant'
    : 'operativo',
);
</script>
