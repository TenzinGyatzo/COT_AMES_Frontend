<template>
  <div class="max-w-md mx-auto mt-16">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2 text-center">
        Restablecer contraseña
      </h2>
      <p class="text-sm text-gray-600 mb-6 text-center">
        Ingresa tu nueva contraseña
      </p>

      <form v-if="!passwordReset" @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Nueva contraseña
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="8"
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabindex="-1"
            >
              <svg
                v-if="showPassword"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="8"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            placeholder="Confirma tu contraseña"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading || !isTokenValid"
          class="w-full px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Restableciendo...</span>
          <span v-else>Restablecer contraseña</span>
        </button>
      </form>

      <div
        v-if="passwordReset"
        class="text-center space-y-4"
      >
        <div class="flex justify-center">
          <svg
            class="h-16 w-16 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="text-gray-700 font-medium">
          ¡Contraseña restablecida exitosamente!
        </p>
        <p class="text-sm text-gray-600">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <router-link
          to="/admin/login"
          class="inline-block mt-4 px-6 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium"
        >
          Ir al inicio de sesión
        </router-link>
      </div>

      <div
        v-if="error"
        class="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm"
      >
        {{ error }}
      </div>

      <div
        v-if="validatingToken"
        class="text-center py-8"
      >
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue-600"></div>
        <p class="mt-2 text-gray-600">Validando enlace...</p>
      </div>

      <div
        v-if="!isTokenValid && !validatingToken"
        class="text-center space-y-4"
      >
        <div class="flex justify-center">
          <svg
            class="h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="text-gray-700 font-medium">
          El enlace de recuperación no es válido o ha expirado
        </p>
        <router-link
          to="/admin/forgot-password"
          class="inline-block mt-4 px-6 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium"
        >
          Solicitar nuevo enlace
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import authApiService from '../services/auth-api.service';

const route = useRoute();

const email = ref('');
const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const validatingToken = ref(true);
const isTokenValid = ref(false);
const error = ref('');
const passwordReset = ref(false);

onMounted(async () => {
  // Obtener email y token de la URL
  email.value = route.query.email as string || '';
  token.value = route.query.token as string || '';

  if (!email.value || !token.value) {
    error.value = 'Enlace de recuperación inválido';
    validatingToken.value = false;
    return;
  }

  // Validar el token
  try {
    const response = await authApiService.validateResetTokenAdmin({
      email: email.value,
      token: token.value,
    });
    isTokenValid.value = response.valid;
    if (!response.valid) {
      error.value = 'El enlace de recuperación no es válido o ha expirado';
    }
  } catch (err: any) {
    error.value = 'Error al validar el enlace de recuperación';
    isTokenValid.value = false;
  } finally {
    validatingToken.value = false;
  }
});

const handleSubmit = async () => {
  if (!password.value || !confirmPassword.value) {
    error.value = 'Por favor, completa todos los campos';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }

  if (password.value.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    await authApiService.resetPasswordAdmin({
      email: email.value,
      token: token.value,
      newPassword: password.value,
    });
    passwordReset.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al restablecer la contraseña. Por favor, intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>
