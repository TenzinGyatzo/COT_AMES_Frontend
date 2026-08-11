/**
 * Selftest Story 8.3 — resolveProductImageUrls.
 * Run: npx --yes tsx src/utils/resolveProductImageUrls.selftest.ts
 */

import {
  isProductoLinea,
  itemServicioId,
  resolveProductImageUrls,
} from './resolveProductImageUrls';

let failed = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed++;
  }
}

assert(
  Object.keys(
    resolveProductImageUrls(
      [
        {
          servicioId: {
            _id: 'p1',
            tipo: 'producto',
            imagenUrl: '/uploads/catalogo/t/p1.webp',
          } as any,
          nombreServicioSnapshot: 'P',
          precioUnitarioSnapshot: 1,
          cantidad: 1,
          subtotal: 1,
          tipoSnapshot: 'producto',
        },
      ],
      { incluirImagenesPdf: false },
    ),
  ).length === 0,
  'flag false → vacío',
);

assert(
  Object.keys(
    resolveProductImageUrls(
      [
        {
          servicioId: {
            _id: 'p1',
            tipo: 'producto',
            imagenUrl: '/uploads/catalogo/t/p1.webp',
          } as any,
          nombreServicioSnapshot: 'P',
          precioUnitarioSnapshot: 1,
          cantidad: 1,
          subtotal: 1,
          tipoSnapshot: 'producto',
        },
      ],
      {},
    ),
  ).length === 0,
  'flag omitido → vacío',
);

const withPopulate = resolveProductImageUrls(
  [
    {
      servicioId: {
        _id: 'p1',
        tipo: 'producto',
        imagenUrl: '/uploads/catalogo/t/p1.webp',
      } as any,
      nombreServicioSnapshot: 'P',
      precioUnitarioSnapshot: 1,
      cantidad: 1,
      subtotal: 1,
      tipoSnapshot: 'producto',
    },
  ],
  { incluirImagenesPdf: true },
);
assert(withPopulate.p1 === '/uploads/catalogo/t/p1.webp', 'producto + populate URL');

const servicioOrphan = resolveProductImageUrls(
  [
    {
      servicioId: {
        _id: 's1',
        tipo: 'servicio',
        imagenUrl: '/uploads/catalogo/t/s1.webp',
      } as any,
      nombreServicioSnapshot: 'S',
      precioUnitarioSnapshot: 1,
      cantidad: 1,
      subtotal: 1,
      tipoSnapshot: 'servicio',
    },
  ],
  { incluirImagenesPdf: true },
);
assert(Object.keys(servicioOrphan).length === 0, 'servicio + URL huérfana → vacío');

const sinUrl = resolveProductImageUrls(
  [
    {
      servicioId: 'p2',
      nombreServicioSnapshot: 'P2',
      precioUnitarioSnapshot: 1,
      cantidad: 1,
      subtotal: 1,
      tipoSnapshot: 'producto',
    },
  ],
  { incluirImagenesPdf: true },
);
assert(Object.keys(sinUrl).length === 0, 'producto sin URL → vacío');

const fromCatalog = resolveProductImageUrls(
  [
    {
      servicioId: 'p3',
      nombreServicioSnapshot: 'P3',
      precioUnitarioSnapshot: 1,
      cantidad: 1,
      subtotal: 1,
      tipoSnapshot: 'producto',
    },
  ],
  {
    incluirImagenesPdf: true,
    catalogImagenByServicioId: { p3: '/uploads/catalogo/t/p3.webp' },
  },
);
assert(fromCatalog.p3 === '/uploads/catalogo/t/p3.webp', 'preview mapa gana');

// Forma real del detalle sintético post-fix: string id + tipoSnapshot + mapa.
const previewShape = resolveProductImageUrls(
  [
    {
      servicioId: 'p3b',
      nombreServicioSnapshot: 'P3b',
      precioUnitarioSnapshot: 1,
      cantidad: 1,
      subtotal: 1,
      tipoSnapshot: 'producto',
    },
  ],
  {
    incluirImagenesPdf: true,
    catalogImagenByServicioId: { p3b: '/uploads/catalogo/t/p3b.webp' },
  },
);
assert(
  previewShape.p3b === '/uploads/catalogo/t/p3b.webp',
  'detalle sintético string+tipoSnapshot+mapa',
);

// Sin tipoSnapshot y servicioId string: gate bloquea (mapa solo no basta).
const sinTipoSnapshot = resolveProductImageUrls(
  [
    {
      servicioId: 'p3c',
      nombreServicioSnapshot: 'P3c',
      precioUnitarioSnapshot: 1,
      cantidad: 1,
      subtotal: 1,
    },
  ],
  {
    incluirImagenesPdf: true,
    catalogImagenByServicioId: { p3c: '/uploads/catalogo/t/p3c.webp' },
  },
);
assert(
  Object.keys(sinTipoSnapshot).length === 0,
  'string id sin tipoSnapshot + mapa → vacío (gate)',
);

const catalogOverPopulate = resolveProductImageUrls(
  [
    {
      servicioId: {
        _id: 'p4',
        tipo: 'producto',
        imagenUrl: '/uploads/old.webp',
      } as any,
      nombreServicioSnapshot: 'P4',
      precioUnitarioSnapshot: 1,
      cantidad: 1,
      subtotal: 1,
      tipoSnapshot: 'producto',
    },
  ],
  {
    incluirImagenesPdf: true,
    catalogImagenByServicioId: { p4: '/uploads/new.webp' },
  },
);
assert(catalogOverPopulate.p4 === '/uploads/new.webp', 'mapa prioriza sobre populate');

assert(
  isProductoLinea({
    servicioId: 'x',
    nombreServicioSnapshot: 'x',
    precioUnitarioSnapshot: 1,
    cantidad: 1,
    subtotal: 1,
    tipoSnapshot: 'producto',
  }),
  'isProductoLinea tipoSnapshot',
);
assert(
  itemServicioId({
    servicioId: { _id: 'abc' } as any,
    nombreServicioSnapshot: 'x',
    precioUnitarioSnapshot: 1,
    cantidad: 1,
    subtotal: 1,
  }) === 'abc',
  'itemServicioId populate',
);

if (failed) {
  console.error(`resolveProductImageUrls.selftest: ${failed} failure(s)`);
  process.exit(1);
}
console.log('resolveProductImageUrls.selftest: OK');
