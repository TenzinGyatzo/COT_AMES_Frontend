/**
 * Store de Pinia para autenticación
 * Maneja el estado de autenticación del usuario (token, datos del usuario, estados de carga y errores)
 * Persiste el token y datos básicos del usuario en localStorage para mantener sesión
 */

import { defineStore } from 'pinia';
import type { User, LoginResponse } from '../types/backend';
import httpClient from '../services/http';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY_TOKEN = 'auth_token';
const STORAGE_KEY_USER = 'auth_user';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    /**
     * Indica si el usuario está autenticado (tiene token válido)
     */
    isAuthenticated(): boolean {
      return !!this.accessToken;
    },

    /**
     * Retorna el usuario actual o null si no está autenticado
     */
    currentUser(): User | null {
      return this.user;
    },

    /**
     * Indica si el usuario actual es un administrador
     */
    isAdmin(): boolean {
      return this.user?.tipoUsuario === 'admin';
    },

    /**
     * Indica si el usuario actual es un cliente
     */
    isCliente(): boolean {
      return this.user?.tipoUsuario === 'cliente';
    },
  },

  actions: {
    /**
     * Maneja la respuesta del login y guarda token y usuario en estado y localStorage
     * Método interno privado para factorizar lógica común entre login y loginCliente
     * @param response - Respuesta del endpoint de login con access_token y user
     */
    _handleLoginResponse(response: LoginResponse): void {
      this.accessToken = response.access_token;
      this.user = response.user;

      // Persistir en localStorage
      localStorage.setItem(STORAGE_KEY_TOKEN, this.accessToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.user));
    },

    /**
     * Realiza login contra el backend y guarda token y datos del usuario
     * @param email - Correo electrónico del usuario
     * @param password - Contraseña del usuario
     */
    async login(email: string, password: string): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.post<LoginResponse>('/auth/login', {
          email,
          password,
        });

        this._handleLoginResponse(response.data);
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Credenciales incorrectas';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Realiza login de cliente contra el backend y guarda token y datos del usuario
     * @param email - Correo electrónico del cliente
     * @param password - Contraseña del cliente
     */
    async loginCliente(email: string, password: string): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.post<LoginResponse>(
          '/auth/cliente/login',
          {
            email,
            password,
          },
        );

        this._handleLoginResponse(response.data);
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Credenciales incorrectas';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Registra un nuevo cliente completo (cliente + usuario)
     * Después del registro exitoso, hace login automático
     * @param registerData - Datos de registro del cliente completo
     */
    async registerCliente(registerData: {
      email: string;
      password: string;
      nombre: string;
      empresa?: string;
      nombreContacto?: string;
      correoCliente?: string;
      telefono?: string;
      sedeId?: string;
      claveEmpresa?: string;
    }): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        // Registrar el cliente completo
        await httpClient.post('/auth/cliente/register', registerData);

        // Después de registro exitoso, hacer login automático
        await this.loginCliente(registerData.email, registerData.password);
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Error al registrar cliente';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Cierra sesión limpiando estado y localStorage
     */
    logout(): void {
      this.accessToken = null;
      this.user = null;
      this.error = null;

      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    },

    /**
     * Carga el estado de autenticación desde localStorage al iniciar la app
     * Debe llamarse antes de montar la aplicación en main.ts
     * Valida que el usuario parseado tenga la estructura correcta antes de restaurarlo
     * Para usuarios cliente, valida adicionalmente que clienteId esté presente
     */
    loadFromStorage(): void {
      const token = localStorage.getItem(STORAGE_KEY_TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEY_USER);

      if (token && userStr) {
        try {
          const parsedUser = JSON.parse(userStr);

          // Validar campos mínimos requeridos
          const hasBasicFields =
            parsedUser &&
            typeof parsedUser._id === 'string' &&
            typeof parsedUser.email === 'string' &&
            typeof parsedUser.rol === 'string' &&
            typeof parsedUser.tipoUsuario === 'string' &&
            (parsedUser.rol === 'admin' || parsedUser.rol === 'cliente') &&
            (parsedUser.tipoUsuario === 'admin' ||
              parsedUser.tipoUsuario === 'cliente');

          if (!hasBasicFields) {
            // Estructura incompleta o inválida, limpiar localStorage
            this.logout();
            return;
          }

          // Validación adicional para usuarios cliente: deben tener clienteId
          if (parsedUser.tipoUsuario === 'cliente') {
            if (typeof parsedUser.clienteId !== 'string') {
              // Usuario cliente sin clienteId válido, limpiar localStorage
              this.logout();
              return;
            }
          }

          // Validación pasada, restaurar estado
          this.accessToken = token;
          this.user = parsedUser;
        } catch (error) {
          // Si hay error al parsear, limpiar localStorage
          this.logout();
        }
      }
    },
  },
});
