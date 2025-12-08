/**
 * Composable para manejo de la lógica del dashboard del cliente
 * Encapsula la interacción con el store del dashboard
 * Expone contadores y métodos de forma reactiva para usar en componentes
 */

import { storeToRefs } from 'pinia';
import { useClienteDashboardStore } from '../store/cliente-dashboard';

export function useClienteDashboard() {
  const dashboardStore = useClienteDashboardStore();
  const { counters, isLoading, error } = storeToRefs(dashboardStore);

  /**
   * Carga los contadores del dashboard
   */
  const fetchDashboardCounters = async (): Promise<void> => {
    await dashboardStore.fetchDashboardCounters();
  };

  /**
   * Limpia el estado del dashboard
   */
  const clearDashboard = (): void => {
    dashboardStore.clear();
  };

  return {
    // Datos reactivos
    counters,
    isLoading,
    error,
    // Métodos
    fetchDashboardCounters,
    clearDashboard,
  };
}
