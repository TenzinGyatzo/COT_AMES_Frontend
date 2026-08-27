<template>
  <div
    class="fixed inset-0 z-[110] overflow-y-auto"
    aria-labelledby="confidentiality-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm"
        aria-hidden="true"
      ></div>

      <span
        class="hidden sm:inline-block sm:h-screen sm:align-middle"
        aria-hidden="true"
        >&#8203;</span
      >

      <div
        class="relative inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle"
        @pointerdown.stop
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h2
            id="confidentiality-title"
            class="text-xl font-bold leading-6 text-gray-900"
          >
            Acuerdo de confidencialidad
          </h2>
          <p
            v-if="authStore.ndaCurrentVersion"
            class="mt-1 text-xs text-gray-500"
          >
            Versión {{ authStore.ndaCurrentVersion }}
          </p>
          <div
            class="mt-4 max-h-[50vh] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-line"
          >
            {{ authStore.ndaAgreementText }}
          </div>
          <p
            v-if="acceptError || !authStore.ndaAgreementText"
            class="mt-3 text-sm text-red-600"
            role="alert"
          >
            {{
              acceptError ||
              'No se pudo cargar el acuerdo. Reintente o cierre sesión.'
            }}
          </p>
          <label
            class="mt-4 flex items-start gap-3 text-sm text-gray-800 cursor-pointer"
          >
            <input
              v-model="checked"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
              :disabled="accepting || !authStore.ndaAgreementText"
            />
            <span>{{ authStore.ndaFooterConsent }}</span>
          </label>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            class="inline-flex w-full justify-center rounded-xl bg-medical-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-medical-blue-500 sm:ml-3 sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="!checked || accepting || !authStore.ndaAgreementText"
            @click="onAccept"
          >
            {{ accepting ? 'Procesando…' : 'Acepto' }}
          </button>
          <button
            v-if="!authStore.ndaAgreementText"
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto transition-all"
            :disabled="accepting"
            @click="onRetry"
          >
            Reintentar
          </button>
          <button
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all disabled:opacity-60"
            :disabled="accepting"
            @click="onLogout"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';

const authStore = useAuthStore();
const router = useRouter();

const checked = ref(false);
const accepting = ref(false);
const acceptError = ref<string | null>(null);

async function onRetry() {
  acceptError.value = null;
  await authStore.refreshConfidentialityStatus();
}

async function onAccept() {
  if (!checked.value || accepting.value || !authStore.ndaAgreementText) return;
  accepting.value = true;
  acceptError.value = null;
  try {
    await authStore.acceptConfidentialityAgreement();
  } catch {
    acceptError.value =
      'No se pudo registrar la aceptación. Intente de nuevo.';
  } finally {
    accepting.value = false;
  }
}

function onLogout() {
  if (accepting.value) return;
  authStore.logout();
  void router.push({ name: 'admin-login' });
}
</script>
