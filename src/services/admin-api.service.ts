/**
 * Servicio HTTP para el Panel de Administración AMES
 */

import httpClient from './http';
import type {
  Cliente,
  Contacto,
  Servicio,
  Plantilla,
  CotizacionDetalleDto,
  PaginatedCotizacionesResponseDto,
  Tenant,
  TenantConfigResponse,
} from '../types/backend';
import type { CategoriaServicioCode } from '../constants/categorias-servicio';

export interface AdminClientesFilters {
  empresa?: string;
  razonSocial?: string;
  rfc?: string;
  /** Omitido = solo activos. false = inactivos. */
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedClientesResponse {
  data: Cliente[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCotizacionesFilters {
  estado?: 'vigente' | 'vencida' | 'aceptada' | 'rechazada';
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

export interface AdminServiciosFilters {
  nombre?: string;
  categoria?: CategoriaServicioCode;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedServiciosResponse {
  data: Servicio[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateServicioPayload {
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  categoria: CategoriaServicioCode;
  moneda?: string;
  activo?: boolean;
}

export async function getClientes(
  filters: AdminClientesFilters = {},
): Promise<PaginatedClientesResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.empresa) params.empresa = filters.empresa;
  if (filters.razonSocial) params.razonSocial = filters.razonSocial;
  if (filters.rfc) params.rfc = filters.rfc;
  if (filters.activo !== undefined) params.activo = filters.activo;

  const { data } = await httpClient.get<PaginatedClientesResponse>(
    '/clientes',
    { params },
  );
  return data;
}

export async function getClienteById(id: string): Promise<Cliente> {
  const { data } = await httpClient.get<Cliente>(`/clientes/${id}`);
  return data;
}

export type CreateClientePayload = {
  empresa: string;
  razonSocial?: string;
  rfc?: string;
};

export type UpdateClientePayload = {
  empresa?: string;
  razonSocial?: string;
  rfc?: string;
};

/** POST cliente (Story 3.1). */
export async function createCliente(
  payload: CreateClientePayload,
): Promise<Cliente> {
  const { data } = await httpClient.post<Cliente>('/clientes', payload);
  return data;
}

/** PATCH cliente (Story 3.1). */
export async function updateCliente(
  id: string,
  payload: UpdateClientePayload,
): Promise<Cliente> {
  const { data } = await httpClient.patch<Cliente>(`/clientes/${id}`, payload);
  return data;
}

/** Soft delete (Story 3.2). */
export async function deleteCliente(id: string): Promise<Cliente> {
  const { data } = await httpClient.delete<Cliente>(`/clientes/${id}`);
  return data;
}

/** Activar / desactivar (Story 3.2). */
export async function toggleClienteActivo(id: string): Promise<Cliente> {
  const { data } = await httpClient.patch<Cliente>(
    `/clientes/${id}/toggle-activo`,
  );
  return data;
}

/* ——— Contactos CRM (Story 3.3) ——— */

export interface AdminContactosFilters {
  nombre?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedContactosResponse {
  data: Contacto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateContactoPayload = {
  nombre: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
};

export type UpdateContactoPayload = {
  nombre?: string;
  /** `null` o `''` limpia el campo en el BE. */
  correo?: string | null;
  telefono?: string | null;
  cargo?: string | null;
};

export async function getContactos(
  clienteId: string,
  filters: AdminContactosFilters = {},
): Promise<PaginatedContactosResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.nombre) params.nombre = filters.nombre;
  if (filters.activo !== undefined) params.activo = filters.activo;

  const { data } = await httpClient.get<PaginatedContactosResponse>(
    `/clientes/${clienteId}/contactos`,
    { params },
  );
  return data;
}

export async function getContactoById(
  clienteId: string,
  id: string,
): Promise<Contacto> {
  const { data } = await httpClient.get<Contacto>(
    `/clientes/${clienteId}/contactos/${id}`,
  );
  return data;
}

export async function createContacto(
  clienteId: string,
  payload: CreateContactoPayload,
): Promise<Contacto> {
  const { data } = await httpClient.post<Contacto>(
    `/clientes/${clienteId}/contactos`,
    payload,
  );
  return data;
}

export async function updateContacto(
  clienteId: string,
  id: string,
  payload: UpdateContactoPayload,
): Promise<Contacto> {
  const { data } = await httpClient.patch<Contacto>(
    `/clientes/${clienteId}/contactos/${id}`,
    payload,
  );
  return data;
}

export async function deleteContacto(
  clienteId: string,
  id: string,
): Promise<Contacto> {
  const { data } = await httpClient.delete<Contacto>(
    `/clientes/${clienteId}/contactos/${id}`,
  );
  return data;
}

export async function toggleContactoActivo(
  clienteId: string,
  id: string,
): Promise<Contacto> {
  const { data } = await httpClient.patch<Contacto>(
    `/clientes/${clienteId}/contactos/${id}/toggle-activo`,
  );
  return data;
}

export async function getCotizacionesAdmin(
  filters: AdminCotizacionesFilters = {},
): Promise<PaginatedCotizacionesResponseDto> {
  const {
    page = 1,
    limit = 10,
    estado,
    search,
    fechaDesde,
    fechaHasta,
  } = filters;

  const params: any = { page, limit };
  if (estado) params.estado = estado;
  if (search) params.search = search;
  if (fechaDesde) params.fechaDesde = fechaDesde;
  if (fechaHasta) params.fechaHasta = fechaHasta;

  const { data } = await httpClient.get<PaginatedCotizacionesResponseDto>(
    '/cotizaciones',
    { params },
  );
  return data;
}

export async function getCotizacionAdminById(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.get<CotizacionDetalleDto>(
    `/cotizaciones/${id}`,
  );
  return data;
}

export interface CreateAdminCotizacionPayload {
  clienteId?: string;
  nombreEmpresa?: string;
  nombreContacto?: string;
  emailContacto?: string;
  telefonoContacto?: string;
  personasAEvaluar?: string;
  items: Array<{
    servicioId: string;
    cantidad: number;
    /** Overrides de snapshot (Story 6.4) */
    nombre?: string;
    descripcion?: string;
    precioUnitario?: number;
  }>;
  moneda?: string;
  fechaVencimiento?: string;
  enviarEmail?: boolean;
  /** Destinatarios Para (Story 6.6). */
  emailsPara?: string[];
  /** Destinatarios CC (Story 6.6). */
  emailsCc?: string[];
  incluirDatosBancarios?: boolean;
  /** Plantillas ordenadas (Story 6.5). Omitido/vacío = ninguna. */
  plantillas?: Array<{
    plantillaId: string;
    nombre?: string;
    secciones?: Plantilla['secciones'];
  }>;
}

export async function createAdminCotizacion(
  payload: CreateAdminCotizacionPayload,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.post<CotizacionDetalleDto>(
    '/cotizaciones/admin',
    payload,
  );
  return data;
}

export type EnviarCorreoCotizacionOptions = {
  emailsPara?: string[];
  emailsCc?: string[];
};

/** Story 6.8 — envía PDF FE + magic link (multipart). */
export async function enviarCorreoCotizacion(
  id: string,
  pdf: Blob | File,
  options?: EnviarCorreoCotizacionOptions,
): Promise<{ ok: true; folio: string }> {
  const form = new FormData();
  const file =
    pdf instanceof File
      ? pdf
      : new File([pdf], `${id}.pdf`, { type: 'application/pdf' });
  form.append('file', file);
  if (options?.emailsPara) {
    form.append('emailsPara', JSON.stringify(options.emailsPara));
  }
  if (options?.emailsCc) {
    form.append('emailsCc', JSON.stringify(options.emailsCc));
  }
  const { data } = await httpClient.post<{ ok: true; folio: string }>(
    `/cotizaciones/${id}/enviar-correo`,
    form,
  );
  return data;
}

export interface AceptarCotizacionAdminPayload {
  // Legacy vacío: aceptación sin trabajadores (Story 1.1)
}

export async function aceptarCotizacionAdmin(
  id: string,
  payload: AceptarCotizacionAdminPayload = {},
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cotizaciones/${id}/admin/aceptar`,
    payload,
  );
  return data;
}

export async function rechazarCotizacionAdmin(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cotizaciones/${id}/admin/rechazar`,
  );
  return data;
}

/** Story 6.10 — cambio manual a cualquiera de los otros estados. */
export async function cambiarEstadoCotizacion(
  id: string,
  estado: 'vigente' | 'vencida' | 'aceptada' | 'rechazada',
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cotizaciones/${id}/estado`,
    { estado },
  );
  return data;
}

export type ModoPreciosRepetir = 'originales' | 'actualizados';

export type RepetirCotizacionWarning = {
  index: number;
  servicioId: string;
  motivo: 'inexistente' | 'inactivo';
};

export type RepetirCotizacionPayload = {
  modoPrecios: ModoPreciosRepetir;
  omitirServicioIds?: string[];
  sustituciones?: Array<{ fromServicioId: string; toServicioId: string }>;
  fechaVencimiento?: string;
};

/** Story 6.12 — clona cotización (precios originales o actualizados). */
export async function repetirCotizacion(
  id: string,
  payload: RepetirCotizacionPayload,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.post<CotizacionDetalleDto>(
    `/cotizaciones/${id}/repetir`,
    payload,
  );
  return data;
}

export async function getServicios(
  filters: AdminServiciosFilters = {},
): Promise<PaginatedServiciosResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.nombre?.trim()) params.nombre = filters.nombre.trim();
  if (filters.categoria) params.categoria = filters.categoria;
  if (filters.activo !== undefined) params.activo = filters.activo;

  const { data } = await httpClient.get<PaginatedServiciosResponse>(
    '/servicios',
    { params },
  );
  return data;
}

export async function createServicio(
  payload: CreateServicioPayload,
): Promise<Servicio> {
  const { data } = await httpClient.post<Servicio>('/servicios', payload);
  return data;
}

export interface CreateServicioMultiPayload extends CreateServicioPayload {
  tenantIds: string[];
}

export async function createServicioMulti(
  payload: CreateServicioMultiPayload,
): Promise<{ created: Servicio[] }> {
  const { data } = await httpClient.post<{ created: Servicio[] }>(
    '/servicios/multi-tenant',
    payload,
  );
  return data;
}

export interface UpdateServicioPayload {
  nombre?: string;
  descripcion?: string;
  precioUnitario?: number;
  categoria?: CategoriaServicioCode;
  moneda?: string;
  activo?: boolean;
}

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

export async function toggleServicioActivo(id: string): Promise<Servicio> {
  const { data } = await httpClient.patch<Servicio>(
    `/servicios/${id}/toggle-activo`,
  );
  return data;
}

export async function deleteServicio(id: string): Promise<Servicio> {
  const { data } = await httpClient.delete<Servicio>(`/servicios/${id}`);
  return data;
}

export interface AdminPlantillasFilters {
  nombre?: string;
  /** Omitido = solo activas. false = inactivas. */
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedPlantillasResponse {
  data: Plantilla[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePlantillaPayload {
  nombre: string;
  secciones: Plantilla['secciones'];
  activo?: boolean;
}

export interface UpdatePlantillaPayload {
  nombre?: string;
  secciones?: Plantilla['secciones'];
  activo?: boolean;
}

export async function getPlantillas(
  filters: AdminPlantillasFilters = {},
): Promise<PaginatedPlantillasResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.nombre?.trim()) params.nombre = filters.nombre.trim();
  if (filters.activo !== undefined) params.activo = filters.activo;

  const { data } = await httpClient.get<PaginatedPlantillasResponse>(
    '/plantillas',
    { params },
  );
  return data;
}

export async function getPlantilla(id: string): Promise<Plantilla> {
  const { data } = await httpClient.get<Plantilla>(`/plantillas/${id}`);
  return data;
}

export async function createPlantilla(
  payload: CreatePlantillaPayload,
): Promise<Plantilla> {
  const { data } = await httpClient.post<Plantilla>('/plantillas', payload);
  return data;
}

export async function updatePlantilla(
  id: string,
  payload: UpdatePlantillaPayload,
): Promise<Plantilla> {
  const { data } = await httpClient.patch<Plantilla>(
    `/plantillas/${id}`,
    payload,
  );
  return data;
}

export async function togglePlantillaActivo(id: string): Promise<Plantilla> {
  const { data } = await httpClient.patch<Plantilla>(
    `/plantillas/${id}/toggle-activo`,
  );
  return data;
}

export async function deletePlantilla(id: string): Promise<Plantilla> {
  const { data } = await httpClient.delete<Plantilla>(`/plantillas/${id}`);
  return data;
}

/** Listado de tenants activos (sin X-Tenant-Id; chicken-egg AD-2 / 1.7). */
export async function getTenants(): Promise<Tenant[]> {
  const { data } = await httpClient.get<Tenant[]>('/tenants');
  return data;
}

/** Configuración del tenant activo (admin + X-Tenant-Id). Story 2.1+. */
export async function getTenantConfig(): Promise<TenantConfigResponse> {
  const { data } = await httpClient.get<TenantConfigResponse>('/tenant-config');
  return data;
}

export type UpdateTenantBrandingPayload = {
  razonSocial?: string;
  rfc?: string;
  domicilio?: string;
  telefono?: string;
  emailContacto?: string;
  sitioWeb?: string;
};

/** PATCH branding / datos legales (Story 2.2). */
export async function updateTenantBranding(
  payload: UpdateTenantBrandingPayload,
): Promise<TenantConfigResponse> {
  const { data } = await httpClient.patch<TenantConfigResponse>(
    '/tenant-config/branding',
    payload,
  );
  return data;
}

/** Subir o reemplazar logo (multipart). */
export async function uploadTenantLogo(
  file: File,
): Promise<TenantConfigResponse> {
  const form = new FormData();
  form.append('file', file);
  // No setear Content-Type: el interceptor + browser añaden boundary.
  const { data } = await httpClient.post<TenantConfigResponse>(
    '/tenant-config/branding/logo',
    form,
  );
  return data;
}

/** Eliminar logo del tenant activo. */
export async function deleteTenantLogo(): Promise<TenantConfigResponse> {
  const { data } = await httpClient.delete<TenantConfigResponse>(
    '/tenant-config/branding/logo',
  );
  return data;
}

/** Subir o reemplazar logo del banco (Story 2.5). */
export async function uploadTenantBankLogo(
  file: File,
): Promise<TenantConfigResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await httpClient.post<TenantConfigResponse>(
    '/tenant-config/bancarios/logo',
    form,
  );
  return data;
}

/** Eliminar logo del banco. */
export async function deleteTenantBankLogo(): Promise<TenantConfigResponse> {
  const { data } = await httpClient.delete<TenantConfigResponse>(
    '/tenant-config/bancarios/logo',
  );
  return data;
}

export type UpdateTenantEmailPayload = {
  emailRemitente?: string;
  correosNotificacion?: string[];
};

/** PATCH remitente + correos de notificación (Story 2.3). */
export async function updateTenantEmailConfig(
  payload: UpdateTenantEmailPayload,
): Promise<TenantConfigResponse> {
  const { data } = await httpClient.patch<TenantConfigResponse>(
    '/tenant-config/email',
    payload,
  );
  return data;
}

export type UpdateTenantVigenciaBancariosPayload = {
  vigenciaDefaultDias?: number;
  bancarios?: {
    titular?: string;
    banco?: string;
    cuenta?: string;
    clabe?: string;
    domicilio?: string;
    rfc?: string;
    email?: string;
  };
};

/** PATCH vigencia default + datos bancarios (Story 2.4). */
export async function updateTenantVigenciaBancarios(
  payload: UpdateTenantVigenciaBancariosPayload,
): Promise<TenantConfigResponse> {
  const { data } = await httpClient.patch<TenantConfigResponse>(
    '/tenant-config/vigencia-bancarios',
    payload,
  );
  return data;
}

export interface AdminUser {
  _id: string;
  email: string;
  nombre: string;
  rol: 'operativo' | 'admin_sistema';
  tenantId?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUsersFilters {
  activo?: boolean;
  rol?: 'operativo' | 'admin_sistema';
  search?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  nombre: string;
  rol: 'operativo' | 'admin_sistema';
  tenantId?: string;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  nombre?: string;
  rol?: 'operativo' | 'admin_sistema';
  tenantId?: string | null;
  activo?: boolean;
}

export async function getUsers(
  filters: AdminUsersFilters = {},
): Promise<AdminUser[]> {
  const params: Record<string, string | boolean> = {};
  if (filters.activo !== undefined) params.activo = filters.activo;
  if (filters.rol) params.rol = filters.rol;
  if (filters.search) params.search = filters.search;
  const { data } = await httpClient.get<AdminUser[]>('/users', { params });
  return data;
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<AdminUser> {
  const { data } = await httpClient.post<AdminUser>('/users', payload);
  return data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<AdminUser> {
  const { data } = await httpClient.patch<AdminUser>(`/users/${id}`, payload);
  return data;
}

export async function deactivateUser(id: string): Promise<AdminUser> {
  const { data } = await httpClient.delete<AdminUser>(`/users/${id}`);
  return data;
}
