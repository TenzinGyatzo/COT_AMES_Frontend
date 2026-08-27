<template>
  <div
    class="fixed inset-0 z-[110] overflow-y-auto"
    aria-labelledby="confidentiality-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex min-h-screen items-center justify-center px-4 py-8"
    >
      <div
        class="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px]"
        aria-hidden="true"
      ></div>

      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white px-6 py-8 text-center shadow-2xl sm:px-8"
        @pointerdown.stop
      >
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-medical-blue-100"
          aria-hidden="true"
        >
          <svg
            class="h-7 w-7 text-medical-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.75"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
            />
          </svg>
        </div>

        <h2
          id="confidentiality-title"
          class="mt-4 text-xl font-bold leading-snug text-gray-900 sm:text-[1.35rem]"
        >
          Acuerdo de Confidencialidad y Uso de la Información
        </h2>
        <div
          class="mx-auto mt-3 h-1 w-12 rounded-full bg-medical-blue-400"
          aria-hidden="true"
        ></div>

        <p
          v-if="authStore.ndaIntro"
          class="mt-5 text-left text-sm leading-relaxed text-gray-600"
        >
          {{ authStore.ndaIntro }}
        </p>

        <div
          v-if="authStore.ndaSections.length"
          class="mt-4 max-h-[38vh] overflow-y-auto rounded-lg border border-gray-200 bg-white px-4 py-3 text-left"
        >
          <section
            v-for="section in authStore.ndaSections"
            :key="section.title"
            class="mb-4 last:mb-0"
          >
            <h3 class="text-sm font-bold text-gray-900">
              {{ section.title }}
            </h3>
            <p class="mt-1 text-sm leading-relaxed text-gray-700">
              {{ section.body }}
            </p>
          </section>
        </div>
        <div
          v-else-if="authStore.ndaAgreementText"
          class="mt-4 max-h-[38vh] overflow-y-auto rounded-lg border border-gray-200 px-4 py-3 text-left text-sm leading-relaxed text-gray-700 whitespace-pre-line"
        >
          {{ authStore.ndaAgreementText }}
        </div>

        <p
          v-if="authStore.ndaDeclaration"
          class="mt-4 text-left text-sm leading-relaxed text-gray-600"
        >
          {{ authStore.ndaDeclaration }}
        </p>

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
          class="mt-5 flex cursor-pointer items-start gap-3 text-left text-sm text-gray-800"
        >
          <input
            v-model="checked"
            type="checkbox"
            class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
            :disabled="accepting || !authStore.ndaAgreementText"
          />
          <span>{{ authStore.ndaFooterConsent }}</span>
        </label>

        <button
          type="button"
          class="mt-5 inline-flex w-full justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-white"
          :class="
            checked && authStore.ndaAgreementText && !accepting
              ? 'bg-medical-blue-600 hover:bg-medical-blue-500'
              : ''
          "
          :disabled="!checked || accepting || !authStore.ndaAgreementText"
          @click="onAccept"
        >
          {{ accepting ? 'Procesando…' : 'Acepto el Acuerdo' }}
        </button>

        <button
          v-if="!authStore.ndaAgreementText"
          type="button"
          class="mt-3 text-sm text-medical-blue-600 underline hover:text-medical-blue-700 disabled:opacity-60"
          :disabled="accepting"
          @click="onRetry"
        >
          Reintentar
        </button>

        <button
          type="button"
          class="mt-3 block w-full text-sm text-gray-500 underline hover:text-gray-700 disabled:opacity-60"
          :disabled="accepting"
          @click="onLogout"
        >
          Cerrar sesión
        </button>
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
