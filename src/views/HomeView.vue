<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center p-5"
  >
    <h1 class="text-4xl font-bold text-gray-900 mb-4">
      Bienvenido al Cotizador de Servicios Médicos
    </h1>
    <p class="text-lg text-gray-600 mb-8">
      Sistema de cotización para servicios médicos laborales
    </p>
    <div class="flex justify-center space-x-4">
      <router-link
        v-if="isCliente"
        :to="{ name: 'cliente-cotizacion-nueva' }"
        class="px-6 py-3 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium"
      >
        Crear Cotización
      </router-link>
      <template v-else>
        <router-link
          to="/cliente/login"
          class="px-6 py-3 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium"
        >
          Acceso Portal Cliente
        </router-link>
        <router-link
          to="/cliente/register"
          class="px-6 py-3 bg-white text-medical-blue-600 border-2 border-medical-blue-600 rounded-md hover:bg-medical-blue-50 transition-colors font-medium"
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
