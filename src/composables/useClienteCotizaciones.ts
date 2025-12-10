/**
 * Composable para manejo de la lógica de las cotizaciones del cliente
 * Encapsula la interacción con el store de cotizaciones del cliente
 * Expone métodos y datos de forma reactiva para usar en componentes
 */

import { storeToRefs } from 'pinia';
import { useClienteCotizacionesStore } from '../store/cliente-cotizaciones';
import type { MisCotizacionesFilters } from '../services/cliente-api.service';
import type { CotizacionDetalleDto } from '../types/backend';

export function useClienteCotizaciones() {
  const clienteCotizacionesStore = useClienteCotizacionesStore();
  const {
    listado,
    detalle,
    isLoading,
    isActionLoading,
    isRepeatLoading,
    error,
    pagination,
  } = storeToRefs(clienteCotizacionesStore);

  /**
   * Carga el listado de cotizaciones del cliente autenticado
   * @param filters - Filtros opcionales (estado, página, límite)
   */
  const fetchMisCotizaciones = async (
    filters?: MisCotizacionesFilters,
  ): Promise<void> => {
    await clienteCotizacionesStore.fetchMisCotizaciones(filters);
  };

  /**
   * Carga el detalle de una cotización específica del cliente autenticado
   * @param id - ID de la cotización
   */
  const fetchCotizacion = async (id: string): Promise<void> => {
    await clienteCotizacionesStore.fetchCotizacion(id);
  };

  /**
   * Limpia el detalle del estado
   */
  const clearDetalle = (): void => {
    clienteCotizacionesStore.clearDetalle();
  };

  /**
   * Acepta una cotización del cliente autenticado
   * @param id - ID de la cotización a aceptar
   * @param trabajadores - Array de trabajadores para la orden de trabajo
   */
  const aceptarCotizacion = async (
    id: string,
    trabajadores: any[],
  ): Promise<void> => {
    await clienteCotizacionesStore.aceptarCotizacion(id, trabajadores);
  };

  /**
   * Rechaza una cotización del cliente autenticado
   * @param id - ID de la cotización a rechazar
   */
  const rechazarCotizacion = async (id: string): Promise<void> => {
    await clienteCotizacionesStore.rechazarCotizacion(id);
  };

  /**
   * Repite una cotización del cliente autenticado
   * @param id - ID de la cotización a repetir
   * @returns Cotización completa creada
   */
  const repetirCotizacion = async (
    id: string,
  ): Promise<CotizacionDetalleDto> => {
    return await clienteCotizacionesStore.repetirCotizacion(id);
  };

  return {
    // Datos reactivos
    listado,
    detalle,
    isLoading,
    isActionLoading,
    isRepeatLoading,
    error,
    pagination,
    // Métodos
    fetchMisCotizaciones,
    fetchCotizacion,
    clearDetalle,
    aceptarCotizacion,
    rechazarCotizacion,
    repetirCotizacion,
  };
}
