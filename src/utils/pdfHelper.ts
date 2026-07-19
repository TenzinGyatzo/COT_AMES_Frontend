import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type {
  CotizacionDetalleDto,
  TenantBranding,
  TenantConfigResponse,
} from '../types/backend';
import {
  getCotizacionDefinition,
  type PdfBankPageOptions,
  type PdfEmisorBranding,
} from './cotizacionPdfTemplate';
import { getBase64ImageFromURL } from './pdfUtils';
import logoImg from '../assets/logos/ames-logo-cuadrado.png';
import { API_BASE_URL } from '../config/api';
import { getTenantConfig } from '../services/admin-api.service';
import { useAuthStore } from '../store/auth';
import { hasBancariosUtiles } from './bancarios.util';

// Inicializar vfs para fuentes (necesario para pdfmake en cliente)
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts && (pdfFonts as any).vfs) {
  // Fallback si la estructura es diferente
  pdfMake.vfs = (pdfFonts as any).vfs;
} else {
  console.warn(
    'Advertencia: No se pudo asignar pdfMake.vfs. La generación de PDF podría fallar si usa fuentes personalizadas o estándar embebidas.',
  );
}

/** Misma resolución que preview en Configuración (proxy /uploads). */
function resolvePublicUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  const apiBase = API_BASE_URL.replace(/\/api\/?$/, '');
  if (apiBase.startsWith('http')) return `${apiBase}${pathOrUrl}`;
  return pathOrUrl;
}

async function resolveTenantConfigForPdf(): Promise<
  TenantConfigResponse | undefined
> {
  try {
    const auth = useAuthStore();
    // Roles AMES: operativo (tenant JWT) o admin_sistema (X-Tenant-Id).
    if (!auth.isAmesUser) return undefined;
    if (auth.isAdminSistema && !auth.activeTenantId) return undefined;
    return await getTenantConfig();
  } catch {
    return undefined;
  }
}

/**
 * Arma el docDefinition pdfmake (cuerpo → plantillas → bancarios).
 * Solo FE — no llama render PDF del BE (Story 6.7 / AD-5 UI path).
 */
async function buildCotizacionDocDefinition(
  cotizacion: CotizacionDetalleDto,
): Promise<ReturnType<typeof getCotizacionDefinition>> {
  const cfg = await resolveTenantConfigForPdf();
  const branding: TenantBranding | undefined = cfg?.branding;
  let logoBase64: string;
  if (branding?.logoUrl) {
    try {
      logoBase64 = await getBase64ImageFromURL(
        resolvePublicUrl(branding.logoUrl),
      );
    } catch {
      logoBase64 = await getBase64ImageFromURL(logoImg);
    }
  } else {
    logoBase64 = await getBase64ImageFromURL(logoImg);
  }

  let bankPage: PdfBankPageOptions | undefined;
  if (cotizacion.incluirDatosBancarios && hasBancariosUtiles(cfg?.bancarios)) {
    const raw = cfg!.bancarios || {};
    let bankLogoBase64: string | undefined;
    if (raw.logoUrl) {
      try {
        let bankUrl = resolvePublicUrl(raw.logoUrl);
        if (cfg?.updatedAt) {
          const sep = bankUrl.includes('?') ? '&' : '?';
          bankUrl = `${bankUrl}${sep}v=${encodeURIComponent(cfg.updatedAt)}`;
        }
        bankLogoBase64 = await getBase64ImageFromURL(bankUrl);
      } catch {
        bankLogoBase64 = undefined;
      }
    }
    bankPage = {
      logoBase64: bankLogoBase64,
      bancarios: {
        titular: raw.titular || branding?.razonSocial,
        banco: raw.banco,
        cuenta: raw.cuenta,
        clabe: raw.clabe,
        domicilio: raw.domicilio || branding?.domicilio,
        rfc: raw.rfc || branding?.rfc,
        email: raw.email || branding?.emailContacto,
      },
    };
  }

  const emisor: PdfEmisorBranding | undefined = branding
    ? {
        razonSocial: branding.razonSocial,
        domicilio: branding.domicilio,
        telefono: branding.telefono,
        emailContacto: branding.emailContacto,
        sitioWeb: branding.sitioWeb,
      }
    : undefined;

  return getCotizacionDefinition(cotizacion, logoBase64, bankPage, emisor);
}

/**
 * Genera el PDF como Blob (mismo doc que preview/download).
 * Story 6.8 — adjunto para enviar-correo.
 */
export async function generateCotizacionPdfBlob(
  cotizacion: CotizacionDetalleDto,
): Promise<Blob> {
  const docDefinition = await buildCotizacionDocDefinition(cotizacion);
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition).getBlob((b: Blob) => {
        if (!b || b.size === 0) reject(new Error('PDF blob vacío'));
        else resolve(b);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Genera y descarga el PDF de una cotización.
 * Usuarios AMES: branding + bancarios del tenant (Stories 2.2 / 2.4).
 * Fallback logo: AMES. Sin literales Exin/MOC.
 */
export async function downloadCotizacionPDF(
  cotizacion: CotizacionDetalleDto,
): Promise<void> {
  try {
    const docDefinition = await buildCotizacionDocDefinition(cotizacion);
    const filename = `${cotizacion.folio}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
  } catch (error) {
    console.error('Error al generar PDF de cotización:', error);
    alert('Ocurrió un error al generar el PDF. Por favor intenta de nuevo.');
  }
}

/**
 * Previsualiza el PDF en una pestaña (mismo doc que download).
 * Usa blob URL tras await — evita popup blockers de createPdf().open().
 */
export async function previewCotizacionPDF(
  cotizacion: CotizacionDetalleDto,
): Promise<void> {
  try {
    const blob = await generateCotizacionPdfBlob(cotizacion);
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      URL.revokeObjectURL(url);
      alert(
        'No se pudo abrir la vista previa (ventana bloqueada). Revisa el bloqueador de ventanas emergentes o usa Descargar PDF.',
      );
      return;
    }
    // Liberar URL tras dar tiempo a la pestaña a cargar el blob
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    console.error('Error al previsualizar PDF de cotización:', error);
    alert(
      'Ocurrió un error al previsualizar el PDF. Por favor intenta de nuevo.',
    );
  }
}

/**
 * @deprecated Mantener por compatibilidad si es usado en otros lados,
 * idealmente migrar todo a los nuevos métodos
 */
export function downloadDummyPDF(
  filename: string,
  title: string = 'Documento',
  content: string[] = [],
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
