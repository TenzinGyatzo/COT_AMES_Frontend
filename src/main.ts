/**
 * Punto de entrada principal de la aplicación Vue
 * Configura Pinia, Router y estilos globales
 * Carga el estado de autenticación desde localStorage antes de montar la app
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { useAuthStore } from './store/auth';
import { setUnauthorizedHandler } from './services/http';

// Importar estilos de TailwindCSS
import './assets/css/main.css';

// Crear instancia de Pinia para manejo de estado global
const pinia = createPinia();

// Crear la aplicación Vue
const app = createApp(App);

// Configurar plugins
app.use(pinia);
app.use(router);

setUnauthorizedHandler(() => {
  if (router.currentRoute.value.name === 'admin-login') return;
  void router.push({ name: 'admin-login' });
});

// Cargar sesión (+ tenant admin revalidado) antes de montar para evitar
// llamadas de negocio sin X-Tenant-Id en cold start (AD-2 / Story 1.5).
const authStore = useAuthStore();

void (async () => {
  await authStore.loadFromStorage();
  app.mount('#app');
})();
