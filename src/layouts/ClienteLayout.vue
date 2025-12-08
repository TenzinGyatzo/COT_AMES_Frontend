<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar superior -->
    <Navbar />

    <!-- Contenedor principal -->
    <main class="mx-auto max-w-6xl px-4 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue';

// Layout base del portal cliente
// Usa el componente Navbar para facilitar la navegación entre vistas del cliente
// Renderiza las vistas hijas mediante router-view
</script>
