/**
 * Selftest — layout dinámico tabla conceptos PDF.
 * Run: npm run test:conceptos-table (from frontend/)
 */

import assert from 'node:assert/strict';
import type { CotizacionDetalleDto } from '../../types/backend';
import {
  buildConceptosTable,
  buildImagenCell,
  buildNombreCell,
  resolveConceptosMix,
  resolveFirstColumnHeader,
  resolveHasDescripciones,
  resolveHasImagenes,
  resolveSectionTitle,
  resolveTableVariant,
  resolveTableWidths,
} from './conceptosTableLayout';

type LineaPdf = CotizacionDetalleDto['items'][number];

const fmt = (n: number) => `$${n.toFixed(2)}`;

function item(
  overrides: {
    tipoSnapshot?: 'producto' | 'servicio';
    nombreServicioSnapshot?: string;
    descripcionServicioSnapshot?: string;
    servicioId?: string;
  } = {},
): LineaPdf {
  return {
    servicioId: overrides.servicioId ?? 's1',
    nombreServicioSnapshot: overrides.nombreServicioSnapshot ?? 'Item',
    descripcionServicioSnapshot: overrides.descripcionServicioSnapshot,
    precioUnitarioSnapshot: 100,
    cantidad: 1,
    subtotal: 100,
    tipoSnapshot: overrides.tipoSnapshot ?? 'servicio',
  };
}

// --- Mix / título / 1ª columna ---
assert.equal(resolveConceptosMix([]), 'vacio');
assert.equal(resolveSectionTitle('vacio'), 'SERVICIOS COTIZADOS');
assert.equal(resolveFirstColumnHeader('vacio'), 'Servicio');

assert.equal(
  resolveConceptosMix([item({ tipoSnapshot: 'producto' })]),
  'productos',
);
assert.equal(resolveSectionTitle('productos'), 'PRODUCTOS COTIZADOS');
assert.equal(resolveFirstColumnHeader('productos'), 'Producto');

assert.equal(
  resolveConceptosMix([item({ tipoSnapshot: 'servicio' })]),
  'servicios',
);
assert.equal(resolveSectionTitle('servicios'), 'SERVICIOS COTIZADOS');
assert.equal(resolveFirstColumnHeader('servicios'), 'Servicio');

assert.equal(
  resolveConceptosMix([
    item({ tipoSnapshot: 'producto', servicioId: 'p1' }),
    item({ tipoSnapshot: 'servicio', servicioId: 's1' }),
  ]),
  'mixto',
);
assert.equal(
  resolveSectionTitle('mixto'),
  'PRODUCTOS Y SERVICIOS COTIZADOS',
);
assert.equal(resolveFirstColumnHeader('mixto'), 'Concepto');

// --- Flags de contenido ---
assert.equal(
  resolveHasDescripciones(false, [
    item({ descripcionServicioSnapshot: 'Tiene texto' }),
  ]),
  false,
  'toggle desc off → no hasDescripciones',
);
assert.equal(
  resolveHasDescripciones(true, [
    item({ descripcionServicioSnapshot: '   ' }),
    item({ descripcionServicioSnapshot: '' }),
  ]),
  false,
  'toggle on pero textos vacíos → no hasDescripciones',
);
assert.equal(
  resolveHasDescripciones(true, [
    item({ descripcionServicioSnapshot: 'OK' }),
  ]),
  true,
);

const productoP1 = item({ tipoSnapshot: 'producto', servicioId: 'p1' });
assert.equal(
  resolveHasImagenes(false, { p1: 'data:img' }, [productoP1]),
  false,
);
assert.equal(
  resolveHasImagenes(true, {}, [productoP1]),
  false,
  'mapa vacío → no imágenes',
);
assert.equal(
  resolveHasImagenes(
    true,
    { p1: 'data:image/png;base64,xx' },
    [productoP1],
  ),
  true,
);
assert.equal(
  resolveHasImagenes(true, { p1: '   ' }, [productoP1]),
  false,
  'base64 vacío tras fetch fallido omitido → no Variante B',
);
assert.equal(
  resolveHasImagenes(
    true,
    { orphan: 'data:image/png;base64,xx' },
    [productoP1],
  ),
  false,
  'clave huérfana en mapa → no Variante B',
);

assert.equal(resolveTableVariant(true, true), 'A');
assert.equal(resolveTableVariant(true, false), 'A');
assert.equal(resolveTableVariant(false, true), 'B');
assert.equal(resolveTableVariant(false, false), 'C');

assert.deepEqual(resolveTableWidths('C'), ['*', 52, 77, 77]);
assert.deepEqual(resolveTableWidths('A'), ['20%', '*', 52, 77, 77]);
assert.deepEqual(resolveTableWidths('B'), ['*', 56, 52, 77, 77]);

// --- Celdas ---
const nombreSolo = buildNombreCell('X', 'data:img', 'C');
assert.equal((nombreSolo as { text: string }).text, 'X');
assert.ok(!('stack' in nombreSolo));

const nombreConImgA = buildNombreCell('X', 'data:img', 'A') as {
  stack: Array<{ text?: string; image?: string }>;
};
assert.equal(nombreConImgA.stack[0]?.text, 'X', 'Variante A: nombre primero');
assert.equal(nombreConImgA.stack[1]?.image, 'data:img', 'luego imagen');

const imgVacia = buildImagenCell(undefined);
assert.equal((imgVacia as { text: string }).text, '');
assert.ok(!('image' in imgVacia), 'sin placeholder de imagen');

