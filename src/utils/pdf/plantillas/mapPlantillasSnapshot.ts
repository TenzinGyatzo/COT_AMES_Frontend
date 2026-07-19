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
        margin: [0, 0, 0, 12],
      });
    }
    const secciones = snap.secciones || [];
    for (const sec of secciones) {
      if (!sec || typeof sec !== 'object') continue;
      block.push(...mapSeccion(sec));
    }
    if (!block.length) continue;

    if (emitted > 0) {
      out.push({ text: '', pageBreak: 'before' });
    }
    out.push(...block);
    emitted += 1;
  }

  return out;
}
