/**
 * Tipos TypeScript alineados con los DTOs y schemas del backend
 * Estos tipos representan las estructuras de datos que se intercambian con la API
 */

import type { CategoriaServicioCode } from '../constants/categorias-servicio';

/** Tenant AMES (Story 1.2) */
export interface Tenant {
  _id?: string;
  nombre: string;
  clave: string;
  activo?: boolean;
}

/** Totales CRM del dashboard home (Story 7.3) */
export interface DashboardEntityTotals {
  clientes: number;
  contactos: number;
  usuarios: number;
  servicios: number;
}

/** Branding / datos legales por tenant (Story 2.2) */
export interface TenantBranding {
  logoUrl?: string;
  razonSocial?: string;
  rfc?: string;
  domicilio?: string;
  telefono?: string;
  emailContacto?: string;
  sitioWeb?: string;
}

/** Datos bancarios por tenant (Story 2.4 / 2.5) */
export interface TenantBancarios {
  /** Logo del banco (≠ branding.logoUrl) */
  logoUrl?: string;
  titular?: string;
  banco?: string;
  cuenta?: string;
  clabe?: string;
  domicilio?: string;
  rfc?: string;
  email?: string;
}

/** Configuración por tenant (Stories 2.1–2.5) */
export interface TenantConfigResponse {
  _id: string;
  tenantId: string;
  branding?: TenantBranding;
  emailRemitente?: string;
  correosNotificacion?: string[];
  vigenciaDefaultDias?: number;
  bancarios?: TenantBancarios;
  createdAt?: string;
  updatedAt?: string;
}

// Tipo para un servicio médico
export interface Servicio {
  _id?: string;
  tenantId?: string;
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  /** Categoría fija MED…OTR (Story 4.1). Legacy backfill → OTR. */
  categoria: CategoriaServicioCode;
  moneda?: string;
  activo?: boolean;
}

/** Sección plantilla PDF JSON v1 (Story 5.1 / AD-6). TipTap doc en 5.3. */
export type SeccionPlantilla =
  | {
      id: string;
      tipo: 'richtext';
      titulo?: string;
      cuerpo: { text: string; doc?: Record<string, unknown> };
    }
  | {
      id: string;
      tipo: 'tabla';
      titulo?: string;
      encabezados: string[];
      filas: string[][];
    };

