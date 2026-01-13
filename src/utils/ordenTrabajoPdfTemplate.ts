import type { OrdenTrabajoDetalleDto, Cliente, Sede } from '../types/backend';
import { formatDate, formatDateShort } from './pdfUtils';

export const getOrdenTrabajoDefinition = (
  detalle: OrdenTrabajoDetalleDto,
  logoBase64: string
): any => { // Retorna any para evitar errores de tipos

  // Helpers
  const getCliente = (): Partial<Cliente> => {
    if (typeof detalle.clienteId === 'object') return detalle.clienteId || {}; // Manejo de fallback si es null
    if (detalle.cliente) return detalle.cliente;
    return { empresa: 'Cliente no disponible' };
  };

  const getSede = (): Partial<Sede> => {
    if (typeof detalle.sedeId === 'object') return detalle.sedeId || {};
    if (detalle.sede) return detalle.sede;
    return { ciudad: 'Sede no disponible', clave: '' };
  };

  const getUsuarioCliente = (): { nombre?: string; email?: string; telefono?: string } => {
    if (typeof detalle.usuarioClienteId === 'object') return detalle.usuarioClienteId as any;
    if (detalle.usuarioCliente) return detalle.usuarioCliente;
    return {};
  };

  const cliente = getCliente();
  const usuario = getUsuarioCliente();
  const sede = getSede();

  // Tabla servicios
  const items = detalle.cotizacion?.items || [];
  const tableBodyServicios = [
    [
      { text: 'Servicio', style: 'tableHeader' },
      { text: 'Descripción', style: 'tableHeader' },
      { text: 'Cantidad', style: 'tableHeader', alignment: 'center' }
    ]
  ];

  items.forEach(item => {
    const nombre = item.nombreServicioSnapshot || 'Servicio';
    const desc = item.descripcionServicioSnapshot || '';
    tableBodyServicios.push([
      { text: nombre, style: 'tableCell' },
      { text: desc, style: 'tableCell' },
      { text: (item.cantidad || 0).toString(), style: 'tableCell', alignment: 'center' }
    ]);
  });

  // Tabla trabajadores
  const trabajadores = detalle.trabajadores || [];
  const tableBodyTrabajadores = [
    [
      { text: 'Nombre', style: 'tableHeader' },
      { text: 'Puesto', style: 'tableHeader' },
      { text: 'Fech. Nac', style: 'tableHeader' },
      { text: 'Sexo', style: 'tableHeader' },
      { text: 'Teléfono', style: 'tableHeader' }
    ]
  ];

  trabajadores.forEach(t => {
    const nombre = `${t.nombre} ${t.primerApellido} ${t.segundoApellido || ''}`.trim();
    tableBodyTrabajadores.push([
      { text: nombre, style: 'tableCell' },
      { text: t.puesto, style: 'tableCell' },
      { text: formatDateShort(t.fechaNacimiento), style: 'tableCell', fontSize: 9 },
      { text: t.sexo, style: 'tableCell' },
      { text: t.telefono || '-', style: 'tableCell', fontSize: 9 }
    ] as any);
  });

  // Observaciones
  const observacionesContent = [];
  if (detalle.observaciones) {
    let obsArr: any[] = [];
    if (Array.isArray(detalle.observaciones)) {
      obsArr = detalle.observaciones;
    } else if (typeof detalle.observaciones === 'string') {
      obsArr = [{ texto: detalle.observaciones, timestamp: detalle.createdAt }];
    }
    
    if (obsArr.length > 0) {
      observacionesContent.push({ text: 'OBSERVACIONES', style: 'sectionHeader' });
      obsArr.forEach((obs: { texto: string; timestamp: string | Date }) => {
        observacionesContent.push({
            text: [
                { text: '• ', fontSize: 10 },
                { text: obs.texto + '\n', fontSize: 10 },
                { text: formatDate(obs.timestamp) + '\n', fontSize: 8, color: '#6B7280', italics: true }
            ],
            margin: [10, 0, 0, 5]
        });
      });
    }
  }

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 80, 40, 60],
    
    header: {
      columns: [
        {
          image: logoBase64,
          width: 75,
          margin: [40, 20, 0, 0]
        },
        {
          text: 'ORDEN DE TRABAJO',
          alignment: 'right',
          style: 'headerTitle',
          margin: [0, 30, 40, 0]
        }
      ]
    },

    footer: (_currentPage: number, _pageCount: number) => {
      return {
        columns: [
          {
            stack: [
              { text: 'Médica Ocupacional Caborca', style: 'footerText' },
              { text: 'Avenida J, No. 80. Heroica Caborca Centro', style: 'footerText' },
              { text: 'Tel: (52) 637935-8499 | mocaborca.com', style: 'footerText' }
            ],
            alignment: 'center'
          }
        ],
        margin: [40, 0, 40, 0]
      };
    },

    content: [
      { text: '', margin: [0, 0] },

      // Información General
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            alignment: 'right',
            text: [
              { text: 'Folio: ', bold: true },
              { text: detalle.folio, bold: true, fontSize: 14 }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      {
        style: 'sectionParams',
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'Estado', style: 'paramLabel' },
              { text: 'Creación', style: 'paramLabel' },
              { text: 'Completación', style: 'paramLabel' },
              { text: 'Sede', style: 'paramLabel' }
            ],
            [
              { text: getEstadoLabel(detalle.estado).toUpperCase(), style: 'paramValue', color: getColorForEstado(detalle.estado) },
              { text: formatDateShort(detalle.fechaCreacion), style: 'paramValue' },
              { text: formatDateShort(detalle.fechaCompletacion), style: 'paramValue' },
              { text: sede.ciudad || sede.clave || '-', style: 'paramValue' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20]
      },

      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#E5E7EB' }] },
      { text: ' ', fontSize: 5 },

      // Información Cliente
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
              { text: (cliente.rfc || '-') + '\n', style: 'value' }
            ]
          },
          // Columna 2: Nombre de Contacto
          {
            width: '*',
            text: [
              { text: 'Contacto:\n', style: 'label' },
              { text: (usuario.nombre || '-') + '\n\n', style: 'value' },
              { text: 'Teléfono:\n', style: 'label' },
              { text: (usuario.telefono || '-') + '\n', style: 'value' }
            ]
          },
          // Columna 3: Datos de Contacto
          {
            width: '*',
            text: [
              { text: 'Email:\n', style: 'label' },
              { text: (usuario.email || '-') + '\n', style: 'value' },
            ]
          }
        ],
        margin: [0, 10, 0, 20]
      },

      // Servicios
      { text: 'SERVICIOS CONTRATADOS', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['25%', '*', 'auto'],
          body: tableBodyServicios
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 20]
      },

      // Trabajadores
      trabajadores.length > 0 ? [
        { text: `TRABAJADORES (${trabajadores.length})`, style: 'sectionHeader' },
        {
            table: {
            headerRows: 1,
            widths: ['*', '*', '15%', '15%', '15%'],
            body: tableBodyTrabajadores
            },
            layout: 'lightHorizontalLines',
            margin: [0, 10, 0, 20]
        }
      ] : [],

      // Observaciones
      ...observacionesContent

    ],

    styles: {
      headerTitle: {
        fontSize: 18,
        bold: true,
        color: '#111827'
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#374151',
        decoration: 'underline',
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: '#000000',
        fillColor: '#F3F4F6',
        margin: [5, 5, 5, 5]
      },
      tableCell: {
        fontSize: 10,
        color: '#374151',
        margin: [5, 5, 5, 5]
      },
      paramLabel: {
        fontSize: 9,
        color: '#6B7280',
        bold: true
      },
      paramValue: {
        fontSize: 10,
        color: '#111827'
      },
      label: {
        fontSize: 9,
        color: '#6B7280',
        bold: true
      },
      value: {
        fontSize: 10,
        color: '#111827'
      },
      footerText: {
        fontSize: 8,
        color: '#9CA3AF',
        margin: [0, 2]
      }
    }
  };
};

function getColorForEstado(estado: string): string {
    switch (estado) {
        case 'pendiente': return '#D97706'; // yellow-600
        case 'en_proceso': return '#2563EB'; // blue-600
        case 'completada': return '#059669'; // green-600
        case 'cancelada': return '#DC2626'; // red-600
        default: return '#000000';
    }
}

function getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
        pendiente: 'Pendiente',
        en_proceso: 'En Proceso',
        completada: 'Completada',
        cancelada: 'Cancelada',
    };
    return labels[estado] || estado;
}
