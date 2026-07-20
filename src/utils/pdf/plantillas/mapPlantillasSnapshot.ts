import type { SeccionPlantilla } from '../../../types/backend';
import { mapSeccion } from './mapSeccion';
import type { PdfContent } from './mapTipTapDoc';

export type PlantillaSnapshotPdf = {
  plantillaId?: string;
  nombreSnapshot?: string;
  schemaVersion?: number;
  secciones?: SeccionPlantilla[];
};

/**
 * Espacio extra bajo el header: logo ~75pt + margin y=12 supera pageMargins top (62).
 * Sin este offset el título de plantilla se solapa con el branding.
 */
const PLANTILLA_CONTENT_TOP = 36;

/**
 * Snapshots ordenados → content pdfmake (páginas tras el cuerpo).
 * pageBreak before each plantilla page block with contenido real.
 */
export function mapPlantillasSnapshot(
  snapshots?: PlantillaSnapshotPdf[] | null,
): PdfContent[] {
  if (!snapshots?.length) return [];

  const out: PdfContent[] = [];
  let emitted = 0;

  for (const snap of snapshots) {
    if (!snap || typeof snap !== 'object') continue;

    const block: PdfContent[] = [];
    const nombre = snap.nombreSnapshot?.trim();
    if (nombre) {
      block.push({
        text: nombre,
        style: 'plantillaNombre',
        margin: [0, PLANTILLA_CONTENT_TOP, 0, 12],
      });
    }
    const secciones = snap.secciones || [];
    for (const sec of secciones) {
      if (!sec || typeof sec !== 'object') continue;
      block.push(...mapSeccion(sec));
    }
    if (!block.length) continue;

    // Sin nombre: empujar el primer bloque de sección por debajo del logo
    if (!nombre) {
      const first = block[0];
      if (first && typeof first === 'object') {
        const prev = (first as { margin?: number[] }).margin;
        const m = Array.isArray(prev) ? [...prev] : [0, 0, 0, 0];
        while (m.length < 4) m.push(0);
        m[1] = (m[1] || 0) + PLANTILLA_CONTENT_TOP;
        (first as { margin: number[] }).margin = m;
      } else {
        block.unshift({ text: '', margin: [0, PLANTILLA_CONTENT_TOP, 0, 0] });
      }
    }

    if (emitted > 0) {
      out.push({ text: '', pageBreak: 'before' });
    }
    out.push(...block);
    emitted += 1;
  }

  return out;
}
