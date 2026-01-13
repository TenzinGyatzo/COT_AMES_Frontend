
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { CotizacionDetalleDto, OrdenTrabajoDetalleDto } from '../types/backend';
import { getCotizacionDefinition } from './cotizacionPdfTemplate';
import { getOrdenTrabajoDefinition } from './ordenTrabajoPdfTemplate';
import { getBase64ImageFromURL } from './pdfUtils';
import logoImg from '../assets/logos/exin-cv-salud-laboral-logo.png';

// Inicializar vfs para fuentes (necesario para pdfmake en cliente)
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts && (pdfFonts as any).vfs) {
  // Fallback si la estructura es diferente
  pdfMake.vfs = (pdfFonts as any).vfs;
} else {
  console.warn('Advertencia: No se pudo asignar pdfMake.vfs. La generación de PDF podría fallar si usa fuentes personalizadas o estándar embebidas.');
}


/**
 * Genera y descarga el PDF de una cotización
 */
export async function downloadCotizacionPDF(cotizacion: CotizacionDetalleDto): Promise<void> {
  try {
    const logoBase64 = await getBase64ImageFromURL(logoImg);
    const docDefinition = getCotizacionDefinition(cotizacion, logoBase64);
    
    const filename = `${cotizacion.folio}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
  } catch (error) {
    console.error('Error al generar PDF de cotización:', error);
    alert('Ocurrió un error al generar el PDF. Por favor intenta de nuevo.');
  }
}

/**
 * Genera y descarga el PDF de una orden de trabajo
 */
export async function downloadOrdenTrabajoPDF(orden: OrdenTrabajoDetalleDto): Promise<void> {
  try {
    const logoBase64 = await getBase64ImageFromURL(logoImg);
    const docDefinition = getOrdenTrabajoDefinition(orden, logoBase64);
    
    const filename = `${orden.folio}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
  } catch (error) {
    console.error('Error al generar PDF de orden de trabajo:', error);
    alert('Ocurrió un error al generar el PDF. Por favor intenta de nuevo.');
  }
}


/**
 * @deprecated Mantener por compatibilidad si es usado en otros lados,
 * idealmente migrar todo a los nuevos métodos
 */
export function downloadDummyPDF(
  filename: string,
  title: string = 'Documento',
  content: string[] = []
): void {
    // Implementación original dummy para fallback extrema
  const escapedTitle = title.replace(/[()\\]/g, (m) => '\\' + m);
  const escapedContent = content
    .map((line) => line.replace(/[()\\]/g, (m) => '\\' + m))
    .join('\\n');

  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 250
>>
stream
BT
/F1 24 Tf
100 700 Td
(${escapedTitle}) Tj
0 -40 Td
/F1 12 Tf
(${escapedContent}) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000307 00000 n 
0000000550 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
650
%%EOF`;

  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