/** Plantilla PDF maestra por tenant (Story 5.2 / FR-47). */
export interface Plantilla {
  _id?: string;
  tenantId?: string;
  nombre: string;
  claveSeed?: string;
  schemaVersion?: number;
  secciones: SeccionPlantilla[];
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Tipo para un cliente
export interface Cliente {
  _id?: string;
  tenantId?: string;
  empresa: string;
  /** Nombre fiscal opcional (Story 3.5). */
  razonSocial?: string;
  rfc?: string;
  activo?: boolean;
  totalCotizaciones?: number;
}

/** Contacto CRM de un cliente (Story 3.3). Sin login. */
export interface Contacto {
  _id?: string;
  tenantId?: string;
  clienteId?: string;
  nombre: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
  activo?: boolean;
}

// Tipo para un item dentro de una cotización
export interface ItemCotizacion {
  servicioId: string;
  nombreServicioSnapshot?: string;
  descripcionServicioSnapshot?: string;
  precioUnitarioSnapshot?: number;
  cantidad: number;
  subtotal: number;
}

// Tipo para una cotización completa
export interface Cotizacion {
  _id?: string;
  tenantId?: string;
  folio: string;
  clienteId: string;
  emailContacto: string;
  items: ItemCotizacion[];
  total: number;
  moneda?: string;
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  sinVigencia?: boolean;
  estado: 'vigente' | 'vencida';
  pdfUrl?: string;
}

// Tipo para crear una cotización pública (sin autenticación)
export interface CreatePublicCotizacionDto {
  empresa?: string;
  nombreContacto?: string;
  correo: string;
  telefono?: string;
  items: Array<{
    servicioId: string;
    cantidad: number;
  }>;
}

/** DTO público magic link (Story 6.9) — sin token/tenant/emails. */
export interface PublicCotizacionItem {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PublicCotizacionBranding {
  razonSocial?: string;
  logoUrl?: string;
}

export interface PublicCotizacionResponse {
  folio: string;
  estado: 'vigente' | 'vencida' | 'aceptada' | 'rechazada' | string;
  total: number;
  moneda: string;
  fechaCreacion: string;
  fechaVencimiento?: string;
  sinVigencia?: boolean;
  fechaAceptacion?: string;
  fechaRechazo?: string;
  nombreEmpresa?: string;
  nombreContacto?: string;
  telefonoContacto?: string;
  /** Story 6.16 — snapshot correo para PDF guest */
  emailContacto?: string;
  /** Story 6.16 — snapshot cargo CRM para PDF */
  cargoContacto?: string;
  items: PublicCotizacionItem[];
  branding?: PublicCotizacionBranding;
  alreadyResponded?: boolean;
}

// Tipo para un usuario del sistema
export type AmesRole = 'operativo' | 'admin_sistema';

export interface User {
  _id: string;
  email: string;
  nombre: string;
  rol: AmesRole;
  /** Alineado al rol (compat); preferir `rol`. */
  tipoUsuario: AmesRole;
  /** Opcional hasta roles tenant en 1.3/1.6 */
  tenantId?: string;
  activo?: boolean;
}

// Tipo para la respuesta del login
export interface LoginResponse {
  access_token: string;
  user: User;
}

// Tipo para métricas de clientes
export interface ClientMetricDto {
  clienteId: string;
  empresa?: string;
  rfc: string;
  fechaUltimaCotizacion?: Date;
  totalCotizaciones: number;
}

// Tipo para métricas de servicios
export interface ServiceMetricDto {
  servicioId: string;
  nombreServicio: string;
  precioUnitario: number;
  vecesContratado: number;
}

// Tipo para cliente solicitante en métricas totales
export interface ClienteSolicitanteDto {
  clienteId: string;
  empresa?: string;
  rfc: string;
  totalCotizaciones: number;
}

// Tipo para servicio solicitado en métricas totales
export interface ServicioSolicitadoDto {
  servicioId: string;
  nombreServicio: string;
  vecesSolicitado: number;
}

// Tipo para servicio rentable en métricas totales
export interface ServicioRentableDto {
  servicioId: string;
  nombreServicio: string;
  ingresosTotales: number;
}

// Tipo para métricas totales
export interface TotalsMetricDto {
  mayorSolicitante?: ClienteSolicitanteDto;
  clienteMasActivoMes?: ClienteSolicitanteDto;
  servicioMasSolicitado?: ServicioSolicitadoDto;
  servicioMasRentable?: ServicioRentableDto;
  cotizacionesHoy: number;
  cotizacionesMes: number;
  cotizacionesAnio: number;
  cotizacionesTotales: number;
  /** Story 7.1 / FR-43 — emitidas = match del periodo (= cotizacionesTotales). */
  cotizacionesEmitidas: number;
  cotizacionesAceptadas: number;
  cotizacionesRechazadas: number;
  /** aceptadas / emitidas */
  tasaConversion: number;
  ingresosTotales: number;
}

// Tipo para un item de cotización en la lista
export interface CotizacionListItemDto {
  id: string;
  folio: string;
  fecha: Date;
  montoTotal: number;
  empresa?: string;
  nombreSolicitante?: string;
  /** RFC del cliente CRM (vacío en guest). */
  rfc?: string;
  estado: string;
  pdfUrl?: string;
  fechaAceptacion?: Date;
  fechaRechazo?: Date;
}

// Tipo para respuesta paginada de cotizaciones
export interface PaginatedCotizacionesResponseDto {
  data: CotizacionListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipo para el detalle completo de una cotización (con campos poblados)
export interface CotizacionDetalleDto {
  _id: string;
  tenantId?: string;
  folio: string;
  clienteId: string | Cliente; // Puede ser string o objeto Cliente poblado
  emailContacto: string;
  items: Array<{
    servicioId: string | Servicio; // Puede ser string o objeto Servicio poblado
    nombreServicioSnapshot: string;
    descripcionServicioSnapshot?: string;
    precioUnitarioSnapshot: number;
    cantidad: number;
    subtotal: number;
  }>;
  total: number;
  moneda?: string;
  fechaCreacion: Date | string;
  fechaVencimiento?: Date | string;
  /** Story 6.15 */
  sinVigencia?: boolean;
  estado:
    | 'vigente'
    | 'vencida'
    | 'aceptada'
    | 'rechazada'
    | 'en_proceso'
    | 'completada';
  fechaAceptacion?: Date | string;
  fechaRechazo?: Date | string;
  fechaEstadoVigente?: Date | string;
  fechaEstadoVencida?: Date | string;
  fechaEstadoAceptada?: Date | string;
  fechaEstadoRechazada?: Date | string;
  /** Story 6.9/6.10 — origen del último cambio de estado */
  estadoOrigen?: 'magic_link' | 'usuario' | 'cron' | string;
  estadoOrigenAt?: Date | string;
  estadoCambiadoPorNombre?: string;
  /** Story 6.13 — creador AMES (no exponer en DTO público). */
  creadoPorUserId?: string;
  creadoPorEmail?: string;
  pdfUrl?: string;
  nombreEmpresa?: string;
  nombreContacto?: string;
  telefonoContacto?: string;
  /** Story 6.16 — snapshot cargo CRM para PDF */
  cargoContacto?: string;
  incluirDatosBancarios?: boolean;
  /** Destinatarios Para (Story 6.6). */
  emailsPara?: string[];
  /** Destinatarios CC (Story 6.6). */
  emailsCc?: string[];
  /** Snapshots de plantillas (Story 6.5). Orden = páginas tras el cuerpo. */
  plantillasSnapshot?: Array<{
    plantillaId: string;
    nombreSnapshot: string;
    schemaVersion: number;
    secciones: SeccionPlantilla[];
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
