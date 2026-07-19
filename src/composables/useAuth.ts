/**
 * Composable para manejo de autenticación admin AMES
 */

import { storeToRefs } from 'pinia';
import { useAuthStore } from '../store/auth';

export function useAuth() {
  const authStore = useAuthStore();
  const { user, isLoading, error } = storeToRefs(authStore);

  const login = async (email: string, password: string): Promise<void> => {
    await authStore.login(email, password);
  };

  const logout = (): void => {
    authStore.logout();
  };

  const getIsAuthenticated = (): boolean => {
    return authStore.isAuthenticated;
  };

  return {
    login,
    logout,
    isAuthenticated: getIsAuthenticated,
    currentUser: user,
    isLoading,
    error,
  };
}
