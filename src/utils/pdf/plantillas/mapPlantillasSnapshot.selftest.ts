/**
 * Selftest Story 6.7 — run: npm run test:pdf-mapper
 * (from frontend/). No Vitest in repo; assert-only.
 */
import assert from 'node:assert/strict';
import { mapTipTapDoc } from './mapTipTapDoc';
import { mapSeccion } from './mapSeccion';
import { mapPlantillasSnapshot } from './mapPlantillasSnapshot';

function hasDecoration(item: unknown, want: string): boolean {
  if (!item || typeof item !== 'object') return false;
  const d = (item as { decoration?: string | string[] }).decoration;
  if (d === want) return true;
  return Array.isArray(d) && d.includes(want);
}

// --- TipTap marks + align + list ---
{
  const content = mapTipTapDoc({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          { type: 'text', text: 'Hola ' },
          {
            type: 'text',
            text: 'mundo',
            marks: [
              { type: 'bold' },
              { type: 'italic' },
              { type: 'underline' },
              { type: 'strike' },
            ],
          },
        ],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'item' }],
              },
            ],
          },
        ],
      },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'cita' }],
          },
        ],
      },
    ],
  });
  assert.ok(content.length >= 3, 'doc produce bloques');
  const p0 = content[0] as {
    alignment?: string;
    text?: Array<Record<string, unknown>>;
  };
  assert.equal(p0.alignment, 'center');
  const marked = (p0.text || []).find((t) => t.text === 'mundo') as Record<
    string,
    unknown
  >;
  assert.equal(marked.bold, true);
  assert.equal(marked.italics, true);
  assert.ok(hasDecoration(marked, 'underline'));
  assert.ok(hasDecoration(marked, 'lineThrough'));
  assert.ok(
    content.some((c) => c && typeof c === 'object' && 'ul' in (c as object)),
    'bulletList → ul',
  );
}

// --- Fallback text via mapSeccion (sin doc) ---
{
  const blocks = mapSeccion({
    id: 'r1',
    tipo: 'richtext',
    titulo: 'Términos',
    cuerpo: { text: 'Solo texto plano' },
  });
  assert.ok(
    JSON.stringify(blocks).includes('Solo texto plano'),
    'fallback cuerpo.text',
  );
  assert.ok(JSON.stringify(blocks).includes('Términos'), 'titulo sección');
}

// --- Tabla + filas vacías ---
{
  const withRows = mapSeccion({
    id: 't1',
    tipo: 'tabla',
    encabezados: ['A', 'B'],
    filas: [
      ['1', '2'],
      ['3', '4'],
    ],
  });
  const table = withRows.find(
    (b) => b && typeof b === 'object' && 'table' in b,
  ) as { table: { body: unknown[][] } };
  assert.equal(table.table.body.length, 3); // header + 2

  const emptyRows = mapSeccion({
    id: 't2',
    tipo: 'tabla',
    encabezados: ['X'],
    filas: [],
  });
  const t2 = emptyRows.find(
    (b) => b && typeof b === 'object' && 'table' in b,
  ) as { table: { body: unknown[][] } };
  assert.equal(t2.table.body.length, 1); // solo encabezado
}

// --- Snapshot vacío / omitido ---
assert.deepEqual(mapPlantillasSnapshot(undefined), []);
assert.deepEqual(mapPlantillasSnapshot([]), []);

// --- Null-safe + hueco vacío no emite pageBreak ---
{
  const pages = mapPlantillasSnapshot([
    null as any,
    { nombreSnapshot: '', secciones: [] },
    {
      plantillaId: 'p2',
      nombreSnapshot: 'SoloUtil',
      secciones: [
        { id: 's2', tipo: 'richtext', cuerpo: { text: 'ok' } },
      ],
    },
  ]);
  assert.ok(JSON.stringify(pages).includes('SoloUtil'));
  assert.ok(
    !pages.some(
      (c) =>
        c &&
        typeof c === 'object' &&
        (c as { pageBreak?: string }).pageBreak === 'before',
    ),
    'sin pageBreak si solo una plantilla útil',
  );
}

// --- doc vacío + text legacy ---
{
  const blocks = mapSeccion({
    id: 'r-empty-doc',
    tipo: 'richtext',
    cuerpo: { text: 'Legacy visible', doc: {} as any },
  });
  assert.ok(
    JSON.stringify(blocks).includes('Legacy visible'),
    'fallback text cuando doc mapea vacío',
  );
}

// --- horizontalRule ---
{
  const hr = mapTipTapDoc({
    type: 'doc',
    content: [{ type: 'horizontalRule' }],
  });
  assert.ok(
    hr.some((c) => c && typeof c === 'object' && 'canvas' in (c as object)),
    'horizontalRule → canvas line',
  );
}

// --- Snapshot con pageBreak entre plantillas ---
{
  const pages = mapPlantillasSnapshot([
    {
      plantillaId: 'p1',
      nombreSnapshot: 'Uno',
      secciones: [
        {
          id: 's1',
          tipo: 'richtext',
          cuerpo: { text: 'a' },
        },
      ],
    },
    {
      plantillaId: 'p2',
      nombreSnapshot: 'Dos',
      secciones: [
        {
          id: 's2',
          tipo: 'richtext',
          cuerpo: { text: 'b' },
        },
      ],
    },
  ]);
  assert.ok(
    pages.some(
      (c) =>
        c &&
        typeof c === 'object' &&
        (c as { pageBreak?: string }).pageBreak === 'before',
    ),
    'pageBreak between plantillas',
  );
  assert.ok(JSON.stringify(pages).includes('Uno'));
  assert.ok(JSON.stringify(pages).includes('Dos'));
}

// --- Orden en getCotizacionDefinition: plantillas antes de bancarios ---
{
  const { getCotizacionDefinition } = await import(
    '../../cotizacionPdfTemplate'
  );
  const def = getCotizacionDefinition(
    {
      folio: 'COT-2026-0001',
      estado: 'vigente',
      fechaCreacion: new Date().toISOString(),
      fechaVencimiento: new Date().toISOString(),
      total: 100,
      items: [
        {
          servicioId: 's1',
          nombreServicioSnapshot: 'Svc',
          precioUnitarioSnapshot: 100,
          cantidad: 1,
          subtotal: 100,
        },
      ],
      incluirDatosBancarios: true,
      plantillasSnapshot: [
        {
          plantillaId: 'p1',
          nombreSnapshot: 'PLANTILLA_ORDEN',
          schemaVersion: 1,
          secciones: [
            {
              id: 's1',
              tipo: 'richtext',
              cuerpo: { text: 'contenido plantilla' },
            },
          ],
        },
      ],
    } as any,
    'data:image/png;base64,xx',
    {
      logoBase64: 'data:image/png;base64,xx',
      bancarios: { banco: 'BBVA', cuenta: '123', clabe: '012345678901234567' },
    },
  );
  const content = def.content as unknown[];
  const idxOf = (needle: string) =>
    content.findIndex((c) => JSON.stringify(c).includes(needle));
  const idxPlantilla = idxOf('PLANTILLA_ORDEN');
  const idxBancarios = idxOf('DATOS TRANSFERENCIA BANCARIA');
  assert.ok(idxPlantilla >= 0, 'plantilla en content');
  assert.ok(idxBancarios >= 0, 'bancarios en content');
  assert.ok(
    idxPlantilla < idxBancarios,
    'orden: plantillas antes de bancarios',
  );
}

console.log('mapPlantillasSnapshot.selftest: OK');
