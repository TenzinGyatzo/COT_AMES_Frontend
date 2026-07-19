/**
 * Store de Pinia para el cotizador admin AMES (sin sedes / portal cliente)
 */

import { defineStore } from 'pinia';
import type { Servicio } from '../types/backend';
import httpClient from '../services/http';

interface CotizadorState {
  servicios: Servicio[];
  cantidadesPorServicio: Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

export const useCotizadorStore = defineStore('cotizador', {
  state: (): CotizadorState => ({
    servicios: [],
    cantidadesPorServicio: {},
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchServicios(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const all: Servicio[] = [];
        let page = 1;
        let totalPages = 1;
        do {
          const response = await httpClient.get<{
            data: Servicio[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          }>('/servicios', {
            params: { activo: true, page, limit: 100 },
          });
          all.push(...(response.data.data || []));
          totalPages = response.data.totalPages || 1;
          page += 1;
        } while (page <= totalPages);
        this.servicios = all;
      } catch (error: any) {
        this.servicios = [];
        this.error = 'No fue posible cargar los servicios';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setCantidad(servicioId: string, cantidad: number): void {
      if (cantidad <= 0) {
        delete this.cantidadesPorServicio[servicioId];
      } else {
        this.cantidadesPorServicio[servicioId] = cantidad;
      }
    },

    resetSelection(): void {
      this.cantidadesPorServicio = {};
      this.error = null;
    },
  },
});
