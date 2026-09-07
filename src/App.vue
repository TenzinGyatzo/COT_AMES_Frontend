<template>
  <router-view :inert="showIdleLock" />
  <ConfidentialityAgreementModal v-if="showConfidentialityModal" />
  <SessionIdleLockModal v-if="showIdleLock" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SessionIdleLockModal from './components/auth/SessionIdleLockModal.vue';
import ConfidentialityAgreementModal from './components/confidentiality/ConfidentialityAgreementModal.vue';
import { useSessionIdleLock } from './composables/useSessionIdleLock';
import { useAuthStore } from './store/auth';

const authStore = useAuthStore();
const route = useRoute();
useSessionIdleLock();

const showConfidentialityModal = computed(
  () =>
    authStore.isAuthenticated &&
    authStore.showConfidentialityGate &&
    route.matched.some((record) => record.meta?.requiresAuth),
);

const showIdleLock = computed(
  () =>
    authStore.isAuthenticated &&
    authStore.sessionLocked &&
    route.matched.some((record) => record.meta?.requiresAuth),
);
</script>
