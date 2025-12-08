<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar lateral -->
    <Sidebar />

    <!-- Área de contenido principal -->
    <main class="flex-1 overflow-auto md:ml-0">
      <div class="p-4 md:p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '../components/layout/Sidebar.vue';

// Layout que solo se encarga del marco visual
// Delega la barra lateral al componente Sidebar
// El contenido se renderiza mediante router-view para rutas anidadas
</script>
