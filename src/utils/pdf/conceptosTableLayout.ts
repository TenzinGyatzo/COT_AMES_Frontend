/**
 * Layout dinámico de la tabla de conceptos del PDF (pdfmake).
 * Helpers puros — sin I/O ni instancia de pdfmake.
 */

import type { CotizacionDetalleDto } from '../../types/backend';
import { isProductoLinea, itemServicioId } from '../resolveProductImageUrls';

export type ConceptosMix = 'productos' | 'servicios' | 'mixto' | 'vacio';
export type ConceptosTableVariant = 'A' | 'B' | 'C';

type LineaPdf = CotizacionDetalleDto['items'][number];

/** Máximo uniforme; `fit` de pdfmake conserva proporción. */
export const PRODUCT_IMAGE_FIT: [number, number] = [48, 48];

export function resolveConceptosMix(
  items: LineaPdf[] | undefined,
): ConceptosMix {
  const list = (items || []).filter(Boolean) as LineaPdf[];
  if (list.length === 0) return 'vacio';
  let hasProducto = false;
  let hasServicio = false;
  for (const item of list) {
    if (isProductoLinea(item)) hasProducto = true;
    else hasServicio = true;
    if (hasProducto && hasServicio) return 'mixto';
  }
  if (hasProducto && !hasServicio) return 'productos';
  if (hasServicio && !hasProducto) return 'servicios';
  return 'vacio';
}

export function resolveSectionTitle(mix: ConceptosMix): string {
  switch (mix) {
    case 'productos':
      return 'PRODUCTOS COTIZADOS';
    case 'mixto':
      return 'PRODUCTOS Y SERVICIOS COTIZADOS';
    case 'servicios':
    case 'vacio':
    default:
      return 'SERVICIOS COTIZADOS';
  }
}

export function resolveFirstColumnHeader(mix: ConceptosMix): string {
  switch (mix) {
    case 'productos':
      return 'Producto';
    case 'mixto':
      return 'Concepto';
    case 'servicios':
    case 'vacio':
    default:
      return 'Servicio';
  }
}

export function resolveHasDescripciones(
  incluirDescripciones: boolean,
  items: LineaPdf[] | undefined,
): boolean {
  if (incluirDescripciones !== true) return false;
  return (items || []).some((item) =>
    Boolean(item.descripcionServicioSnapshot?.trim()),
  );
}

/**
 * True si hay ≥1 imagen renderizable para una línea actual (no claves huérfanas).
 */
export function resolveHasImagenes(
  incluirImagenesPdf: boolean,
  productImageBase64ByServicioId: Record<string, string> | undefined,
  items?: LineaPdf[],
): boolean {
  if (incluirImagenesPdf !== true) return false;
  const map = productImageBase64ByServicioId || {};
  for (const item of items || []) {
    if (!item) continue;
    const sid = itemServicioId(item);
    if (!sid) continue;
    const v = map[sid];
    if (typeof v === 'string' && v.trim()) return true;
  }
  return false;
}

export function resolveTableVariant(
  hasDescripciones: boolean,
  hasImagenes: boolean,
): ConceptosTableVariant {
  if (hasDescripciones) return 'A';
  if (hasImagenes) return 'B';
  return 'C';
}

/** Anchos: Cantidad / Precio / Subtotal fijos para montos noWrap. */
export function resolveTableWidths(
  variant: ConceptosTableVariant,
): Array<string | number> {
  switch (variant) {
    case 'A':
      return ['20%', '*', 52, 77, 77];
    case 'B':
      return ['*', 56, 52, 77, 77];
    case 'C':
    default:
      return ['*', 52, 77, 77];
  }
}

export function buildNombreCell(
  nombre: string,
  imageBase64: string | undefined,
  variant: ConceptosTableVariant,
): Record<string, unknown> {
  const nameNode = {
    text: nombre,
    style: 'tableCell',
    alignment: 'left' as const,
  };
  if (variant === 'A' && imageBase64) {
    return {
      style: 'tableCell',
      stack: [
        nameNode,
        {
          image: imageBase64,
          fit: PRODUCT_IMAGE_FIT,
          alignment: 'center',
          margin: [0, 4, 0, 0] as [number, number, number, number],
        },
      ],
    };
  }
  return nameNode;
}

