/**
 * Estilos unificados para badges de estado
 * Usado en cotizaciones y órdenes de trabajo
 */

export type EstadoCotizacion =
  | 'vigente'
  | 'vencida'
  | 'aceptada'
  | 'rechazada'
  | 'en_proceso'
  | 'completada';

export type EstadoOrden =
  | 'pendiente'
  | 'en_proceso'
  | 'completada'
  | 'cancelada';

export type EstadoBadge = EstadoCotizacion | EstadoOrden;

/**
 * Mapeo de estados a etiquetas en español
 */
export const ESTADO_LABELS: Record<EstadoBadge, string> = {
  // Estados de cotización
  vigente: 'Vigente',
  vencida: 'Vencida',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  en_proceso: 'En proceso',
  completada: 'Completada',
  // Estados de orden
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
};

/**
 * Mapeo de estados a clases de Tailwind para badges
 * Formato: bg-{color}-100 text-{color}-800
 */
export const ESTADO_BADGE_CLASSES: Record<EstadoBadge, string> = {
  // Estados de cotización
  vigente: 'bg-green-100 text-green-800',
  vencida: 'bg-red-100 text-red-800',
  aceptada: 'bg-blue-100 text-blue-800',
  rechazada: 'bg-gray-100 text-gray-800',
  en_proceso: 'bg-yellow-100 text-yellow-800',
  completada: 'bg-green-100 text-green-800',
  // Estados de orden
  pendiente: 'bg-yellow-100 text-yellow-800',
  cancelada: 'bg-red-100 text-red-800',
};

/**
 * Función helper para obtener la etiqueta de un estado
 */
export function getEstadoLabel(estado: string): string {
  return ESTADO_LABELS[estado as EstadoBadge] || estado;
}

/**
 * Función helper para obtener las clases de un badge de estado
 */
export function getEstadoBadgeClass(estado: string): string {
  return (
    ESTADO_BADGE_CLASSES[estado as EstadoBadge] || 'bg-gray-100 text-gray-800'
  );
}
