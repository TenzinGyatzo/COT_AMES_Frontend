/**
 * Utilidad para generar PDFs dummy (temporal para MVP)
 * En el futuro se reemplazará con pdf-make
 */

/**
 * Genera un PDF dummy simple y lo descarga
 * @param filename - Nombre del archivo PDF a descargar
 * @param title - Título del documento
 * @param content - Contenido adicional del documento (array de líneas)
 */
export function downloadDummyPDF(
  filename: string,
  title: string = 'Documento',
  content: string[] = [
    'Este es un PDF dummy generado para el MVP.',
    '',
    'En el futuro próximo se implementará la generación real de PDFs usando pdf-make.',
  ],
): void {
  // Crear un PDF mínimo válido usando una estructura básica
  // Este PDF es funcional pero básico, suficiente para MVP

  const escapedTitle = title.replace(/[()\\]/g, (m) => '\\' + m);
  const escapedContent = content
    .map((line) => line.replace(/[()\\]/g, (m) => '\\' + m))
    .join('\\n');

  // Estructura PDF mínima válida
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

  // Crear blob y descargar
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
