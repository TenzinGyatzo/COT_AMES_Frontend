<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 sm:p-6 md:p-8 lg:p-5"
  >
    <img src="../assets/logos/exin-cv-salud-laboral-logo.png" alt="Logo" class="w-48 sm:w-56 md:w-64 lg:w-80 h-48 sm:h-56 md:h-64 lg:h-80 mb-6 md:mb-12">
    <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
      Bienvenido al Cotizador de Servicios Médicos
    </h1>
    <p class="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4 max-w-2xl">
      Sistema de cotización para servicios médicos laborales
    </p>
    <div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
      <router-link
        v-if="isCliente"
        :to="{ name: 'cliente-cotizacion-nueva' }"
        class="px-4 py-2.5 sm:px-6 sm:py-3 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
      >
        Crear Cotización
      </router-link>
      <template v-else>
        <router-link
          to="/cliente/login"
          class="px-4 py-2.5 sm:px-6 sm:py-3 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          Acceso Portal Cliente
        </router-link>
        <router-link
          to="/cliente/register"
          class="px-4 py-2.5 sm:px-6 sm:py-3 bg-white text-medical-blue-600 border-2 border-medical-blue-600 rounded-md hover:bg-medical-blue-50 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          Crear Cuenta
        </router-link>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../store/auth';

// Vista pequeña, sin lógica compleja
// Landing page simple con mensaje de bienvenida
// El botón de cotizador solo se muestra si el usuario es cliente autenticado

const authStore = useAuthStore();
const { isCliente } = storeToRefs(authStore);
</script>
