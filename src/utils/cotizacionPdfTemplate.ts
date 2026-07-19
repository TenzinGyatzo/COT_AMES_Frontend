import type { CotizacionDetalleDto, Cliente } from '../types/backend';
import { formatCurrency, formatDateShort } from './pdfUtils';
import { mapPlantillasSnapshot } from './pdf/plantillas/mapPlantillasSnapshot';

/** Datos de emisor para cabecera/pie (Story 2.2). */
export interface PdfEmisorBranding {
  razonSocial?: string;
  domicilio?: string;
  telefono?: string;
  emailContacto?: string;
  sitioWeb?: string;
}

/** Contenido bancario tenant (Story 2.4). */
export interface PdfBancariosData {
  titular?: string;
  banco?: string;
  cuenta?: string;
  clabe?: string;
  domicilio?: string;
  rfc?: string;
  email?: string;
}

export interface PdfBankPageOptions {
  logoBase64?: string;
  bancarios: PdfBancariosData;
}

function buildDatosBancariosPage(opts: PdfBankPageOptions): any[] {
  const b = opts.bancarios;
  const bankLine = (label: string, value: string) => ({
    text: [{ text: `${label} `, bold: true }, { text: value }],
    style: 'bankLine',
    alignment: 'center' as const,
  });

  const stack: any[] = [
    {
      text: 'DATOS TRANSFERENCIA BANCARIA',
      style: 'bankSubtitle',
      margin: [0, 16, 0, 12],
    },
  ];

  if (opts.logoBase64) {
    stack.push({
      image: opts.logoBase64,
      width: 180,
      alignment: 'center',
      margin: [0, 0, 0, 16],
    });
  }

  if (b.titular?.trim()) stack.push(bankLine('Nombre:', b.titular.trim()));
  if (b.domicilio?.trim()) stack.push(bankLine('Domicilio:', b.domicilio.trim()));
  if (b.titular?.trim() || b.domicilio?.trim()) {
    stack.push({ text: ' ', margin: [0, 8] });
  }
  if (b.rfc?.trim()) stack.push(bankLine('RFC:', b.rfc.trim()));
  if (b.email?.trim()) {
    const email = b.email.trim();
    stack.push({
      text: [
        { text: 'E-mail: ', bold: true },
        {
          text: email,
          link: `mailto:${email}`,
          style: 'bankLink',
        },
      ],
      style: 'bankLine',
      alignment: 'center',
      margin: [0, 0, 0, 0],
    });
  }
  if (b.banco?.trim() || b.cuenta?.trim() || b.clabe?.trim()) {
    stack.push({ text: ' ', margin: [0, 12] });
  }
  if (b.banco?.trim()) stack.push(bankLine('Banco:', b.banco.trim()));
  if (b.cuenta?.trim()) stack.push(bankLine('No. De Cuenta:', b.cuenta.trim()));
  if (b.clabe?.trim()) {
    stack.push(bankLine('Clabe interbancaria:', b.clabe.trim()));
  }
  stack.push({ text: ' ', margin: [0, 16] });

  return [
    { text: 'DATOS BANCARIOS', style: 'bankPageTitle', margin: [0, 20, 0, 16] },
    {
      table: {
        widths: ['*'],
        body: [[{ stack, margin: [24, 0, 24, 0] }]],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#7DD3FC',
        vLineColor: () => '#7DD3FC',
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [40, 0, 40, 0],
    },
  ];
}

export const getCotizacionDefinition = (
  detalle: CotizacionDetalleDto,
  logoBase64: string,
  bankPage?: PdfBankPageOptions,
  emisor?: PdfEmisorBranding,
): any => {
  // Retorna any para evitar errores de tipos de pdfmake si no están instalados
  const incluirDatosBancarios = Boolean(
    detalle.incluirDatosBancarios && bankPage,
  );

  const footerLine1 = emisor?.razonSocial?.trim() || 'AMES';
  const footerLine2 = emisor?.domicilio?.trim() || '';
  const contactBits: string[] = [];
  if (emisor?.telefono?.trim()) contactBits.push(`Tel: ${emisor.telefono.trim()}`);
  if (emisor?.emailContacto?.trim()) {
    contactBits.push(emisor.emailContacto.trim());
  }
  if (emisor?.sitioWeb?.trim()) contactBits.push(emisor.sitioWeb.trim());
  const footerLine3 = contactBits.join(' | ');

  // Helpers para obtener datos de forma segura
  const getCliente = (): Partial<Cliente> => {
    // Si hay clienteId poblado, usarlo
    if (typeof detalle.clienteId === 'object')
      return detalle.clienteId as Cliente;

    // Si es cotización guest, usar campos embebidos
    if ((detalle as any).nombreEmpresa) {
      return {
        empresa: (detalle as any).nombreEmpresa,
        rfc: undefined, // Guest quotations no tienen RFC
      };
    }

    return { empresa: 'Cliente no disponible' };
  };

  const getUsuarioCliente = (): {
    nombre?: string;
    email?: string;
    telefono?: string;
  } => {
    if (detalle.nombreContacto) {
      return {
        nombre: detalle.nombreContacto,
        email: detalle.emailContacto || undefined,
        telefono: detalle.telefonoContacto || undefined,
      };
    }

    return { email: detalle.emailContacto };
  };

  const iva = detalle.total * 0.16;
  const total = detalle.total + iva;
  const cliente = getCliente();
  const usuario = getUsuarioCliente();

  // Construir filas de la tabla
  const tableBody = [
    [
      { text: 'Servicio', style: 'tableHeader' },
      { text: 'Descripción', style: 'tableHeader' },
      { text: 'Cantidad', style: 'tableHeader', alignment: 'center' },
      { text: 'Precio Unitario', style: 'tableHeader', alignment: 'right' },
      { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
    ],
  ];

  detalle.items.forEach((item) => {
    const nombreServicio = item.nombreServicioSnapshot || 'Servicio';
    const descripcion = item.descripcionServicioSnapshot || '';
    tableBody.push([
      { text: nombreServicio, style: 'tableCell', alignment: 'left' },
      { text: descripcion, style: 'tableCell', alignment: 'left' },
      {
        text: item.cantidad.toString(),
        style: 'tableCell',
        alignment: 'center',
      },
      {
        text: formatCurrency(item.precioUnitarioSnapshot),
        style: 'tableCell',
        alignment: 'right',
      },
      {
        text: formatCurrency(item.subtotal),
        style: 'tableCell',
        alignment: 'right',
      },
    ]);
  });

  const mainContent: any[] = [
    // Espacio para header
    { text: '', margin: [0, 0] },

    // Información General
    {
      columns: [
        {
          width: '*',
          text: '',
        },
        {
          width: 'auto',
          alignment: 'right',
          text: [
            { text: 'Folio: ', bold: true },
            { text: detalle.folio, bold: true, fontSize: 14 },
          ],
        },
      ],
      margin: [0, 0, 0, 20],
    },

    {
      style: 'sectionParams',
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: 'Estado', style: 'paramLabel' },
            { text: 'Fecha', style: 'paramLabel' },
            { text: 'Vencimiento', style: 'paramLabel' },
          ],
          [
            {
              text: detalle.estado.toUpperCase(),
              style: 'paramValue',
              color: getColorForEstado(detalle.estado),
            },
            {
              text: formatDateShort(detalle.fechaCreacion),
              style: 'paramValue',
            },
            {
              text: formatDateShort(detalle.fechaVencimiento),
              style: 'paramValue',
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 20],
    },

    {
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 1,
          lineColor: '#E5E7EB',
        },
      ],
    },
    { text: ' ', fontSize: 5 },

    // Información del Cliente
    { text: 'INFORMACIÓN DEL CLIENTE', style: 'sectionHeader' },
    {
      columns: [
        // Columna 1: Empresa y RFC
        {
          width: '*',
          text: [
            { text: 'Empresa:\n', style: 'label' },
            { text: (cliente.empresa || '-') + '\n\n', style: 'value' },
            { text: 'RFC:\n', style: 'label' },
            { text: (cliente.rfc || '-') + '\n', style: 'value' },
          ],
        },
        // Columna 2: Nombre de Contacto y Teléfono
        {
          width: '*',
          text: [
            { text: 'Contacto:\n', style: 'label' },
            {
              text: (usuario.nombre || 'Sin solicitante') + '\n\n',
              style: 'value',
            },
            { text: 'Teléfono:\n', style: 'label' },
            { text: (usuario.telefono || '-') + '\n', style: 'value' },
          ],
        },
        // Columna 3: Email y Persona(s) a evaluar
        {
          width: '*',
          text: [
            { text: 'Email:\n', style: 'label' },
            {
              text: (usuario.email || detalle.emailContacto || '-') + '\n\n',
              style: 'value',
            },
            { text: 'Persona(s) a evaluar – nombre(s):\n', style: 'label' },
            { text: (detalle.personasAEvaluar || '-') + '\n', style: 'value' },
          ],
        },
      ],
      margin: [0, 10, 0, 20],
    },

    // Tabla de Servicios
    { text: 'SERVICIOS COTIZADOS', style: 'sectionHeader' },
    {
      table: {
        headerRows: 1,
        widths: ['20%', '*', 'auto', 'auto', 'auto'],
        body: tableBody,
      },
      layout: 'lightHorizontalLines',
      margin: [0, 10, 0, 20],
    },

    // Totales
    {
      columns: [
        { width: '*', text: '' },
        {
          width: 200,
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Subtotal:', alignment: 'right', style: 'totalLabel' },
                {
                  text: formatCurrency(detalle.total),
                  alignment: 'right',
                  style: 'totalValue',
                },
              ],
              [
                { text: 'IVA (16%):', alignment: 'right', style: 'totalLabel' },
                {
                  text: formatCurrency(iva),
                  alignment: 'right',
                  style: 'totalValue',
                },
              ],
              [
                { text: 'TOTAL:', alignment: 'right', style: 'totalLabelBold' },
                {
                  text: formatCurrency(total),
                  alignment: 'right',
                  style: 'totalValueBold',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
      ],
    },
  ];

  // Story 6.7 / UX-DR12: cuerpo → plantillasSnapshot → bancarios
  const plantillasContent = mapPlantillasSnapshot(detalle.plantillasSnapshot);
  if (plantillasContent.length) {
    mainContent.push({ text: '', pageBreak: 'after' });
    mainContent.push(...plantillasContent);
  }

  if (incluirDatosBancarios && bankPage) {
    mainContent.push({ text: '', pageBreak: 'after' });
    mainContent.push(...buildDatosBancariosPage(bankPage));
  }

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 80, 40, 60], // [left, top, right, bottom]

    header: (currentPage: number, pageCount: number) => {
      if (incluirDatosBancarios && currentPage === pageCount) {
        return { text: '', margin: [0, 0, 0, 0] };
      }
      return {
        columns: [
          {
            image: logoBase64,
            width: 75,
            margin: [40, 20, 0, 0],
          },
          {
            text: 'COTIZACIÓN',
            alignment: 'right',
            style: 'headerTitle',
            margin: [0, 30, 40, 0],
          },
        ],
      };
    },

    footer: (_currentPage: number, _pageCount: number) => {
      const stack: any[] = [{ text: footerLine1, style: 'footerText' }];
      if (footerLine2) {
        stack.push({ text: footerLine2, style: 'footerText' });
      }
      if (footerLine3) {
        stack.push({ text: footerLine3, style: 'footerText' });
      }
      return {
        columns: [
          {
            stack,
            alignment: 'center',
          },
        ],
        margin: [40, 0, 40, 0],
      };
    },

    content: mainContent,

    styles: {
      headerTitle: {
        fontSize: 18,
        bold: true,
        color: '#111827',
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#374151',
        decoration: 'underline',
        margin: [0, 10, 0, 5],
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: '#000000',
        fillColor: '#F3F4F6',
        margin: [5, 5, 5, 5],
      },
      tableCell: {
        fontSize: 10,
        color: '#374151',
        margin: [5, 5, 5, 5],
      },
      paramLabel: {
        fontSize: 9,
        color: '#6B7280',
        bold: true,
      },
      paramValue: {
        fontSize: 10,
        color: '#111827',
      },
      label: {
        fontSize: 9,
        color: '#6B7280',
        bold: true,
      },
      value: {
        fontSize: 10,
        color: '#111827',
      },
      totalLabel: {
        fontSize: 10,
        bold: true,
        color: '#4B5563',
      },
      totalValue: {
        fontSize: 10,
        color: '#111827',
      },
      totalLabelBold: {
        fontSize: 12,
        bold: true,
        color: '#111827',
      },
      totalValueBold: {
        fontSize: 12,
        bold: true,
        color: '#111827',
      },
      footerText: {
        fontSize: 8,
        color: '#9CA3AF',
        margin: [0, 2],
      },
      bankPageTitle: {
        fontSize: 16,
        bold: true,
        alignment: 'center',
        color: '#111827',
      },
      bankSubtitle: {
        fontSize: 12,
        bold: true,
        italics: true,
        alignment: 'center',
        color: '#111827',
      },
      bankLine: {
        fontSize: 10,
        color: '#111827',
        margin: [0, 4],
      },
      bankLink: {
        fontSize: 10,
        color: '#2563EB',
        decoration: 'underline',
      },
      plantillaNombre: {
        fontSize: 14,
        bold: true,
        color: '#111827',
      },
      plantillaSeccionTitulo: {
        fontSize: 11,
        bold: true,
        color: '#374151',
        decoration: 'underline',
      },
      plantillaTableHeader: {
        bold: true,
        fontSize: 10,
        color: '#000000',
        fillColor: '#F3F4F6',
        margin: [4, 4, 4, 4],
      },
      plantillaTableCell: {
        fontSize: 10,
        color: '#374151',
        margin: [4, 4, 4, 4],
      },
    },
  };
};

function getColorForEstado(estado: string): string {
  switch (estado) {
    case 'vigente':
      return '#059669'; // green-600
    case 'aceptada':
      return '#2563EB'; // blue-600
    case 'rechazada':
      return '#DC2626'; // red-600
    case 'vencida':
      return '#4B5563'; // gray-600
    default:
      return '#000000';
  }
}
