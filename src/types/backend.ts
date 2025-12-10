/**
 * Tipos TypeScript alineados con los DTOs y schemas del backend
 * Estos tipos representan las estructuras de datos que se intercambian con la API
 */

import { EstadoMexico } from './estado-mexico.enum';

// Tipo para una sede (ubicación geográfica del negocio)
export interface Sede {
  _id?: string;
  clave?: string;
  ciudad: string;
  estado?: EstadoMexico;
  activo?: boolean;
}

// Tipo para un usuario cliente
export interface UsuarioCliente {
  _id?: string;
  email: string;
  nombre: string;
  telefono?: string;
  clienteId: string;
  activo?: boolean;
  totalCotizaciones?: number;
  totalOrdenesTrabajo?: number;
}

// Tipo para un servicio médico
export interface Servicio {
  _id?: string;
  sedeId: string | Sede; // Puede ser string o objeto Sede poblado
  claveSede?: string; // Clave de la sede almacenada directamente en el documento
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  moneda?: string;
  activo?: boolean;
}

// Tipo para un cliente
export interface Cliente {
  _id?: string;
  clave?: string;
  empresa: string;
  rfc: string;
  sedeId?: string | Sede; // Puede ser string o objeto Sede poblado
  activo?: boolean;
  totalUsuarios?: number;
  totalCotizaciones?: number;
  totalOrdenesTrabajo?: number;
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
  folio: string;
  clienteId: string;
  sedeId: string;
  emailContacto: string;
  items: ItemCotizacion[];
  total: number;
  moneda?: string;
  fechaCreacion: Date;
  fechaVencimiento: Date;
  estado: 'vigente' | 'vencida';
  pdfUrl?: string;
}

// Tipo para crear una cotización pública (sin autenticación)
export interface CreatePublicCotizacionDto {
  empresa?: string;
  nombreContacto?: string;
  correo: string;
  telefono?: string;
  sedeId: string;
  items: Array<{
    servicioId: string;
    cantidad: number;
  }>;
}

// Tipo para la respuesta de una cotización pública creada
export interface PublicCotizacionResponse {
  id?: string;
  _id?: string; // MongoDB devuelve _id, pero puede ser transformado a id
  folio: string;
  total: number;
  fechaVencimiento: Date;
  cliente?: {
    empresa?: string;
    nombreContacto?: string;
    correo: string;
    telefono?: string;
  };
  items?: Array<{
    servicioId: string;
    nombreServicioSnapshot: string;
    descripcionServicioSnapshot?: string;
    precioUnitarioSnapshot: number;
    cantidad: number;
    subtotal: number;
  }>;
}

// Tipo para un usuario del sistema
export interface User {
  _id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'cliente';
  tipoUsuario: 'admin' | 'cliente';
  clienteId?: string;
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
  totalOrdenesTrabajo: number;
}

// Tipo para métricas de servicios
export interface ServiceMetricDto {
  servicioId: string;
  nombreServicio: string;
  sedeId: string;
  claveSede?: string;
  precioUnitario: number;
  vecesContratado: number;
}

// Tipo para cliente solicitante en métricas totales
export interface ClienteSolicitanteDto {
  clienteId: string;
  empresa?: string;
  rfc: string;
  nombreUsuarioCliente?: string;
  totalCotizaciones: number;
}

// Tipo para servicio solicitado en métricas totales
export interface ServicioSolicitadoDto {
  servicioId: string;
  nombreServicio: string;
  claveSede?: string;
  vecesSolicitado: number;
}

// Tipo para servicio rentable en métricas totales
export interface ServicioRentableDto {
  servicioId: string;
  nombreServicio: string;
  claveSede?: string;
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
  sede?: string;
  correo: string;
  estado: string;
  pdfUrl?: string;
}

