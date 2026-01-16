/**
 * Servicio HTTP para el Panel de Administración
 * Encapsula las llamadas al backend específicas para usuarios admin autenticados
 */

import httpClient from './http';
import type {
  Cliente,
  UsuarioCliente,
  Servicio,
  Sede,
  CotizacionDetalleDto,
  PaginatedCotizacionesResponseDto,
  OrdenTrabajoDetalleDto,
  PaginatedOrdenesTrabajoResponseDto,
} from '../types/backend';

/**
 * Filtros para obtener clientes
 */
export interface AdminClientesFilters {
  empresa?: string;
  rfc?: string;
}

/**
 * Filtros para obtener cotizaciones admin
 */
export interface AdminCotizacionesFilters {
  estado?: 'vigente' | 'vencida' | 'aceptada' | 'rechazada';
  sedeId?: string;
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

/**
 * Filtros para obtener órdenes de trabajo admin
 */
export interface AdminOrdenesFilters {
  clienteId?: string;
  sedeId?: string;
  estado?: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

/**
 * Filtros para obtener servicios
 */
export interface AdminServiciosFilters {
  sedeId?: string;
  activo?: boolean;
}

/**
 * Payload para crear un servicio
 */
export interface CreateServicioPayload {
  sedeId: string;
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  moneda?: string;
  activo?: boolean;
}

/**
 * Payload para crear un servicio en todas las sedes
 */
export interface CreateServicioGlobalPayload {
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  moneda?: string;
  activo?: boolean;
}

/**
 * Payload para actualizar estado de orden
 */
export interface UpdateOrdenEstadoPayload {
  estado?: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  observaciones?: string;
}

/**
 * Obtiene el listado de clientes
 * @param filters Filtros opcionales (empresa, nombreContacto, correo)
 * @returns Lista de clientes
 */
export async function getClientes(
  filters: AdminClientesFilters = {},
): Promise<Cliente[]> {
  const { data } = await httpClient.get<Cliente[]>('/clientes', {
    params: filters,
  });

  return data;
}

/**
 * Obtiene el detalle de un cliente específico
 * @param id ID del cliente
 * @returns Detalle completo del cliente
 */
export async function getClienteById(id: string): Promise<Cliente> {
  const { data } = await httpClient.get<Cliente>(`/clientes/${id}`);

  return data;
}

/**
 * Obtiene los usuarios clientes asociados a un cliente
 * @param id ID del cliente
 * @returns Lista de usuarios clientes
 */
export async function getUsuariosByClienteId(
  id: string,
): Promise<UsuarioCliente[]> {
  const { data } = await httpClient.get<UsuarioCliente[]>(
    `/clientes/${id}/usuarios`,
  );

  return data;
}

/**
 * Obtiene el listado de cotizaciones admin con filtros y paginación
 * @param filters Filtros opcionales (estado, sedeId, search, fechas, página, límite)
 * @returns Respuesta paginada con las cotizaciones
 */
export async function getCotizacionesAdmin(
  filters: AdminCotizacionesFilters = {},
): Promise<PaginatedCotizacionesResponseDto> {
  const {
    page = 1,
    limit = 10,
    estado,
    sedeId,
    search,
    fechaDesde,
    fechaHasta,
  } = filters;

  const params: any = { page, limit };

  if (estado) {
    params.estado = estado;
  }
  if (sedeId) {
    params.sedeId = sedeId;
  }
  if (search) {
    params.search = search;
  }
  if (fechaDesde) {
    params.fechaDesde = fechaDesde;
  }
  if (fechaHasta) {
    params.fechaHasta = fechaHasta;
  }

  const { data } = await httpClient.get<PaginatedCotizacionesResponseDto>(
    '/cotizaciones',
    { params },
  );

  return data;
}

/**
 * Obtiene el detalle de una cotización específica
 * @param id ID de la cotización
 * @returns Detalle completo de la cotización
 */
export async function getCotizacionAdminById(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.get<CotizacionDetalleDto>(
    `/cotizaciones/${id}`,
  );

  return data;
}

/**
 * Payload para crear una cotización admin (para clientes no registrados)
 */
export interface CreateAdminCotizacionPayload {
  sedeId: string;
  nombreEmpresa: string;
  nombreContacto: string;
  emailContacto?: string;
  telefonoContacto?: string;
  items: Array<{
    servicioId: string;
    cantidad: number;
  }>;
  moneda?: string;
  fechaVencimiento?: string;
  enviarEmail?: boolean;
}

/**
 * Crea una nueva cotización para un cliente no registrado
 * @param payload Datos de la cotización y del cliente guest
 * @returns Cotización creada
 */
export async function createAdminCotizacion(
  payload: CreateAdminCotizacionPayload,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.post<CotizacionDetalleDto>(
    '/cotizaciones/admin',
    payload,
  );

  return data;
}

/**
 * Payload para aceptar cotización (admin)
 */
export interface AceptarCotizacionAdminPayload {
  trabajadores: Array<{
    primerApellido: string;
    segundoApellido?: string;
    nombre: string;
    fechaNacimiento: string;
    sexo: string;
    escolaridad: string;
    puesto: string;
    fechaIngreso?: string;
    telefono?: string;
    estadoCivil: string;
    curp?: string;
  }>;
}

/**
 * Acepta una cotización como administrador
 * @param id ID de la cotización
 * @param payload Datos para aceptar (trabajadores)
 * @returns Cotización actualizada
 */
export async function aceptarCotizacionAdmin(
  id: string,
  payload: AceptarCotizacionAdminPayload,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cotizaciones/${id}/admin/aceptar`,
    payload,
  );

  return data;
}

/**
 * Rechaza una cotización como administrador
 * @param id ID de la cotización
 * @returns Cotización actualizada
 */
export async function rechazarCotizacionAdmin(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cotizaciones/${id}/admin/rechazar`,
  );

