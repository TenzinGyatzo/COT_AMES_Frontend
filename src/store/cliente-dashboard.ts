/**
 * Store de Pinia para el dashboard del cliente
 * Maneja el estado de los contadores del dashboard (cotizaciones y órdenes por estado)
 * Expone acciones para cargar los contadores desde el backend usando llamadas paralelas
 */

import { defineStore } from 'pinia';
import {
  getMisCotizaciones,
  getMisOrdenes,
} from '../services/cliente-api.service';

interface DashboardCounters {
  cotizaciones: {
    vigentes: number;
    aceptadas: number;
    rechazadas: number;
    vencidas: number;
  };
  ordenes: {
    pendientes: number;
    enProceso: number;
    completadas: number;
  };
}

interface ClienteDashboardState {
  counters: DashboardCounters | null;
  isLoading: boolean;
  error: string | null;
}

export const useClienteDashboardStore = defineStore('cliente-dashboard', {
  state: (): ClienteDashboardState => ({
    counters: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * Carga los contadores del dashboard haciendo llamadas paralelas a los endpoints
     * Usa filtros por estado y limit=1 para obtener solo el total sin transferir datos innecesarios
     */
    async fetchDashboardCounters(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        // Realizar todas las llamadas en paralelo
        const [
          cotizacionesVigentes,
          cotizacionesAceptadas,
          cotizacionesRechazadas,
          cotizacionesVencidas,
          ordenesPendientes,
          ordenesEnProceso,
          ordenesCompletadas,
        ] = await Promise.all([
          getMisCotizaciones({ estado: 'vigente', limit: 1, page: 1 }),
          getMisCotizaciones({ estado: 'aceptada', limit: 1, page: 1 }),
          getMisCotizaciones({ estado: 'rechazada', limit: 1, page: 1 }),
          getMisCotizaciones({ estado: 'vencida', limit: 1, page: 1 }),
          getMisOrdenes({ estado: 'pendiente', limit: 1, page: 1 }),
          getMisOrdenes({ estado: 'en_proceso', limit: 1, page: 1 }),
          getMisOrdenes({ estado: 'completada', limit: 1, page: 1 }),
        ]);

        // Construir objeto de contadores usando el campo 'total' de cada respuesta
        this.counters = {
          cotizaciones: {
            vigentes: cotizacionesVigentes.total,
            aceptadas: cotizacionesAceptadas.total,
            rechazadas: cotizacionesRechazadas.total,
            vencidas: cotizacionesVencidas.total,
          },
          ordenes: {
            pendientes: ordenesPendientes.total,
            enProceso: ordenesEnProceso.total,
            completadas: ordenesCompletadas.total,
          },
        };
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible cargar los contadores del dashboard';
        this.counters = null;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Limpia el estado del store
     */
    clear(): void {
      this.counters = null;
      this.error = null;
    },
  },
});