// --- buildConceptosTable: solo productos ---
{
  const t = buildConceptosTable({
    items: [
      item({
        tipoSnapshot: 'producto',
        servicioId: 'p1',
        nombreServicioSnapshot: 'Prod',
      }),
    ],
    incluirDescripciones: false,
    incluirImagenesPdf: false,
    formatCurrency: fmt,
  });
  assert.equal(t.sectionTitle, 'PRODUCTOS COTIZADOS');
  assert.equal(t.firstColumnHeader, 'Producto');
  assert.equal(t.variant, 'C');
  assert.equal(t.dontBreakRows, true);
  const header = t.body[0];
  assert.ok(header);
  assert.equal((header[0] as { text: string }).text, 'Producto');
  assert.equal(header.length, 4, 'Variante C: 4 columnas');
}

// --- solo servicios ---
{
  const t = buildConceptosTable({
    items: [item({ tipoSnapshot: 'servicio' })],
    incluirDescripciones: false,
    incluirImagenesPdf: false,
    formatCurrency: fmt,
  });
  assert.equal(t.sectionTitle, 'SERVICIOS COTIZADOS');
  assert.equal(t.firstColumnHeader, 'Servicio');
  assert.equal(t.variant, 'C');
}

// --- mixto ---
{
  const t = buildConceptosTable({
    items: [
      item({ tipoSnapshot: 'producto', servicioId: 'p1' }),
      item({ tipoSnapshot: 'servicio', servicioId: 's1' }),
    ],
    incluirDescripciones: false,
    incluirImagenesPdf: false,
    formatCurrency: fmt,
  });
  assert.equal(t.sectionTitle, 'PRODUCTOS Y SERVICIOS COTIZADOS');
  assert.equal(t.firstColumnHeader, 'Concepto');
}

// --- Variante A: imágenes + descripciones; parcial ---
{
  const t = buildConceptosTable({
    items: [
      item({
        tipoSnapshot: 'producto',
        servicioId: 'p1',
        nombreServicioSnapshot: 'Con img',
        descripcionServicioSnapshot: 'Desc A',
      }),
      item({
        tipoSnapshot: 'producto',
        servicioId: 'p2',
        nombreServicioSnapshot: 'Sin img',
        descripcionServicioSnapshot: '',
      }),
    ],
    incluirDescripciones: true,
    incluirImagenesPdf: true,
    productImageBase64ByServicioId: { p1: 'data:image/png;base64,AA' },
    formatCurrency: fmt,
  });
  assert.equal(t.variant, 'A');
  const header = t.body[0];
  const row1 = t.body[1];
  const row2 = t.body[2];
  assert.ok(header && row1 && row2);
  assert.equal((header[1] as { text: string }).text, 'Descripción');
  assert.equal(header.length, 5);
  const cell0 = row1[0] as { stack: unknown[] };
  assert.ok(Array.isArray(cell0.stack), 'fila con imagen: stack nombre→img');
  const cell1 = row2[0] as { text: string };
  assert.equal(cell1.text, 'Sin img', 'sin imagen: solo texto');
  assert.equal((row2[1] as { text: string }).text, '', 'desc vacía OK');
}

// --- Variante B: imágenes sin descripciones ---
{
  const t = buildConceptosTable({
    items: [
      item({
        tipoSnapshot: 'producto',
        servicioId: 'p1',
        nombreServicioSnapshot: 'Con',
      }),
      item({
        tipoSnapshot: 'producto',
        servicioId: 'p2',
        nombreServicioSnapshot: 'Sin',
      }),
    ],
    incluirDescripciones: true, // on pero sin textos → no hasDescripciones
    incluirImagenesPdf: true,
    productImageBase64ByServicioId: { p1: 'data:image/png;base64,AA' },
    formatCurrency: fmt,
  });
  assert.equal(t.variant, 'B');
  const header = t.body[0];
  const row1 = t.body[1];
  const row2 = t.body[2];
  assert.ok(header && row1 && row2);
  assert.equal((header[1] as { text: string }).text, 'Imagen');
  assert.ok('image' in (row1[1] as object));
  assert.equal((row2[1] as { text: string }).text, '');
  assert.equal(
    (row1[0] as { text: string }).text,
    'Con',
    'Variante B: nombre sin stack de imagen',
  );
}

// --- Imagen inválida / mapa vacío tras fallos → Variante C ---
{
  const t = buildConceptosTable({
    items: [item({ tipoSnapshot: 'producto', servicioId: 'p1' })],
    incluirDescripciones: false,
    incluirImagenesPdf: true,
    productImageBase64ByServicioId: {}, // fetch fallidos omitidos
    formatCurrency: fmt,
  });
  assert.equal(t.variant, 'C');
  const header = t.body[0];
  assert.ok(header);
  assert.equal(header.length, 4);
}

// --- Multi-página: muchas filas conservan dontBreakRows y columnas financieras ---
{
  const many = Array.from({ length: 40 }, (_, i) =>
    item({
      tipoSnapshot: i % 2 === 0 ? 'producto' : 'servicio',
      servicioId: `id-${i}`,
      nombreServicioSnapshot: `Item ${i}`,
      descripcionServicioSnapshot: i === 0 ? 'Una desc' : undefined,
    }),
  );
  const t = buildConceptosTable({
    items: many,
    incluirDescripciones: true,
    incluirImagenesPdf: true,
    productImageBase64ByServicioId: { 'id-0': 'data:img' },
    formatCurrency: fmt,
  });
  assert.equal(t.dontBreakRows, true);
  assert.equal(t.variant, 'A');
  assert.equal(t.body.length, 41); // header + 40
  const last = t.body[40];
  assert.ok(last);
  assert.equal(last.length, 5);
  assert.equal((last[2] as { text: string }).text, '1'); // Cantidad
  assert.ok(String((last[3] as { text: string }).text).includes('100'));
  assert.ok(String((last[4] as { text: string }).text).includes('100'));
}

console.log('conceptosTableLayout.selftest: OK');
