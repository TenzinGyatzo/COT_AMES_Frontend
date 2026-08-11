/**
 * Opts PDF desde detalle admin (populate) o mapa explícito — paridad con
 * AdminCotizadorView.pdfOptsFromCatalog().
 */

import type { CotizacionDetalleDto, Servicio } from '../types/backend';
import type { PdfBuildOptions } from './pdfHelper';
import { itemServicioId } from './resolveProductImageUrls';

type DetalleLike = Pick<CotizacionDetalleDto, 'items'> & {
  items?: Array<
    CotizacionDetalleDto['items'][number] & { imagenUrl?: string }
  >;
};

/**
 * Construye `{ catalogImagenByServicioId }` desde:
 * - items con `servicioId` poblado (`imagenUrl`), y/o
 * - `imagenUrl` plano en la línea (proyección pública guest), y/o
 * - mapa extra (p.ej. catálogo en memoria del cotizador).
 */
export function pdfOptsFromDetalle(
  detalle: DetalleLike | null | undefined,
  extraCatalog?: Record<string, string>,
): PdfBuildOptions {
  const catalogImagenByServicioId: Record<string, string> = {
    ...(extraCatalog || {}),
  };

  for (const item of detalle?.items || []) {
    const sid = itemServicioId(item);
    if (!sid) continue;

    const fromPopulate =
      typeof item.servicioId === 'object' && item.servicioId
        ? String((item.servicioId as Servicio).imagenUrl || '').trim()
        : '';
    const fromLinea = String(item.imagenUrl || '').trim();
    const url = fromPopulate || fromLinea;
    if (url && !catalogImagenByServicioId[sid]) {
      catalogImagenByServicioId[sid] = url;
    }
  }

  return { catalogImagenByServicioId };
}
