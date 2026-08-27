<template>
  <div class="flex min-h-screen bg-gray-100">
    <Sidebar />

    <main class="flex-1 overflow-auto md:ml-0">
      <div class="p-4 md:p-8">
        <!-- AC3 / Story 2.2: admin_sistema sin administración activa -->
        <div
          v-if="authStore.canLoadSensitiveData && needsTenantSelection"
          role="status"
          class="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p>
            Seleccione una administración en el pie del menú para operar en esa
            administración.
          </p>
        </div>
        <!-- Remount al cambiar tenant admin → refresca listados (UX EXPERIENCE) -->
        <router-view v-if="authStore.canLoadSensitiveData" :key="viewKey" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Sidebar from '../components/layout/Sidebar.vue';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();

const needsTenantSelection = computed(
  () => authStore.isAdminSistema && !authStore.activeTenantId,
);

const viewKey = computed(() =>
  authStore.isAdminSistema
    ? authStore.activeTenantId || 'admin-no-tenant'
    : 'operativo',
);
</script>
