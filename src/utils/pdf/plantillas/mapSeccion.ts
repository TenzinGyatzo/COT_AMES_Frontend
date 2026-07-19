import type { SeccionPlantilla } from '../../../types/backend';
import { tipTapContentFromCuerpo } from '../../../components/plantillas/richtext-cuerpo';
import { mapTipTapDoc, type PdfContent } from './mapTipTapDoc';

function mapTabla(sec: Extract<SeccionPlantilla, { tipo: 'tabla' }>): PdfContent[] {
  const headers = (sec.encabezados || []).map((h) => ({
    text: h ?? '',
    style: 'plantillaTableHeader',
  }));
  const widths =
    headers.length > 0
      ? headers.map(() => '*')
      : ['*'];

  const body: unknown[][] = [];
  if (headers.length) {
    body.push(headers);
  } else {
    body.push([{ text: '', style: 'plantillaTableHeader' }]);
  }

  const filas = sec.filas || [];
  for (const fila of filas) {
    const cols = headers.length || 1;
    const row = [];
    for (let i = 0; i < cols; i++) {
      row.push({
        text: (fila?.[i] ?? '').toString(),
        style: 'plantillaTableCell',
      });
    }
    body.push(row);
  }

  return [
    {
      table: {
        headerRows: headers.length ? 1 : 0,
        widths,
        body,
      },
      layout: 'lightHorizontalLines',
      margin: [0, 4, 0, 12],
    },
  ];
}

function mapRichtext(
  sec: Extract<SeccionPlantilla, { tipo: 'richtext' }>,
): PdfContent[] {
  const cuerpo = sec.cuerpo || { text: '' };
  const doc = tipTapContentFromCuerpo(cuerpo);
  const mapped = mapTipTapDoc(doc);
  if (mapped.length) return mapped;

  // doc vacío/roto no debe anular texto legacy
  const text = (cuerpo.text ?? '').trim();
  if (!text) return [];
  return mapTipTapDoc({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: cuerpo.text ?? '' }],
      },
    ],
  });
}

/** Una sección de plantilla → bloques pdfmake. */
export function mapSeccion(sec: SeccionPlantilla | null | undefined): PdfContent[] {
  if (!sec || typeof sec !== 'object') return [];
  const out: PdfContent[] = [];
  const titulo = sec.titulo?.trim();
  if (titulo) {
    out.push({
      text: titulo,
      style: 'plantillaSeccionTitulo',
      margin: [0, 0, 0, 8],
    });
  }
  if (sec.tipo === 'richtext') {
    out.push(...mapRichtext(sec));
  } else if (sec.tipo === 'tabla') {
    out.push(...mapTabla(sec));
  }
  return out;
}