// Tipo para respuesta paginada de cotizaciones
export interface PaginatedCotizacionesResponseDto {
  data: CotizacionListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipo para un trabajador
export interface Trabajador {
  primerApellido: string;
  segundoApellido?: string;
  nombre: string;
  fechaNacimiento: Date | string;
  sexo: 'Masculino' | 'Femenino';
  escolaridad:
    | 'Primaria'
    | 'Secundaria'
    | 'Preparatoria'
    | 'Licenciatura'
    | 'Maestría'
    | 'Doctorado'
    | 'Nula';
  puesto: string;
  fechaIngreso?: Date | string;
  telefono?: string;
  estadoCivil:
    | 'Soltero/a'
    | 'Casado/a'
    | 'Unión libre'
    | 'Separado/a'
    | 'Divorciado/a'
    | 'Viudo/a';
  curp?: string;
}

// DTO para crear un trabajador
export interface CreateTrabajadorDto {
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
}

// DTO para actualizar un trabajador
export interface UpdateTrabajadorDto {
  primerApellido?: string;
  segundoApellido?: string;
  nombre?: string;
  fechaNacimiento?: string;
  sexo?: string;
  escolaridad?: string;
  puesto?: string;
  fechaIngreso?: string;
  telefono?: string;
  estadoCivil?: string;
  curp?: string;
}

// Tipo para el perfil del cliente autenticado
export interface MiPerfilResponse {
  usuario: {
    _id: string;
    nombre: string;
    email: string;
    telefono?: string;
    clienteId: string;
    activo: boolean;
  };
  cliente: {
    _id: string;
    empresa: string;
    correo: string;
    sedeId?: string;
    clave?: string;
  };
}

// Tipo para actualizar el perfil del cliente
export interface UpdateMiPerfilPayload {
  nombre?: string;
  email?: string;
  telefono?: string;
}

// Tipo para el detalle completo de una cotización (con campos poblados)
export interface CotizacionDetalleDto {
  _id: string;
  folio: string;
  clienteId: string | Cliente; // Puede ser string o objeto Cliente poblado
  usuarioClienteId?: string | UsuarioCliente; // Puede ser string o objeto UsuarioCliente poblado
  sedeId: string | Sede; // Puede ser string o objeto Sede poblado
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
  fechaVencimiento: Date | string;
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
  ordenTrabajoId?: string;
  ordenTrabajoFolio?: string;
  pdfUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Tipo para un item de orden de trabajo en la lista
export interface OrdenTrabajoListItemDto {
  id: string;
  folio: string;
  fechaCreacion: Date | string;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  empresa?: string;
  nombreUsuario?: string;
  nombreSede?: string;
  folioCotizacion?: string;
}

// Tipo para respuesta paginada de órdenes de trabajo
export interface PaginatedOrdenesTrabajoResponseDto {
  data: OrdenTrabajoListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipo para el detalle completo de una orden de trabajo (con campos poblados)
export interface OrdenTrabajoDetalleDto {
  id: string;
  folio: string;
  cotizacionId: string;
  cotizacion?: {
    _id?: string;
    folio?: string;
    items?: Array<{
      servicioId?: string;
      nombreServicioSnapshot?: string;
      descripcionServicioSnapshot?: string;
      cantidad?: number;
    }>;
  };
  clienteId: string;
  cliente?: {
    _id?: string;
    empresa?: string;
    rfc?: string;
    nombreContacto?: string;
    correo?: string;
  };
  usuarioClienteId: string;
  usuarioCliente?: {
    _id?: string;
    nombre?: string;
    email?: string;
    telefono?: string;
  };
  sedeId: string;
  sede?: {
    _id?: string;
    ciudad?: string;
    clave?: string;
  };
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  fechaCreacion: Date | string;
  fechaInicio?: Date | string;
  fechaCompletacion?: Date | string;
  fechaEstadoPendiente?: Date | string;
  fechaEstadoEnProceso?: Date | string;
  fechaEstadoCompletada?: Date | string;
  fechaEstadoCancelada?: Date | string;
  observaciones?: Array<{ texto: string; timestamp: Date | string }> | string;
  trabajadores?: Trabajador[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
