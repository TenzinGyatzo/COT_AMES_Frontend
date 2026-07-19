/**
 * Composable del cotizador admin AMES
 */

import { storeToRefs } from 'pinia';
import { useCotizadorStore } from '../store/cotizador';

export function useCotizador() {
  const cotizadorStore = useCotizadorStore();
  const { servicios, cantidadesPorServicio, isLoading, error } =
    storeToRefs(cotizadorStore);

  const cargarServicios = async (): Promise<void> => {
    await cotizadorStore.fetchServicios();
  };

  const actualizarCantidad = (servicioId: string, cantidad: number): void => {
    cotizadorStore.setCantidad(servicioId, cantidad);
  };

  const resetSelection = (): void => {
    cotizadorStore.resetSelection();
  };

  return {
    servicios,
    cantidadesPorServicio,
    isLoading,
    error,
    cargarServicios,
    actualizarCantidad,
    resetSelection,
  };
}
