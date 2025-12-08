/**
 * Store de Pinia para administración
 * Maneja el estado del panel admin: clientes, cotizaciones, órdenes y métricas
 * Expone acciones para cargar datos protegidos del backend
 */

import { defineStore } from 'pinia';
import type {
  Cliente,
  CotizacionListItemDto,
  CotizacionDetalleDto,
  PaginatedCotizacionesResponseDto,
  OrdenTrabajoListItemDto,
  OrdenTrabajoDetalleDto,
  PaginatedOrdenesTrabajoResponseDto,
  ClientMetricDto,
  ServiceMetricDto,
  TotalsMetricDto,
} from '../types/backend';
import {
  getClientes,
  getClienteById,
  getCotizacionesAdmin,
  getCotizacionAdminById,
  getOrdenesAdmin,
  getOrdenAdminById,
  updateOrdenEstado,
  getServicios,
  getSedes,
  type AdminClientesFilters,
  type AdminCotizacionesFilters,
  type AdminOrdenesFilters,
  type UpdateOrdenEstadoPayload,
} from '../services/admin-api.service';
import httpClient from '../services/http';

interface AdminDashboardCounters {
  cotizaciones: {
    vigentes: number;
    vencidas: number;
    aceptadas: number;
    rechazadas: number;
  };
  ordenes: {
    pendientes: number;
    enProceso: number;
    completadas: number;
    canceladas: number;
  };
  totales: {
    clientesActivos: number;
    servicios: number;
    usuariosCliente: number;
    sedes: number;
  };
}

interface AdminState {
  // Cotizaciones
  resumenCotizaciones: CotizacionListItemDto[];
  cotizacionDetalle: CotizacionDetalleDto | null;
  cotizacionesPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoadingCotizaciones: boolean;

  // Clientes
  clientes: Cliente[];
  clienteDetalle: Cliente | null;
  isLoadingClientes: boolean;

  // Órdenes
  ordenes: OrdenTrabajoListItemDto[];
  ordenDetalle: OrdenTrabajoDetalleDto | null;
  ordenesPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoadingOrdenes: boolean;
  isUpdatingOrden: boolean;

  // Métricas
  metricasClientes: ClientMetricDto[];
  metricasServicios: ServiceMetricDto[];
  metricasTotales: TotalsMetricDto | null;

  // Dashboard
  dashboardCounters: AdminDashboardCounters | null;
  isLoadingDashboard: boolean;

  // Estados generales
  isLoading: boolean;
  error: string | null;
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    // Cotizaciones
    resumenCotizaciones: [],
    cotizacionDetalle: null,
    cotizacionesPagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    isLoadingCotizaciones: false,

    // Clientes
    clientes: [],
    clienteDetalle: null,
    isLoadingClientes: false,

    // Órdenes
    ordenes: [],
    ordenDetalle: null,
    ordenesPagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    isLoadingOrdenes: false,
    isUpdatingOrden: false,

    // Métricas
    metricasClientes: [],
    metricasServicios: [],
    metricasTotales: null,

    // Dashboard
    dashboardCounters: null,
    isLoadingDashboard: false,

    // Estados generales
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * Carga el resumen de cotizaciones desde el backend
     * @param estado - Estado de las cotizaciones a filtrar (opcional)
     */
    async fetchResumenCotizaciones(
      estado?: 'vigente' | 'vencida',
    ): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const params: any = {
          page: 1,
          limit: 10,
        };

        if (estado) {
          params.estado = estado;
        }

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

    /**
     * Carga todas las métricas desde el backend (clientes, servicios y totales)
     * @param filters - Filtros opcionales (sedeId, fechaDesde, fechaHasta)
     */
    async fetchMetricas(filters?: {
      sedeId?: string;
      fechaDesde?: string;
      fechaHasta?: string;
    }): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const params: any = {};
        if (filters?.sedeId) {
          params.sedeId = filters.sedeId;
          console.log('Enviando filtro sedeId al backend:', filters.sedeId);
        }
        if (filters?.fechaDesde) {
          params.fechaDesde = filters.fechaDesde;
        }
        if (filters?.fechaHasta) {
          params.fechaHasta = filters.fechaHasta;
        }

