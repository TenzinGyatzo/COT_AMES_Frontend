/**
 * Store de Pinia para el cotizador admin AMES (sin sedes / portal cliente)
 */

import { defineStore } from 'pinia';
import type { Servicio } from '../types/backend';
import httpClient from '../services/http';

interface CotizadorState {
  servicios: Servicio[];
  cantidadesPorServicio: Record<string, number>;
  /** Story 8.2 — sobrevive remount junto a las cantidades. */
  incluirImagenesPdf: boolean;
  imagenesPdfTouched: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useCotizadorStore = defineStore('cotizador', {
  state: (): CotizadorState => ({
    servicios: [],
    cantidadesPorServicio: {},
    incluirImagenesPdf: false,
    imagenesPdfTouched: false,
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
      const q = Math.max(0, Math.floor(Number(cantidad) || 0));
      this.cantidadesPorServicio[servicioId] = q;
    },

    removeServicio(servicioId: string): void {
      delete this.cantidadesPorServicio[servicioId];
    },

    resetSelection(): void {
      this.cantidadesPorServicio = {};
      this.incluirImagenesPdf = false;
      this.imagenesPdfTouched = false;
      this.error = null;
    },
  },
});
