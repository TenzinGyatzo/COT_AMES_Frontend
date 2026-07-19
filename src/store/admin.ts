/**
 * Store de Pinia para administración AMES
 */

import { defineStore } from 'pinia';
import type {
  Cliente,
  CotizacionListItemDto,
  CotizacionDetalleDto,
  PaginatedCotizacionesResponseDto,
  ClientMetricDto,
  ServiceMetricDto,
  TotalsMetricDto,
} from '../types/backend';
import {
  getClientes,
  getClienteById,
  getCotizacionesAdmin,
  getCotizacionAdminById,
  getDashboardEntityTotals,
  type AdminClientesFilters,
  type AdminCotizacionesFilters,
} from '../services/admin-api.service';
import httpClient from '../services/http';
import { useAuthStore } from './auth';

interface AdminDashboardCounters {
  cotizaciones: {
    vigentes: number;
    vencidas: number;
    aceptadas: number;
    rechazadas: number;
  };
  totales: {
    clientesActivos: number;
    contactos: number;
    usuarios: number;
    servicios: number;
  };
}

interface AdminState {
  resumenCotizaciones: CotizacionListItemDto[];
  cotizacionDetalle: CotizacionDetalleDto | null;
  cotizacionesPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoadingCotizaciones: boolean;

  clientes: Cliente[];
  clientesPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  clienteDetalle: Cliente | null;
  isLoadingClientes: boolean;

  metricasClientes: ClientMetricDto[];
  metricasServicios: ServiceMetricDto[];
  metricasTotales: TotalsMetricDto | null;
  /** Tenant cuyas métricas están en store (admin: activeTenantId; operativo: sentinel). */
  metricasTenantId: string | null;
  /** Monotonic seq para descartar respuestas stale de fetchMetricas (race remount). */
  metricasFetchSeq: number;

  dashboardCounters: AdminDashboardCounters | null;
  isLoadingDashboard: boolean;

  isLoading: boolean;
  error: string | null;
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    resumenCotizaciones: [],
    cotizacionDetalle: null,
    cotizacionesPagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    isLoadingCotizaciones: false,

    clientes: [],
    clientesPagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
    clienteDetalle: null,
    isLoadingClientes: false,

    metricasClientes: [],
    metricasServicios: [],
    metricasTotales: null,
    metricasTenantId: null,
    metricasFetchSeq: 0,

    dashboardCounters: null,
    isLoadingDashboard: false,

    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchResumenCotizaciones(
      estado?: 'vigente' | 'vencida',
    ): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const params: any = { page: 1, limit: 10 };
        if (estado) params.estado = estado;

        const response = await httpClient.get<PaginatedCotizacionesResponseDto>(
          '/cotizaciones',
          { params },
        );