  return data;
}

/**
 * Obtiene el listado de órdenes de trabajo admin con filtros y paginación
 * @param filters Filtros opcionales (clienteId, sedeId, estado, fechas, página, límite)
 * @returns Respuesta paginada con las órdenes de trabajo
 */
export async function getOrdenesAdmin(
  filters: AdminOrdenesFilters = {},
): Promise<PaginatedOrdenesTrabajoResponseDto> {
  const {
    page = 1,
    limit = 10,
    clienteId,
    sedeId,
    estado,
    search,
    fechaDesde,
    fechaHasta,
  } = filters;

  const params: any = { page, limit };

  if (clienteId) {
    params.clienteId = clienteId;
  }
  if (sedeId) {
    params.sedeId = sedeId;
  }
  if (estado) {
    params.estado = estado;
  }
  if (search) {
    params.search = search;
  }
  if (fechaDesde) {
    params.fechaDesde = fechaDesde;
  }
  if (fechaHasta) {
    params.fechaHasta = fechaHasta;
  }

  const { data } = await httpClient.get<PaginatedOrdenesTrabajoResponseDto>(
    '/ordenes-trabajo',
    { params },
  );

  return data;
}

/**
 * Obtiene el detalle de una orden de trabajo específica
 * @param id ID de la orden de trabajo
 * @returns Detalle completo de la orden de trabajo
 */
export async function getOrdenAdminById(
  id: string,
): Promise<OrdenTrabajoDetalleDto> {
  const { data } = await httpClient.get<OrdenTrabajoDetalleDto>(
    `/ordenes-trabajo/${id}`,
  );

  return data;
}

/**
 * Actualiza el estado y observaciones de una orden de trabajo
 * @param id ID de la orden de trabajo
 * @param payload Datos a actualizar (estado, observaciones)
 * @returns Orden de trabajo actualizada
 */
export async function updateOrdenEstado(
  id: string,
  payload: UpdateOrdenEstadoPayload,
): Promise<OrdenTrabajoDetalleDto> {
  const { data } = await httpClient.patch<OrdenTrabajoDetalleDto>(
    `/ordenes-trabajo/${id}`,
    payload,
  );

  return data;
}

/**
 * Obtiene el listado de servicios con filtros opcionales
 * @param filters Filtros opcionales (sedeId, activo)
 * @returns Lista de servicios
 */
export async function getServicios(
  filters: AdminServiciosFilters = {},
): Promise<Servicio[]> {
  const { sedeId, activo } = filters;

  const params: any = {};

  if (sedeId) {
    params.sedeId = sedeId;
  }
  if (activo !== undefined) {
    params.activo = activo;
  }

  const { data } = await httpClient.get<Servicio[]>('/servicios', {
    params,
  });

  return data;
}

/**
 * Crea un nuevo servicio
 * @param payload Datos del servicio a crear
 * @returns Servicio creado
 */
export async function createServicio(
  payload: CreateServicioPayload,
): Promise<Servicio> {
  const { data } = await httpClient.post<Servicio>('/servicios', payload);

  return data;
}

/**
 * Crea un servicio en todas las sedes
 * @param payload Datos del servicio a crear (sin sedeId)
 * @returns Lista de servicios creados (uno por cada sede)
 */
export async function createServicioForAllSedes(
  payload: CreateServicioGlobalPayload,
): Promise<Servicio[]> {
  const { data } = await httpClient.post<Servicio[]>(
    '/servicios/create-for-all-sedes',
    payload,
  );

  return data;
}

/**
 * Payload para actualizar un servicio
 */
export interface UpdateServicioPayload {
  sedeId?: string;
  nombre?: string;
  descripcion?: string;
  precioUnitario?: number;
  moneda?: string;
  activo?: boolean;
}

/**
 * Actualiza un servicio existente
 * @param id ID del servicio
 * @param payload Datos a actualizar
 * @returns Servicio actualizado
 */
export async function updateServicio(
  id: string,
  payload: UpdateServicioPayload,
): Promise<Servicio> {
  const { data } = await httpClient.patch<Servicio>(
    `/servicios/${id}`,
    payload,
  );

  return data;
}

/**
 * Activa o desactiva un servicio
 * @param id ID del servicio
 * @returns Servicio con estado actualizado
 */
export async function toggleServicioActivo(id: string): Promise<Servicio> {
  const { data } = await httpClient.patch<Servicio>(
    `/servicios/${id}/toggle-activo`,
  );

  return data;
}

/**
 * Elimina completamente un servicio de la base de datos
 * @param id ID del servicio
 */
export async function deleteServicio(id: string): Promise<void> {
  await httpClient.delete(`/servicios/${id}`);
}

/**
 * Obtiene el listado de sedes
 * @returns Lista de sedes
 */
export async function getSedes(): Promise<Sede[]> {
  const { data } = await httpClient.get<Sede[]>('/sedes');

  return data;
}

/**
 * Obtiene una sede por ID
 * @param id ID de la sede
 * @returns Detalle de la sede
 */
export async function getSedeById(id: string): Promise<Sede> {
  const { data } = await httpClient.get<Sede>(`/sedes/${id}`);

  return data;
}

/**
 * Payload para crear una sede
 */
import { EstadoMexico } from '../types/estado-mexico.enum';

export interface CreateSedePayload {
  clave?: string;
  ciudad: string;
  estado?: EstadoMexico;
  activo?: boolean;
}

/**
 * Payload para actualizar una sede
 */
export interface UpdateSedePayload {
  clave?: string;
  ciudad?: string;
  estado?: EstadoMexico;
  activo?: boolean;
}

/**
 * Crea una nueva sede
 * @param payload Datos de la sede a crear
 * @returns Sede creada
 */
export async function createSede(payload: CreateSedePayload): Promise<Sede> {
  const { data } = await httpClient.post<Sede>('/sedes', payload);

  return data;
}

/**
 * Actualiza una sede existente
 * @param id ID de la sede
 * @param payload Datos a actualizar
 * @returns Sede actualizada
 */
export async function updateSede(
  id: string,
  payload: UpdateSedePayload,
): Promise<Sede> {
  const { data } = await httpClient.patch<Sede>(`/sedes/${id}`, payload);

  return data;
}

/**
 * Activa o desactiva una sede
 * @param id ID de la sede
 * @returns Sede con estado actualizado
 */
export async function toggleSedeActivo(id: string): Promise<Sede> {
  const { data } = await httpClient.patch<Sede>(`/sedes/${id}/toggle-activo`);

  return data;
}