export function buildImagenCell(
  imageBase64: string | undefined,
): Record<string, unknown> {
  if (!imageBase64) {
    return { text: '', style: 'tableCell' };
  }
  return {
    style: 'tableCell',
    image: imageBase64,
    fit: PRODUCT_IMAGE_FIT,
    alignment: 'center',
  };
}

export type ConceptosTableBuildInput = {
  items: LineaPdf[] | undefined;
  incluirDescripciones: boolean;
  incluirImagenesPdf: boolean;
  productImageBase64ByServicioId?: Record<string, string>;
  formatCurrency: (n: number) => string;
};

export type ConceptosTableBuildResult = {
  sectionTitle: string;
  firstColumnHeader: string;
  variant: ConceptosTableVariant;
  widths: Array<string | number>;
  body: unknown[][];
  dontBreakRows: true;
};

/**
 * Construye título, variante, anchos y body (header + filas) de la tabla.
 */
export function buildConceptosTable(
  input: ConceptosTableBuildInput,
): ConceptosTableBuildResult {
  const items = (input.items || []).filter(Boolean) as LineaPdf[];
  const incluirImagenesPdf = input.incluirImagenesPdf === true;
  const mix = resolveConceptosMix(items);
  const sectionTitle = resolveSectionTitle(mix);
  const firstColumnHeader = resolveFirstColumnHeader(mix);
  const hasDescripciones = resolveHasDescripciones(
    input.incluirDescripciones === true,
    items,
  );
  const hasImagenes = resolveHasImagenes(
    incluirImagenesPdf,
    input.productImageBase64ByServicioId,
    items,
  );
  const variant = resolveTableVariant(hasDescripciones, hasImagenes);
  const widths = resolveTableWidths(variant);
  const productImages = input.productImageBase64ByServicioId || {};

  const tableHeaderRow: unknown[] = [
    { text: firstColumnHeader, style: 'tableHeader' },
  ];
  if (variant === 'A') {
    tableHeaderRow.push({ text: 'Descripción', style: 'tableHeader' });
  } else if (variant === 'B') {
    tableHeaderRow.push({ text: 'Imagen', style: 'tableHeader', alignment: 'center' });
  }
  tableHeaderRow.push(
    { text: 'Cantidad', style: 'tableHeader', alignment: 'center' },
    { text: 'Precio Unitario', style: 'tableHeader', alignment: 'right' },
    { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
  );

  const body: unknown[][] = [tableHeaderRow];

  for (const item of items) {
    const nombre = item.nombreServicioSnapshot?.trim() || 'Servicio';
    const descripcion = item.descripcionServicioSnapshot?.trim() || '';
    const sid = itemServicioId(item) || '';
    const rawImg =
      incluirImagenesPdf && sid ? productImages[sid] : undefined;
    const productImg =
      typeof rawImg === 'string' && rawImg.trim() ? rawImg.trim() : undefined;

    const row: unknown[] = [buildNombreCell(nombre, productImg, variant)];

    if (variant === 'A') {
      row.push({
        text: descripcion,
        style: 'tableCell',
        alignment: 'left',
      });
    } else if (variant === 'B') {
      row.push(buildImagenCell(productImg));
    }

    row.push(
      {
        text: String(item.cantidad ?? ''),
        style: 'tableCell',
        alignment: 'center',
      },
      {
        text: input.formatCurrency(Number(item.precioUnitarioSnapshot) || 0),
        style: 'tableCell',
        alignment: 'right',
        noWrap: true,
      },
      {
        text: input.formatCurrency(Number(item.subtotal) || 0),
        style: 'tableCell',
        alignment: 'right',
        noWrap: true,
      },
    );
    body.push(row);
  }

  return {
    sectionTitle,
    firstColumnHeader,
    variant,
    widths,
    body,
    dontBreakRows: true,
  };
}
