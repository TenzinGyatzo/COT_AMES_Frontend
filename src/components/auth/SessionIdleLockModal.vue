<template>
  <div
    class="fixed inset-0 z-[120]"
    role="dialog"
    aria-modal="true"
    aria-labelledby="session-idle-lock-title"
  >
    <div class="fixed inset-0 bg-gray-900" aria-hidden="true"></div>

    <div class="relative flex min-h-screen items-center justify-center px-4 py-8">
      <div
        class="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl"
        @pointerdown.stop
        @keydown.stop
      >
        <h2
          id="session-idle-lock-title"
          class="text-xl font-bold text-gray-900"
        >
          Sesión bloqueada por inactividad
        </h2>
        <p class="mt-3 text-sm leading-relaxed text-gray-600">
          Por seguridad, la sesión se bloqueó. Ingresa tu contraseña para
          continuar.
        </p>

        <p
          v-if="authStore.user"
          class="mt-4 text-sm text-gray-800"
        >
          <span class="font-medium">{{ authStore.user.nombre }}</span>
          <span class="block text-gray-500">{{ authStore.user.email }}</span>
        </p>

        <form class="mt-6 space-y-4" @submit.prevent="handleUnlock">
          <div>
            <label
              for="session-idle-password"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <div class="relative">
              <input
                id="session-idle-password"
                ref="passwordInput"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                autofocus
                class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabindex="-1"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting || !password"
            class="w-full rounded-md bg-medical-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-medical-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="isSubmitting">Verificando...</span>
            <span v-else>Continuar</span>
          </button>
        </form>

        <div
          v-if="error"
          class="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {{ error }}
        </div>

        <button
          type="button"
          class="mt-6 w-full text-sm text-gray-600 underline hover:text-gray-800"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { extractAuthErrorMessage, useAuthStore } from '../../store/auth';

const authStore = useAuthStore();
const router = useRouter();

const password = ref('');
const showPassword = ref(false);
const isSubmitting = ref(false);
const error = ref('');
const passwordInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  void nextTick(() => passwordInput.value?.focus());
});

async function handleUnlock(): Promise<void> {
  error.value = '';
  if (!password.value) {
    error.value = 'Ingresa tu contraseña';
    return;
  }

  isSubmitting.value = true;
  try {
    await authStore.unlockWithPassword(password.value);
    password.value = '';
  } catch (err) {
    error.value = extractAuthErrorMessage(err);
  } finally {
    isSubmitting.value = false;
    password.value = '';
  }
}

function handleLogout(): void {
  password.value = '';
  authStore.logout();
  void router.push('/admin/login');
}
</script>
