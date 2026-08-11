/**
 * Story 8.3 — resolución viva de imagenUrl de producto para PDF (sin snapshot en línea).
 */

import type { CotizacionDetalleDto, Servicio } from '../types/backend';

export type ProductImageResolveOptions = {
  /** Solo true dispara resolución; ausente/false → {}. */
  incluirImagenesPdf?: boolean;
  /** Preview wizard: mapa desde catálogo en memoria (sin populate). */
  catalogImagenByServicioId?: Record<string, string>;
};

type LineaPdf = CotizacionDetalleDto['items'][number];

export function itemServicioId(item: LineaPdf): string | undefined {
  const s = item.servicioId;
  if (typeof s === 'object' && s) {
    const id = (s as Servicio)._id || (s as { id?: string }).id;
    return id ? String(id) : undefined;
  }
  return s ? String(s) : undefined;
}

/** Gate producto: tipoSnapshot preferido; fallback populate.tipo. */
export function isProductoLinea(item: LineaPdf): boolean {
  if (item.tipoSnapshot === 'producto') return true;
  if (item.tipoSnapshot === 'servicio') return false;
  if (typeof item.servicioId === 'object' && item.servicioId) {
    return (item.servicioId as Servicio).tipo === 'producto';
  }
  return false;
}

/**
 * Devuelve `servicioId → imagenUrl` (relativa o absoluta) para líneas producto.
 * Prioridad URL: mapa catálogo preview → imagenUrl del Servicio poblado.
 * No fetch; no muta items.
 */
export function resolveProductImageUrls(
  items: LineaPdf[] | undefined,
  options: ProductImageResolveOptions = {},
): Record<string, string> {
  if (options.incluirImagenesPdf !== true) return {};
  const out: Record<string, string> = {};
  for (const item of items || []) {
    if (!isProductoLinea(item)) continue;
    const sid = itemServicioId(item);
    if (!sid) continue;

    const fromCatalog = options.catalogImagenByServicioId?.[sid]?.trim();
    const fromPopulate =
      typeof item.servicioId === 'object' && item.servicioId
        ? String((item.servicioId as Servicio).imagenUrl || '').trim()
        : '';
    const url = fromCatalog || fromPopulate;
    if (url) out[sid] = url;
  }
  return out;
}
