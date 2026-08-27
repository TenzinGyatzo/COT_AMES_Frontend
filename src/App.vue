<template>
  <router-view />
  <ConfidentialityAgreementModal v-if="showConfidentialityModal" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ConfidentialityAgreementModal from './components/confidentiality/ConfidentialityAgreementModal.vue';
import { useAuthStore } from './store/auth';

const authStore = useAuthStore();
const route = useRoute();

const showConfidentialityModal = computed(
  () =>
    authStore.isAuthenticated &&
    authStore.showConfidentialityGate &&
    route.matched.some((record) => record.meta?.requiresAuth),
);
</script>
