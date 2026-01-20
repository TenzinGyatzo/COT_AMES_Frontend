<template>
  <div class="max-w-md mx-auto mt-8">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2 text-center">
        Administración
      </h2>
      <p class="text-sm text-gray-600 mb-6 text-center">
        Solo para personal autorizado
      </p>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            placeholder="usuario@ejemplo.com"
          />
        </div>
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Contraseña
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="••••••••"
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
                  d="M1 1l22 22M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Iniciando sesión...</span>
          <span v-else>Iniciar sesión</span>
        </button>
      </form>
      <div class="mt-4 text-center">
        <router-link
          to="/admin/forgot-password"
          class="text-sm text-medical-blue-600 hover:text-medical-blue-700"
        >
          ¿Olvidaste tu contraseña?
        </router-link>
      </div>
      <div
        v-if="error"
        class="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm"
      >
        {{ error }}
      </div>
      <div
        v-if="mensaje && !error"
        class="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm"
      >
        {{ mensaje }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth';

// Vista de login: orquesta la autenticación usando el composable useAuth
// Toda la lógica de negocio está en el composable, la vista solo maneja UI

const router = useRouter();
const route = useRoute();
const { login, isLoading, error } = useAuth();

const email = ref('');
const password = ref('');
const mensaje = ref('');
const showPassword = ref(false);

const handleSubmit = async () => {
  // Validación básica
  if (!email.value || !password.value) {
    mensaje.value = 'Por favor, complete todos los campos';
    return;
  }

  try {
    await login(email.value, password.value);
    // Si el login es exitoso, redirigir a admin o a la ruta de redirect si existe
    const redirect = route.query.redirect as string | undefined;
    router.push(redirect || '/admin');
  } catch (err) {
    // El error ya está manejado en el store/composable
    // Solo mostramos el mensaje de error que viene del composable
  }
};
</script>