        console.log('Parámetros enviados a la API:', params);

        // Cargar métricas en paralelo
        const [clientesResponse, serviciosResponse, totalsResponse] =
          await Promise.all([
            httpClient.get<ClientMetricDto[]>('/metrics/clients', { params }),
            httpClient.get<ServiceMetricDto[]>('/metrics/services', { params }),
            httpClient.get<TotalsMetricDto>('/metrics/totals', { params }),
          ]);

        console.log('Respuestas del backend:', {
          clientes: clientesResponse.data.length,
          servicios: serviciosResponse.data.length,
          totales: totalsResponse.data,
        });

        this.metricasClientes = clientesResponse.data;
        this.metricasServicios = serviciosResponse.data;
        this.metricasTotales = totalsResponse.data;
      } catch (error: any) {
        this.error = 'No fue posible cargar las métricas';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Carga el listado de clientes desde el backend
     * @param filters - Filtros opcionales (empresa, nombreContacto, correo)
     */
    async fetchClientes(filters: AdminClientesFilters = {}): Promise<void> {
      this.isLoadingClientes = true;
      this.error = null;

      try {
        const response = await getClientes(filters);
        this.clientes = response;
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'No fue posible cargar los clientes';
        this.clientes = [];
        throw error;
      } finally {
        this.isLoadingClientes = false;
      }
    },

    /**
     * Carga el detalle de un cliente específico
     * @param id - ID del cliente
     */
    async fetchCliente(id: string): Promise<void> {
      this.isLoadingClientes = true;
      this.error = null;

      try {
        const response = await getClienteById(id);
        this.clienteDetalle = response;
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'No fue posible cargar el cliente';
        this.clienteDetalle = null;
        throw error;
      } finally {
        this.isLoadingClientes = false;
      }
    },

    /**
     * Limpia el detalle del cliente
     */
    clearClienteDetalle(): void {
      this.clienteDetalle = null;
    },

    /**
     * Carga el listado de cotizaciones admin con filtros y paginación
     * @param filters - Filtros opcionales (estado, sedeId, search, fechas, página, límite)
     */
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

    /**
     * Carga el detalle de una cotización específica
     * @param id - ID de la cotización
     */
    async fetchCotizacionAdmin(id: string): Promise<void> {
      this.isLoadingCotizaciones = true;
      this.error = null;

      try {
        const response = await getCotizacionAdminById(id);
        this.cotizacionDetalle = response;
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

    /**
     * Limpia el detalle de la cotización
     */
    clearCotizacionDetalle(): void {
      this.cotizacionDetalle = null;
    },

    /**
     * Carga el listado de órdenes de trabajo admin con filtros y paginación
     * @param filters - Filtros opcionales (clienteId, sedeId, estado, fechas, página, límite)
     */
    async fetchOrdenesAdmin(filters: AdminOrdenesFilters = {}): Promise<void> {
      this.isLoadingOrdenes = true;
      this.error = null;

      try {
        const response = await getOrdenesAdmin(filters);
        this.ordenes = response.data;
        this.ordenesPagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible cargar las órdenes de trabajo';
        this.ordenes = [];
        this.ordenesPagination = {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        };
        throw error;
      } finally {
        this.isLoadingOrdenes = false;
      }
    },

    /**
     * Carga el detalle de una orden de trabajo específica
     * @param id - ID de la orden de trabajo
     */
    async fetchOrdenAdmin(id: string): Promise<void> {
      this.isLoadingOrdenes = true;
      this.error = null;

      try {
        const response = await getOrdenAdminById(id);
        this.ordenDetalle = response;
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible cargar la orden de trabajo';
        this.ordenDetalle = null;
        throw error;
      } finally {
        this.isLoadingOrdenes = false;
      }
    },

    /**
     * Actualiza el estado y observaciones de una orden de trabajo
     * @param id - ID de la orden de trabajo
     * @param payload - Datos a actualizar (estado, observaciones)
     */
    async updateOrdenEstadoAdmin(
      id: string,
      payload: UpdateOrdenEstadoPayload,
    ): Promise<void> {
      this.isUpdatingOrden = true;
      this.error = null;

      try {
        const response = await updateOrdenEstado(id, payload);

        // Actualizar el detalle si está cargado
        if (this.ordenDetalle && this.ordenDetalle.id === id) {
          this.ordenDetalle = response;
        }

        // Actualizar en el listado si existe
        const index = this.ordenes.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.ordenes[index] = {
            ...this.ordenes[index],
            estado: response.estado,
          };
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible actualizar la orden de trabajo';
        throw error;
      } finally {
        this.isUpdatingOrden = false;
      }
    },

    /**
     * Limpia el detalle de la orden
     */
    clearOrdenDetalle(): void {
      this.ordenDetalle = null;
    },

    /**
     * Carga los contadores del dashboard haciendo llamadas paralelas a los endpoints
     * Usa filtros por estado y limit=1 para obtener solo el total sin transferir datos innecesarios
     */
    async fetchDashboardCounters(): Promise<void> {
      this.isLoadingDashboard = true;
      this.error = null;

      try {
        // Realizar todas las llamadas en paralelo
        const [
          cotizacionesVigentes,
          cotizacionesVencidas,
          cotizacionesAceptadas,
          cotizacionesRechazadas,
          ordenesPendientes,
          ordenesEnProceso,
          ordenesCompletadas,
          ordenesCanceladas,
          clientes,
          servicios,
          sedes,
        ] = await Promise.all([
          getCotizacionesAdmin({ estado: 'vigente', limit: 1, page: 1 }),
          getCotizacionesAdmin({ estado: 'vencida', limit: 1, page: 1 }),
          getCotizacionesAdmin({ estado: 'aceptada', limit: 1, page: 1 }),
          getCotizacionesAdmin({ estado: 'rechazada', limit: 1, page: 1 }),
          getOrdenesAdmin({ estado: 'pendiente', limit: 1, page: 1 }),
          getOrdenesAdmin({ estado: 'en_proceso', limit: 1, page: 1 }),
          getOrdenesAdmin({ estado: 'completada', limit: 1, page: 1 }),
          getOrdenesAdmin({ estado: 'cancelada', limit: 1, page: 1 }),
          getClientes({}),
          getServicios(),
          getSedes(),
        ]);

        // Calcular total de usuarios clientes sumando totalUsuarios de cada cliente
        const totalUsuariosCliente = clientes.reduce(
          (sum, cliente) => sum + (cliente.totalUsuarios || 0),
          0,
        );

        // Construir objeto de contadores usando el campo 'total' de cada respuesta paginada
        // y contando arrays para clientes, servicios y sedes
        this.dashboardCounters = {
          cotizaciones: {
            vigentes: cotizacionesVigentes.total,
            vencidas: cotizacionesVencidas.total,
            aceptadas: cotizacionesAceptadas.total,
            rechazadas: cotizacionesRechazadas.total,
          },
          ordenes: {
            pendientes: ordenesPendientes.total,
            enProceso: ordenesEnProceso.total,
            completadas: ordenesCompletadas.total,
            canceladas: ordenesCanceladas.total,
          },
          totales: {
            clientesActivos: clientes.length,
            servicios: servicios.length,
            usuariosCliente: totalUsuariosCliente,
            sedes: sedes.length,
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

    /**
     * Limpia los contadores del dashboard
     */
    clearDashboardCounters(): void {
      this.dashboardCounters = null;
    },
  },
});
