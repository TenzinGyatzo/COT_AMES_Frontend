/**
 * Selftest — pdfOptsFromDetalle.
 * Run: npx --yes tsx src/utils/pdfOptsFromDetalle.selftest.ts
 */

import { pdfOptsFromDetalle } from './pdfOptsFromDetalle';
import { resolveProductImageUrls } from './resolveProductImageUrls';

let failed = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed++;
  }
}

const fromPopulate = pdfOptsFromDetalle({
  items: [
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
});
assert(
  fromPopulate.catalogImagenByServicioId?.p1 ===
    '/uploads/catalogo/t/p1.webp',
  'mapa desde detalle poblado',
);

const guestLike = pdfOptsFromDetalle({
  items: [
    {
      servicioId: 'p2',
      nombreServicioSnapshot: 'P2',
      precioUnitarioSnapshot: 1,
      cantidad: 1,
      subtotal: 1,
      tipoSnapshot: 'producto',
      imagenUrl: '/uploads/catalogo/t/p2.webp',
    },
  ],
});
assert(
  guestLike.catalogImagenByServicioId?.p2 === '/uploads/catalogo/t/p2.webp',
  'guest-like linea imagenUrl + servicioId',
);

const withExtra = pdfOptsFromDetalle(
  {
    items: [
      {
        servicioId: 'p3',
        nombreServicioSnapshot: 'P3',
        precioUnitarioSnapshot: 1,
        cantidad: 1,
        subtotal: 1,
        tipoSnapshot: 'producto',
      },
    ],
  },
  { p3: '/uploads/extra.webp' },
);
assert(
  withExtra.catalogImagenByServicioId?.p3 === '/uploads/extra.webp',
  'mapa extra aceptado',
);

// Flag off → resolve vacío aunque el mapa del helper tenga URL.
const resolvedOff = resolveProductImageUrls(
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
  {
    incluirImagenesPdf: false,
    catalogImagenByServicioId: guestLike.catalogImagenByServicioId,
  },
);
assert(Object.keys(resolvedOff).length === 0, 'flag off → vacío con mapa helper');

const resolvedOn = resolveProductImageUrls(
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
  {
    incluirImagenesPdf: true,
    catalogImagenByServicioId: guestLike.catalogImagenByServicioId,
  },
);
assert(
  resolvedOn.p2 === '/uploads/catalogo/t/p2.webp',
  'guest-like tipoSnapshot+mapa → URL',
);

if (failed) {
  console.error(`pdfOptsFromDetalle.selftest: ${failed} failure(s)`);
  process.exit(1);
}
console.log('pdfOptsFromDetalle.selftest: OK');