        this.resumenCotizaciones = response.data.data;
      } catch (error: any) {
        this.error = 'No fue posible cargar las cotizaciones';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMetricas(filters?: {
      fechaDesde?: string;
      fechaHasta?: string;
    }): Promise<void> {
      const authStore = useAuthStore();
      const seq = ++this.metricasFetchSeq;
      this.isLoading = true;
      this.error = null;

      // Story 7.2 review: clear solo al cambiar tenant admin (no filtros / operativo)
      const tenantKey = authStore.isAdminSistema
        ? authStore.activeTenantId
        : 'operativo';
      if (tenantKey !== this.metricasTenantId) {
        this.metricasClientes = [];
        this.metricasServicios = [];
        this.metricasTotales = null;
        this.metricasTenantId = tenantKey;
      }

      try {
        const params: any = {};
        if (filters?.fechaDesde) params.fechaDesde = filters.fechaDesde;
        if (filters?.fechaHasta) params.fechaHasta = filters.fechaHasta;

        const [clientesResponse, serviciosResponse, totalsResponse] =
          await Promise.all([
            httpClient.get<ClientMetricDto[]>('/metrics/clients', { params }),
            httpClient.get<ServiceMetricDto[]>('/metrics/services', { params }),
            httpClient.get<TotalsMetricDto>('/metrics/totals', { params }),
          ]);

        if (seq !== this.metricasFetchSeq) return;

        this.metricasClientes = clientesResponse.data;
        this.metricasServicios = serviciosResponse.data;
        this.metricasTotales = totalsResponse.data;
      } catch (error: any) {
        if (seq !== this.metricasFetchSeq) return;
        this.error = 'No fue posible cargar las métricas';
        throw error;
      } finally {
        if (seq === this.metricasFetchSeq) {
          this.isLoading = false;
        }
      }
    },

    async fetchClientes(filters: AdminClientesFilters = {}): Promise<void> {
      this.isLoadingClientes = true;
      this.error = null;

      try {
        let effective = { ...filters };
        let res = await getClientes(effective);

        // Página huérfana tras mutación: clamp a última página válida
        if (
          Array.isArray(res.data) &&
          res.data.length === 0 &&
          (res.total ?? 0) > 0 &&
          (res.page ?? 1) > (res.totalPages ?? 1)
        ) {
          effective = {
            ...effective,
            page: Math.max(1, res.totalPages ?? 1),
          };
          res = await getClientes(effective);
        }

        this.clientes = Array.isArray(res.data) ? res.data : [];
        this.clientesPagination = {
          total: res.total ?? 0,
          page: res.page ?? 1,
          limit: res.limit ?? effective.limit ?? 20,
          totalPages: res.totalPages ?? 1,
        };
      } catch (error: any) {
        const raw = error.response?.data?.message;
        this.error = Array.isArray(raw)
          ? raw.join('. ')
          : typeof raw === 'string'
            ? raw
            : 'No fue posible cargar los clientes';
        this.clientes = [];
        this.clientesPagination = {
          total: 0,
          page: 1,
          limit: filters.limit ?? 20,
          totalPages: 1,
        };
        throw error;
      } finally {
        this.isLoadingClientes = false;
      }
    },

    async fetchCliente(id: string): Promise<void> {
      this.isLoadingClientes = true;
      this.error = null;

      try {
        this.clienteDetalle = await getClienteById(id);
      } catch (error: any) {
        const raw = error.response?.data?.message;
        this.error = Array.isArray(raw)
          ? raw.join('. ')
          : typeof raw === 'string'
            ? raw
            : 'No fue posible cargar el cliente';
        this.clienteDetalle = null;
        throw error;
      } finally {
        this.isLoadingClientes = false;
      }
    },

    clearClienteDetalle(): void {
      this.clienteDetalle = null;
    },

    async fetchCotizacionesAdmin(
      filters: AdminCotizacionesFilters = {},
    ): Promise<void> {
      this.isLoadingCotizaciones = true;
      this.error = null;

      try {
        const response = await getCotizacionesAdmin(filters);
        this.resumenCotizaciones = response.data;
        this.cotizacionesPagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible cargar las cotizaciones';
        this.resumenCotizaciones = [];
        this.cotizacionesPagination = {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        };
        throw error;
      } finally {
        this.isLoadingCotizaciones = false;
      }
    },

    async fetchCotizacionAdmin(id: string): Promise<void> {
      this.isLoadingCotizaciones = true;
      this.error = null;

      try {
        this.cotizacionDetalle = await getCotizacionAdminById(id);
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible cargar la cotización';
        this.cotizacionDetalle = null;
        throw error;
      } finally {
        this.isLoadingCotizaciones = false;
      }
    },

    clearCotizacionDetalle(): void {
      this.cotizacionDetalle = null;
    },

    async fetchDashboardCounters(): Promise<void> {
      this.isLoadingDashboard = true;
      this.error = null;

      try {
        const [
          cotizacionesVigentes,
          cotizacionesVencidas,
          cotizacionesAceptadas,
          cotizacionesRechazadas,
          entityTotals,
        ] = await Promise.all([
          getCotizacionesAdmin({ estado: 'vigente', limit: 1, page: 1 }),
          getCotizacionesAdmin({ estado: 'vencida', limit: 1, page: 1 }),
          getCotizacionesAdmin({ estado: 'aceptada', limit: 1, page: 1 }),
          getCotizacionesAdmin({ estado: 'rechazada', limit: 1, page: 1 }),
          getDashboardEntityTotals(),
        ]);

        this.dashboardCounters = {
          cotizaciones: {
            vigentes: cotizacionesVigentes.total,
            vencidas: cotizacionesVencidas.total,
            aceptadas: cotizacionesAceptadas.total,
            rechazadas: cotizacionesRechazadas.total,
          },
          totales: {
            clientesActivos: entityTotals.clientes,
            contactos: entityTotals.contactos,
            usuarios: entityTotals.usuarios,
            servicios: entityTotals.servicios,
          },
        };
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible cargar los contadores del dashboard';
        this.dashboardCounters = null;
        throw error;
      } finally {
        this.isLoadingDashboard = false;
      }
    },

    clearDashboardCounters(): void {
      this.dashboardCounters = null;
    },
  },
});
