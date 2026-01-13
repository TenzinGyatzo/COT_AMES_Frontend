<template>
  <div class="max-w-md mx-auto mt-16">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2 text-center">
        Recuperar contraseña
      </h2>
      <p class="text-sm text-gray-600 mb-6 text-center">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
      </p>

      <form v-if="!emailSent" @submit.prevent="handleSubmit" class="space-y-4">
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

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Enviando...</span>
          <span v-else>Enviar enlace de recuperación</span>
        </button>
      </form>

      <div
        v-if="emailSent"
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
        <p class="text-gray-700">
          Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
        </p>
        <p class="text-sm text-gray-600">
          Por favor, revisa tu bandeja de entrada y la carpeta de spam.
        </p>
      </div>

      <div
        v-if="error"
        class="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm"
      >
        {{ error }}
      </div>

      <div class="mt-6 text-center">
        <router-link
          to="/admin/login"
          class="text-sm text-medical-blue-600 hover:text-medical-blue-700"
        >
          Volver al inicio de sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import authApiService from '../services/auth-api.service';

const email = ref('');
const isLoading = ref(false);
const error = ref('');
const emailSent = ref(false);

const handleSubmit = async () => {
  if (!email.value) {
    error.value = 'Por favor, ingresa tu correo electrónico';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    await authApiService.requestPasswordResetAdmin({ email: email.value });
    emailSent.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al enviar el correo. Por favor, intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>
