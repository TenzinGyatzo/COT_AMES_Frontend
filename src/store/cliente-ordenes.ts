/**
 * Store de Pinia para las órdenes de trabajo del cliente
 * Maneja el estado del listado de órdenes de trabajo del cliente autenticado
 * Expone acciones para cargar el listado desde el backend
 */

import { defineStore } from 'pinia';
import type {
  OrdenTrabajoListItemDto,
  PaginatedOrdenesTrabajoResponseDto,
  OrdenTrabajoDetalleDto,
} from '../types/backend';
import { getMisOrdenes, getOrdenById } from '../services/cliente-api.service';
import type { MisOrdenesFilters } from '../services/cliente-api.service';

interface ClienteOrdenesState {
  listado: OrdenTrabajoListItemDto[];
  detalle: OrdenTrabajoDetalleDto | null;
  isLoading: boolean;
  detalleLoading: boolean;
  error: string | null;
  detalleError: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useClienteOrdenesStore = defineStore('cliente-ordenes', {
  state: (): ClienteOrdenesState => ({
    listado: [],
    detalle: null,
    isLoading: false,
    detalleLoading: false,
    error: null,
    detalleError: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  }),

  actions: {
    /**
     * Carga el listado de órdenes de trabajo del cliente autenticado desde el backend
     * @param filters - Filtros opcionales (estado, fechaDesde, fechaHasta, página, límite)
     */
    async fetchMisOrdenes(filters: MisOrdenesFilters = {}): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response: PaginatedOrdenesTrabajoResponseDto =
          await getMisOrdenes(filters);
        this.listado = response.data;
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible cargar las órdenes de trabajo';
        this.listado = [];
        this.pagination = {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        };
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Carga el detalle de una orden de trabajo específica del cliente autenticado
     * @param id - ID de la orden de trabajo
     */
    async fetchOrden(id: string): Promise<void> {
      this.detalleLoading = true;
      this.detalleError = null;

      try {
        const response = await getOrdenById(id);
        this.detalle = response;
      } catch (error: any) {
        this.detalleError =
          error.response?.data?.message ||
          'No fue posible cargar el detalle de la orden de trabajo';
        this.detalle = null;
        throw error;
      } finally {
        this.detalleLoading = false;
      }
    },

    /**
     * Limpia el detalle del estado
     */
    clearDetalle(): void {
      this.detalle = null;
      this.detalleError = null;
    },

    /**
     * Limpia el estado del store
     */
    clear(): void {
      this.listado = [];
      this.detalle = null;
      this.error = null;
      this.detalleError = null;
      this.pagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
    },
  },
});
