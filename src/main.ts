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

// Importar estilos de TailwindCSS
import './assets/css/main.css';

// Crear instancia de Pinia para manejo de estado global
const pinia = createPinia();

// Crear la aplicación Vue
const app = createApp(App);

// Configurar plugins
app.use(pinia);
app.use(router);

// Cargar estado de autenticación desde localStorage antes de montar
const authStore = useAuthStore();
authStore.loadFromStorage();

// Montar la aplicación en el elemento #app
app.mount('#app');
