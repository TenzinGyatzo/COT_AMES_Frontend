/**
 * Composable para manejo de la lógica de administración
 * Encapsula la interacción con el store admin
 * Expone métodos y datos de forma reactiva para usar en componentes
 */

import { storeToRefs } from 'pinia';
import { useAdminStore } from '../store/admin';
import type {
  AdminClientesFilters,
  AdminCotizacionesFilters,
  AdminOrdenesFilters,
  UpdateOrdenEstadoPayload,
} from '../services/admin-api.service';

export function useAdmin() {
  const adminStore = useAdminStore();
  const {
    // Cotizaciones
    resumenCotizaciones,
    cotizacionDetalle,
    cotizacionesPagination,
    isLoadingCotizaciones,

    // Clientes
    clientes,
    clienteDetalle,
    isLoadingClientes,

    // Órdenes
    ordenes,
    ordenDetalle,
    ordenesPagination,
    isLoadingOrdenes,
    isUpdatingOrden,

    // Métricas
    metricasClientes,
    metricasServicios,
    metricasTotales,

    // Dashboard
    dashboardCounters,
    isLoadingDashboard,

    // Estados generales
    isLoading,
    error,
  } = storeToRefs(adminStore);

  /**
   * Carga el resumen de cotizaciones (método legacy para compatibilidad)
   * @param estado - Estado de las cotizaciones a filtrar (opcional)
   */
  const obtenerCotizaciones = async (
    estado?: 'vigente' | 'vencida',
  ): Promise<void> => {
    await adminStore.fetchResumenCotizaciones(estado);
  };

  /**
   * Carga cotizaciones admin con filtros completos y paginación
   * @param filters - Filtros opcionales (estado, sedeId, search, fechas, página, límite)
   */
  const obtenerCotizacionesAdmin = async (
    filters: AdminCotizacionesFilters = {},
  ): Promise<void> => {
    await adminStore.fetchCotizacionesAdmin(filters);
  };

  /**
   * Carga el detalle de una cotización específica
   * @param id - ID de la cotización
   */
  const obtenerCotizacionAdmin = async (id: string): Promise<void> => {
    await adminStore.fetchCotizacionAdmin(id);
  };

  /**
   * Limpia el detalle de la cotización
   */
  const limpiarCotizacionDetalle = (): void => {
    adminStore.clearCotizacionDetalle();
  };

  /**
   * Carga el listado de clientes
   * @param filters - Filtros opcionales (empresa, nombreContacto, correo)
   */
  const obtenerClientes = async (
    filters: AdminClientesFilters = {},
  ): Promise<void> => {
    await adminStore.fetchClientes(filters);
  };

  /**
   * Carga el detalle de un cliente específico
   * @param id - ID del cliente
   */
  const obtenerCliente = async (id: string): Promise<void> => {
    await adminStore.fetchCliente(id);
  };

  /**
   * Limpia el detalle del cliente
   */
  const limpiarClienteDetalle = (): void => {
    adminStore.clearClienteDetalle();
  };

  /**
   * Carga el listado de órdenes de trabajo admin
   * @param filters - Filtros opcionales (clienteId, sedeId, estado, fechas, página, límite)
   */
  const obtenerOrdenesAdmin = async (
    filters: AdminOrdenesFilters = {},
  ): Promise<void> => {
    await adminStore.fetchOrdenesAdmin(filters);
  };

  /**
   * Carga el detalle de una orden de trabajo específica
   * @param id - ID de la orden de trabajo
   */
  const obtenerOrdenAdmin = async (id: string): Promise<void> => {
    await adminStore.fetchOrdenAdmin(id);
  };

  /**
   * Actualiza el estado y observaciones de una orden de trabajo
   * @param id - ID de la orden de trabajo
   * @param payload - Datos a actualizar (estado, observaciones)
   */
  const actualizarOrdenEstado = async (
    id: string,
    payload: UpdateOrdenEstadoPayload,
  ): Promise<void> => {
    await adminStore.updateOrdenEstadoAdmin(id, payload);
  };

  /**
   * Limpia el detalle de la orden
   */
  const limpiarOrdenDetalle = (): void => {
    adminStore.clearOrdenDetalle();
  };

  /**
   * Carga todas las métricas (clientes, servicios y totales)
   * @param filters - Filtros opcionales (sedeId, fechaDesde, fechaHasta)
   */
  const obtenerMetricas = async (filters?: {
    sedeId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<void> => {
    await adminStore.fetchMetricas(filters);
  };

  /**
   * Carga los contadores del dashboard
   */
  const obtenerDashboardCounters = async (): Promise<void> => {
    await adminStore.fetchDashboardCounters();
  };

  /**
   * Limpia los contadores del dashboard
   */
  const limpiarDashboardCounters = (): void => {
    adminStore.clearDashboardCounters();
  };

  return {
    // Datos reactivos - Cotizaciones
    resumenCotizaciones,
    cotizacionDetalle,
    cotizacionesPagination,
    isLoadingCotizaciones,

    // Datos reactivos - Clientes
    clientes,
    clienteDetalle,
    isLoadingClientes,

    // Datos reactivos - Órdenes
    ordenes,
    ordenDetalle,
    ordenesPagination,
    isLoadingOrdenes,
    isUpdatingOrden,

    // Datos reactivos - Métricas
    metricasClientes,
    metricasServicios,
    metricasTotales,

    // Datos reactivos - Dashboard
    dashboardCounters,
    isLoadingDashboard,

    // Estados generales
    isLoading,
    error,

    // Métodos - Cotizaciones
    obtenerCotizaciones, // Legacy
    obtenerCotizacionesAdmin,
    obtenerCotizacionAdmin,
    limpiarCotizacionDetalle,

    // Métodos - Clientes
    obtenerClientes,
    obtenerCliente,
    limpiarClienteDetalle,

    // Métodos - Órdenes
    obtenerOrdenesAdmin,
    obtenerOrdenAdmin,
    actualizarOrdenEstado,
    limpiarOrdenDetalle,

    // Métodos - Métricas
    obtenerMetricas,

    // Métodos - Dashboard
    obtenerDashboardCounters,
    limpiarDashboardCounters,
  };
}
