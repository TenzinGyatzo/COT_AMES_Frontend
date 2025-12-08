/**
 * Composable para manejo de la lógica del cotizador
 * Encapsula la interacción con el store del cotizador
 * Expone métodos y datos de forma reactiva para usar en componentes
 */

import { storeToRefs } from 'pinia';
import { useCotizadorStore } from '../store/cotizador';

export function useCotizador() {
  const cotizadorStore = useCotizadorStore();
  const {
    sedes,
    servicios,
    selectedSedeId,
    cantidadesPorServicio,
    isLoading,
    error,
    ultimaRespuesta,
  } = storeToRefs(cotizadorStore);

  /**
   * Carga todas las sedes disponibles
   */
  const cargarSedes = async (): Promise<void> => {
    await cotizadorStore.fetchSedes();
  };

  /**
   * Carga los servicios de una sede específica
   * @param sedeId - ID de la sede
   */
  const cargarServiciosPorSede = async (sedeId: string): Promise<void> => {
    cotizadorStore.selectedSedeId = sedeId;
    await cotizadorStore.fetchServicios(sedeId);
  };

  /**
   * Actualiza la cantidad seleccionada para un servicio
   * @param servicioId - ID del servicio
   * @param cantidad - Nueva cantidad
   */
  const actualizarCantidad = (servicioId: string, cantidad: number): void => {
    cotizadorStore.setCantidad(servicioId, cantidad);
  };

  /**
   * Envía la cotización al backend usando el endpoint autenticado
   * @param datosCliente - Datos del cliente (debe incluir correo)
   */
  const enviarCotizacion = async (datosCliente: {
    empresa?: string;
    nombreContacto?: string;
    correo: string;
    telefono?: string;
  }): Promise<void> => {
    // Usar endpoint autenticado del portal cliente
    await cotizadorStore.crearCotizacionAutenticada(datosCliente.correo);
  };

  /**
   * Valida que el formulario esté completo antes de enviar
   */
  const validarFormulario = (datosCliente: {
    correo: string;
    empresa?: string;
    nombreContacto?: string;
    telefono?: string;
  }): boolean => {
    if (!cotizadorStore.selectedSedeId) {
      return false;
    }

    if (!datosCliente.correo) {
      return false;
    }

    const tieneServicios = Object.values(
      cotizadorStore.cantidadesPorServicio,
    ).some((cantidad) => cantidad > 0);

    return tieneServicios;
  };

  return {
    // Datos reactivos
    sedes,
    servicios,
    selectedSedeId,
    cantidadesPorServicio,
    isLoading,
    error,
    ultimaRespuesta,
    // Métodos
    cargarSedes,
    cargarServiciosPorSede,
    actualizarCantidad,
    enviarCotizacion,
    validarFormulario,
  };
}
