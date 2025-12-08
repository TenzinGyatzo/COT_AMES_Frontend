/**
 * Composable para manejo de autenticación
 * Encapsula la interacción con el store de autenticación
 * Expone métodos y estados de forma reactiva para usar en componentes
 */

import { storeToRefs } from 'pinia';
import { useAuthStore } from '../store/auth';

export function useAuth() {
  const authStore = useAuthStore();
  const { user, isLoading, error } = storeToRefs(authStore);

  /**
   * Realiza login con email y contraseña
   */
  const login = async (email: string, password: string): Promise<void> => {
    await authStore.login(email, password);
  };

  /**
   * Realiza login de cliente con email y contraseña
   */
  const loginCliente = async (
    email: string,
    password: string,
  ): Promise<void> => {
    await authStore.loginCliente(email, password);
  };

  /**
   * Registra un nuevo cliente completo y hace login automático
   */
  const registerCliente = async (registerData: {
    email: string;
    password: string;
    nombre: string;
    empresa?: string;
    nombreContacto?: string;
    correoCliente?: string;
    telefono?: string;
    sedeId?: string;
    claveEmpresa?: string;
  }): Promise<void> => {
    await authStore.registerCliente(registerData);
  };

  /**
   * Cierra sesión y limpia el estado
   */
  const logout = (): void => {
    authStore.logout();
  };

  /**
   * Indica si el usuario está autenticado
   */
  const getIsAuthenticated = (): boolean => {
    return authStore.isAuthenticated;
  };

  return {
    login,
    loginCliente,
    registerCliente,
    logout,
    isAuthenticated: getIsAuthenticated,
    currentUser: user,
    isLoading,
    error,
  };
}
