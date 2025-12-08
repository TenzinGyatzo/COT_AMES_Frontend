<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar superior -->
    <Navbar />

    <!-- Contenedor principal con padding -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue';

// Layout que solo se encarga del marco visual
// Delega la barra de navegación al componente Navbar
</script>
