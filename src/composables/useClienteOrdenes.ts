/**
 * Composable para manejo de la lógica de las órdenes de trabajo del cliente
 * Encapsula la interacción con el store de órdenes de trabajo del cliente
 * Expone métodos y datos de forma reactiva para usar en componentes
 */

import { storeToRefs } from 'pinia';
import { useClienteOrdenesStore } from '../store/cliente-ordenes';
import type { MisOrdenesFilters } from '../services/cliente-api.service';

export function useClienteOrdenes() {
  const clienteOrdenesStore = useClienteOrdenesStore();
  const {
    listado,
    detalle,
    isLoading,
    detalleLoading,
    error,
    detalleError,
    pagination,
  } = storeToRefs(clienteOrdenesStore);

  /**
   * Carga el listado de órdenes de trabajo del cliente autenticado
   * @param filters - Filtros opcionales (estado, fechaDesde, fechaHasta, página, límite)
   */
  const fetchMisOrdenes = async (
    filters?: MisOrdenesFilters,
  ): Promise<void> => {
    await clienteOrdenesStore.fetchMisOrdenes(filters);
  };

  /**
   * Carga el detalle de una orden de trabajo específica del cliente autenticado
   * @param id - ID de la orden de trabajo
   */
  const fetchOrden = async (id: string): Promise<void> => {
    await clienteOrdenesStore.fetchOrden(id);
  };

  /**
   * Limpia el detalle del estado
   */
  const clearDetalle = (): void => {
    clienteOrdenesStore.clearDetalle();
  };

  /**
   * Limpia el estado del store
   */
  const clear = (): void => {
    clienteOrdenesStore.clear();
  };

  return {
    // Datos reactivos
    ordenes: listado,
    detalle,
    isLoading,
    detalleLoading,
    error,
    detalleError,
    pagination,
    // Métodos
    fetchMisOrdenes,
    fetchOrden,
    clearDetalle,
    clear,
  };
}
