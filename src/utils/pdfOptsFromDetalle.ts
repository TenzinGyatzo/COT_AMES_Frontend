/**
 * Opts PDF desde detalle admin (populate) o mapa explícito — paridad con
 * AdminCotizadorView.pdfOptsFromCatalog().
 *
 * Nota: Cotizacion.items en BE es `type: [Object]`, así que
 * populate('items.servicioId') no hidrata imagenUrl en el JSON del detalle.
 * Por eso los callers admin deben usar `pdfOptsFromDetalleAsync` (catálogo live).
 */

import type { CotizacionDetalleDto, Servicio } from '../types/backend';
import { getServicios } from '../services/admin-api.service';
import type { PdfBuildOptions } from './pdfHelper';
import { itemServicioId } from './resolveProductImageUrls';

type DetalleLike = Pick<CotizacionDetalleDto, 'items'> & {
  items?: Array<
    CotizacionDetalleDto['items'][number] & { imagenUrl?: string }
  >;
  incluirImagenesPdf?: boolean;
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

/** Igual que el cotizador: pagina productos activos con imagenUrl. */
export async function fetchCatalogImagenByServicioId(): Promise<
  Record<string, string>
> {
  const map: Record<string, string> = {};
  let page = 1;
  let totalPages = 1;
  do {
    const res = await getServicios({
      activo: true,
      tipo: 'producto',
      page,
      limit: 100,
      orden: 'nombre_asc',
    });
    for (const s of res.data || []) {
      const id = s._id;
      const url = s.imagenUrl?.trim();
      if (id && url) map[String(id)] = url;
    }
    totalPages = res.totalPages || 1;
    page += 1;
  } while (page <= totalPages);
  return map;
}

/**
 * Paridad con creación: si el PDF pide imágenes, mezcla catálogo live.
 * Si el flag está off, no llama al API de catálogo.
 */
export async function pdfOptsFromDetalleAsync(
  detalle: DetalleLike | null | undefined,
): Promise<PdfBuildOptions> {
  if (!detalle || detalle.incluirImagenesPdf !== true) {
    return pdfOptsFromDetalle(detalle);
  }
  try {
    const catalog = await fetchCatalogImagenByServicioId();
    return pdfOptsFromDetalle(detalle, catalog);
  } catch {
    return pdfOptsFromDetalle(detalle);
  }
}
