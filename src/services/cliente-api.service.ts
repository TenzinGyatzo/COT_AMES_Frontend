/**
 * Servicio HTTP para el Portal Cliente
 * Encapsula las llamadas al backend específicas para usuarios cliente autenticados
 */

import httpClient from './http';
import type {
  PaginatedCotizacionesResponseDto,
  MiPerfilResponse,
  UpdateMiPerfilPayload,
  CotizacionDetalleDto,
  PaginatedOrdenesTrabajoResponseDto,
  OrdenTrabajoDetalleDto,
} from '../types/backend';

/**
 * Filtros para obtener las cotizaciones del cliente
 */
export interface MisCotizacionesFilters {
  estado?: string; // 'vigente' | 'vencida' | 'aceptada' | 'rechazada' | 'en_proceso' | 'completada'
  page?: number;
  limit?: number;
}

/**
 * Obtiene el listado de cotizaciones del cliente autenticado
 * @param filters Filtros opcionales (estado, página, límite)
 * @returns Respuesta paginada con las cotizaciones
 */
export async function getMisCotizaciones(
  filters: MisCotizacionesFilters = {},
): Promise<PaginatedCotizacionesResponseDto> {
  const { estado, page = 1, limit = 10 } = filters;

  const params: any = { page, limit };

  // Solo incluir estado si no es 'todas' o undefined
  if (estado && estado !== 'todas') {
    params.estado = estado;
  }

  const { data } = await httpClient.get<PaginatedCotizacionesResponseDto>(
    '/cliente-portal/mis-cotizaciones',
    { params },
  );

  return data;
}

/**
 * Obtiene el detalle de una cotización específica del cliente autenticado
 * @param id ID de la cotización
 * @returns Detalle completo de la cotización
 */
export async function getCotizacionById(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.get<CotizacionDetalleDto>(
    `/cliente-portal/mis-cotizaciones/${id}`,
  );

  return data;
}

/**
 * Obtiene el perfil del cliente autenticado
 * @returns Datos del usuario cliente y su empresa
 */
export async function getMiPerfil(): Promise<MiPerfilResponse> {
  const { data } = await httpClient.get<MiPerfilResponse>(
    '/cliente-portal/mi-perfil',
  );

  return data;
}

/**
 * Actualiza el perfil del cliente autenticado
 * @param payload Datos a actualizar (nombre, email, telefono)
 * @returns Perfil actualizado
 */
export async function updateMiPerfil(
  payload: UpdateMiPerfilPayload,
): Promise<MiPerfilResponse> {
  const { data } = await httpClient.patch<MiPerfilResponse>(
    '/cliente-portal/mi-perfil',
    payload,
  );

  return data;
}

/**
 * Acepta una cotización del cliente autenticado
 * @param id ID de la cotización a aceptar
 * @returns Cotización actualizada
 */
export async function aceptarCotizacion(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cliente-portal/mis-cotizaciones/${id}/aceptar`,
  );

  return data;
}

/**
 * Rechaza una cotización del cliente autenticado
 * @param id ID de la cotización a rechazar
 * @returns Cotización actualizada
 */
export async function rechazarCotizacion(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cliente-portal/mis-cotizaciones/${id}/rechazar`,
  );

  return data;
}

/**
 * Repite una cotización del cliente autenticado
 * @param id ID de la cotización a repetir
 * @returns Nueva cotización generada
 */
export async function repetirCotizacion(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.post<CotizacionDetalleDto>(
    `/cliente-portal/cotizaciones/${id}/repetir`,
  );

  return data;
}

/**
 * Filtros para obtener las órdenes de trabajo del cliente
 */
export interface MisOrdenesFilters {
  estado?: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

/**
 * Obtiene el listado de órdenes de trabajo del cliente autenticado
 * @param filters Filtros opcionales (estado, fechaDesde, fechaHasta, página, límite)
 * @returns Respuesta paginada con las órdenes de trabajo
 */
export async function getMisOrdenes(
  filters: MisOrdenesFilters = {},
): Promise<PaginatedOrdenesTrabajoResponseDto> {
  const { estado, fechaDesde, fechaHasta, page = 1, limit = 10 } = filters;

  const params: any = { page, limit };

  if (estado) {
    params.estado = estado;
  }

  if (fechaDesde) {
    params.fechaDesde = fechaDesde;
  }

  if (fechaHasta) {
    params.fechaHasta = fechaHasta;
  }

  const { data } = await httpClient.get<PaginatedOrdenesTrabajoResponseDto>(
    '/cliente-portal/mis-ordenes',
    { params },
  );

  return data;
}

/**
 * Obtiene el detalle de una orden de trabajo específica del cliente autenticado
 * @param id ID de la orden de trabajo
 * @returns Detalle completo de la orden de trabajo
 */
export async function getOrdenById(
  id: string,
): Promise<OrdenTrabajoDetalleDto> {
  const { data } = await httpClient.get<OrdenTrabajoDetalleDto>(
    `/cliente-portal/mis-ordenes/${id}`,
  );

  return data;
}
