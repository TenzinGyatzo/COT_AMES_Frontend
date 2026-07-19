/**
 * Composable para manejo de la lógica de administración AMES
 */

import { storeToRefs } from 'pinia';
import { useAdminStore } from '../store/admin';
import type {
  AdminClientesFilters,
  AdminCotizacionesFilters,
} from '../services/admin-api.service';

export function useAdmin() {
  const adminStore = useAdminStore();
  const {
    resumenCotizaciones,
    cotizacionDetalle,
    cotizacionesPagination,
    isLoadingCotizaciones,
    clientes,
    clientesPagination,
    clienteDetalle,
    isLoadingClientes,
    metricasClientes,
    metricasServicios,
    metricasTotales,
    dashboardCounters,
    isLoadingDashboard,
    isLoading,
    error,
  } = storeToRefs(adminStore);

  const obtenerCotizaciones = async (
    estado?: 'vigente' | 'vencida',
  ): Promise<void> => {
    await adminStore.fetchResumenCotizaciones(estado);
  };

  const obtenerCotizacionesAdmin = async (
    filters: AdminCotizacionesFilters = {},
  ): Promise<void> => {
    await adminStore.fetchCotizacionesAdmin(filters);
  };

  const obtenerCotizacionAdmin = async (id: string): Promise<void> => {
    await adminStore.fetchCotizacionAdmin(id);
  };

  const limpiarCotizacionDetalle = (): void => {
    adminStore.clearCotizacionDetalle();
  };

  const obtenerClientes = async (
    filters: AdminClientesFilters = {},
  ): Promise<void> => {
    await adminStore.fetchClientes(filters);
  };

  const obtenerCliente = async (id: string): Promise<void> => {
    await adminStore.fetchCliente(id);
  };

  const limpiarClienteDetalle = (): void => {
    adminStore.clearClienteDetalle();
  };

  const obtenerMetricas = async (filters?: {
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<void> => {
    await adminStore.fetchMetricas(filters);
  };

  const obtenerDashboardCounters = async (): Promise<void> => {
    await adminStore.fetchDashboardCounters();
  };

  const limpiarDashboardCounters = (): void => {
    adminStore.clearDashboardCounters();
  };

  return {
    resumenCotizaciones,
    cotizacionDetalle,
    cotizacionesPagination,
    isLoadingCotizaciones,
    clientes,
    clientesPagination,
    clienteDetalle,
    isLoadingClientes,
    metricasClientes,
    metricasServicios,
    metricasTotales,
    dashboardCounters,
    isLoadingDashboard,
    isLoading,
    error,
    obtenerCotizaciones,
    obtenerCotizacionesAdmin,
    obtenerCotizacionAdmin,
    limpiarCotizacionDetalle,
    obtenerClientes,
    obtenerCliente,
    limpiarClienteDetalle,
    obtenerMetricas,
    obtenerDashboardCounters,
    limpiarDashboardCounters,
  };
}
