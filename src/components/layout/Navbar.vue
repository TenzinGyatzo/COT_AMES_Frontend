<template>
  <nav class="bg-white shadow-md relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <RouterLink to="/" class="text-2xl font-bold text-medical-blue-600">
            MOC
          </RouterLink>
        </div>

        <!-- Enlaces de navegación - Desktop -->
        <div class="hidden md:block">
          <div class="flex items-baseline space-x-4">
            <!-- Solo mostrar links si NO estamos en la vista de cotización pública -->
            <template v-if="$route.name !== 'guest-cotizacion-detalle'">
              <RouterLink
                to="/"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="
                  $route.name === 'home'
                    ? 'bg-medical-blue-100 text-medical-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                "
              >
                Inicio
              </RouterLink>

              <template v-if="!isAuthenticated">
                <RouterLink
                  to="/cliente/login"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'cliente-login'
                      ? 'text-white bg-medical-blue-600 hover:bg-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Acceso Cliente
                </RouterLink>
                <RouterLink
                  to="/cliente/register"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'cliente-register'
                      ? 'text-white bg-medical-blue-600 hover:bg-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Registrarse
                </RouterLink>
              </template>

              <!-- Enlaces para administradores -->
              <template v-if="isAdmin">
                <RouterLink
                  to="/admin/cotizaciones"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'admin-cotizaciones'
                      ? 'bg-medical-blue-100 text-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Historial
                </RouterLink>
                <RouterLink
                  to="/admin/metricas"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'admin-metricas'
                      ? 'bg-medical-blue-100 text-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Métricas de Uso
                </RouterLink>
                <RouterLink
                  to="/admin/servicios"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'admin-servicios'
                      ? 'bg-medical-blue-100 text-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Servicios
                </RouterLink>
                <RouterLink
                  to="/admin/sedes"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'admin-sedes'
                      ? 'bg-medical-blue-100 text-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Sedes
                </RouterLink>
                <RouterLink
                  to="/admin/citas"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100"
                >
                  Citas
                </RouterLink>
              </template>

              <!-- Enlaces para clientes -->
              <template v-else-if="isCliente">
                <RouterLink
                  :to="{ name: 'cliente-dashboard' }"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'cliente-dashboard'
                      ? 'bg-medical-blue-100 text-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Panel
                </RouterLink>
                <RouterLink
                  :to="{ name: 'cliente-cotizacion-nueva' }"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'cliente-cotizacion-nueva'
                      ? 'bg-medical-blue-100 text-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Crear Cotización
                </RouterLink>
                <RouterLink
                  :to="{ name: 'cliente-cotizaciones' }"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'cliente-cotizaciones'
                      ? 'bg-medical-blue-100 text-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Mis cotizaciones
                </RouterLink>
                <RouterLink
                  :to="{ name: 'cliente-ordenes' }"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'cliente-ordenes'
                      ? 'bg-medical-blue-100 text-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Mis órdenes
                </RouterLink>
                <RouterLink
                  :to="{ name: 'cliente-perfil' }"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  :class="
                    $route.name === 'cliente-perfil'
                      ? 'bg-medical-blue-100 text-medical-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  Mi perfil
                </RouterLink>
              </template>
            </template>
          </div>
        </div>

        <!-- Botones Desktop: Admin Login y Cerrar Sesión -->
        <div class="hidden md:flex items-center gap-3">
          <template v-if="$route.name !== 'guest-cotizacion-detalle'">
            <RouterLink
              v-if="!isAuthenticated"
              to="/admin/login"
              class="px-3 py-1.5 text-xs font-normal text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 rounded-md hover:bg-gray-50"
            >
              Admin
            </RouterLink>
            <button
              v-if="isAuthenticated"
              type="button"
              class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              @click="handleLogout"
            >
              Cerrar Sesión
            </button>
          </template>
        </div>

        <!-- Botón Menú Móvil -->
        <div class="md:hidden">
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-medical-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-medical-blue-500 transition-colors"
            @click="toggleMobileMenu"
            aria-expanded="false"
            aria-label="Menú principal"
          >
            <svg
              v-if="!isMobileMenuOpen"
              class="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Menú Móvil -->
    <div v-show="isMobileMenuOpen" class="md:hidden border-t border-gray-200">
      <div v-if="$route.name !== 'guest-cotizacion-detalle'" class="px-2 pt-2 pb-3 space-y-1">
        <!-- Enlaces siempre visibles -->
        <RouterLink
          to="/"
          class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
          :class="
            $route.name === 'home'
              ? 'bg-medical-blue-100 text-medical-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          "
          @click="closeMobileMenu"
        >
          Inicio
        </RouterLink>

        <template v-if="!isAuthenticated">
          <RouterLink
            to="/cliente/login"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'cliente-login'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Acceso Cliente
          </RouterLink>
          <RouterLink
            to="/cliente/register"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'cliente-register'
                ? 'text-white bg-medical-blue-600 hover:bg-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Registrarse
          </RouterLink>
        </template>

        <!-- Enlaces para administradores -->
        <template v-if="isAdmin">
          <RouterLink
            to="/admin/cotizaciones"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'admin-cotizaciones'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Historial
          </RouterLink>
          <RouterLink
            to="/admin/metricas"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'admin-metricas'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Métricas de Uso
          </RouterLink>
          <RouterLink
            to="/admin/servicios"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'admin-servicios'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Servicios
          </RouterLink>
          <RouterLink
            to="/admin/sedes"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'admin-sedes'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Sedes
          </RouterLink>
          <RouterLink
            to="/admin/citas"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors text-gray-700 hover:bg-gray-100"
            @click="closeMobileMenu"
          >
            Citas
          </RouterLink>
        </template>

        <!-- Enlaces para clientes -->
        <template v-else-if="isCliente">
          <RouterLink
            :to="{ name: 'cliente-dashboard' }"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'cliente-dashboard'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Panel
          </RouterLink>
          <RouterLink
            :to="{ name: 'cliente-cotizacion-nueva' }"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'cliente-cotizacion-nueva'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Crear Cotización
          </RouterLink>
          <RouterLink
            :to="{ name: 'cliente-cotizaciones' }"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'cliente-cotizaciones'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Mis cotizaciones
          </RouterLink>
          <RouterLink
            :to="{ name: 'cliente-ordenes' }"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'cliente-ordenes'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Mis órdenes
          </RouterLink>
          <RouterLink
            :to="{ name: 'cliente-perfil' }"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="
              $route.name === 'cliente-perfil'
                ? 'bg-medical-blue-100 text-medical-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            "
            @click="closeMobileMenu"
          >
            Mi perfil
          </RouterLink>
        </template>

        <!-- Botón Admin Login Móvil -->
        <div class="pt-2 border-t border-gray-200">
          <RouterLink
            to="/admin/login"
            class="block px-3 py-2 rounded-md text-sm font-normal text-gray-500 hover:bg-gray-50 transition-colors border border-gray-200"
            @click="closeMobileMenu"
          >
            Admin Login
          </RouterLink>
        </div>

        <!-- Botón Cerrar Sesión Móvil -->
        <div v-if="isAuthenticated" class="pt-2 border-t border-gray-200">
          <button
            type="button"
            class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
            @click="handleMobileLogout"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      <div v-else class="px-4 py-6 text-center text-gray-500 italic">
        Menú no disponible en vista pública
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { useAuthStore } from '../../store/auth';

const { logout } = useAuth();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Obtener estados de autenticación de forma reactiva desde el store
const { isAuthenticated, isAdmin, isCliente } = storeToRefs(authStore);

// Estado del menú móvil
const isMobileMenuOpen = ref(false);

// Cerrar menú móvil cuando cambia la ruta
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  },
);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleLogout = () => {
  logout();
  closeMobileMenu();
  // Redirigir según el tipo de usuario
  if (authStore.isAdmin) {
    router.push('/admin/login');
  } else {
    router.push('/cliente/login');
  }
};

const handleMobileLogout = () => {
  handleLogout();
};
</script>
