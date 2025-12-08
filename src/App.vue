<template>
  <router-view />
  <div
    class="fixed top-4 right-4 z-50 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-mono"
  >
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 bg-red-500 rounded-full sm:hidden"></span>
      <span
        class="w-2 h-2 bg-orange-500 rounded-full hidden sm:block md:hidden"
      ></span>
      <span
        class="w-2 h-2 bg-yellow-500 rounded-full hidden md:block lg:hidden"
      ></span>
      <span
        class="w-2 h-2 bg-green-500 rounded-full hidden lg:block xl:hidden"
      ></span>
      <span
        class="w-2 h-2 bg-blue-500 rounded-full hidden xl:block 2xl:hidden"
      ></span>
      <span class="w-2 h-2 bg-purple-500 rounded-full hidden 2xl:block"></span>
      <span class="text-xs">
        <span class="sm:hidden">xs</span>
        <span class="hidden sm:block md:hidden">sm</span>
        <span class="hidden md:block lg:hidden">md</span>
        <span class="hidden lg:block xl:hidden">lg</span>
        <span class="hidden xl:block 2xl:hidden">xl</span>
        <span class="hidden 2xl:block">2xl</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Componente raíz de la aplicación
// Renderiza el router-view para mostrar las vistas según la ruta actual
</script>
