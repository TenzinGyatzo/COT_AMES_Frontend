import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

export interface TrabajadorExcelRow {
  primerApellido: string;
  segundoApellido?: string;
  nombre: string;
  fechaNacimiento: string;
  sexo: string;
  escolaridad: string;
  puesto: string;
  fechaIngreso?: string;
  telefono?: string;
  estadoCivil: string;
  curp?: string;
}

export interface ExcelValidationError {
  row: number;
  field: string;
  message: string;
}

const SEXOS = ['Masculino', 'Femenino'];
const NIVELES_ESCOLARIDAD = [
  'Primaria',
  'Secundaria',
  'Preparatoria',
  'Licenciatura',
  'Maestría',
  'Doctorado',
  'Nula',
];
const ESTADOS_CIVILES = [
  'Soltero/a',
  'Casado/a',
  'Unión libre',
  'Separado/a',
  'Divorciado/a',
  'Viudo/a',
];

// Mapeos para normalización
const NORMALIZACION_SEXO: Record<string, string> = {
  'hombre': 'Masculino',
  'varón': 'Masculino',
  'varon': 'Masculino',
  'mujer': 'Femenino',
  'femenina': 'Femenino',
  'masculino': 'Masculino',
  'femenino': 'Femenino',
};

const NORMALIZACION_ESCOLARIDAD: Record<string, string> = {
  'universidad': 'Licenciatura',
  'universitario': 'Licenciatura',
  'carrera': 'Licenciatura',
  'profesional': 'Licenciatura',
  'ninguna': 'Nula',
  'ninguno': 'Nula',
  'sin estudios': 'Nula',
  'sin escolaridad': 'Nula',
  'nula': 'Nula',
  'primaria': 'Primaria',
  'secundaria': 'Secundaria',
  'preparatoria': 'Preparatoria',
  'bachillerato': 'Preparatoria',
  'licenciatura': 'Licenciatura',
  'maestría': 'Maestría',
  'maestria': 'Maestría',
  'doctorado': 'Doctorado',
};

const NORMALIZACION_ESTADO_CIVIL: Record<string, string> = {
  'soltero': 'Soltero/a',
  'soltera': 'Soltero/a',
  'casado': 'Casado/a',
  'casada': 'Casado/a',
  'union libre': 'Unión libre',
  'unión libre': 'Unión libre',
  'separado': 'Separado/a',
  'separada': 'Separado/a',
  'divorciado': 'Divorciado/a',
  'divorciada': 'Divorciado/a',
  'viudo': 'Viudo/a',
  'viuda': 'Viudo/a',
};

/**
 * Normaliza un valor según los mapeos definidos
 */
function normalizarValor(
  valor: string,
  mapeo: Record<string, string>,
): string {
  const valorLower = valor.toLowerCase().trim();
  return mapeo[valorLower] || valor;
}

/**
 * Convierte fecha de cualquier formato válido a YYYY-MM-DD
 * Acepta múltiples formatos: DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD, DD-MM-YYYY, etc.
 */
function parsearFecha(fechaStr: string): string | null {
  if (!fechaStr || fechaStr.trim() === '') return null;

  const fechaLimpia = fechaStr.trim();

  // Intentar parsear como fecha de Excel (número serial)
  const numeroSerial = parseFloat(fechaLimpia);
  if (!isNaN(numeroSerial) && numeroSerial > 0 && numeroSerial < 1000000) {
    // Excel usa días desde el 1 de enero de 1900
    // Nota: Excel tiene un bug donde considera 1900 como año bisiesto
    const fechaExcel = new Date(1900, 0, numeroSerial - 2);
    if (!isNaN(fechaExcel.getTime()) && fechaExcel.getFullYear() >= 1900 && fechaExcel.getFullYear() <= 2100) {
      const año = fechaExcel.getFullYear();
      const mes = String(fechaExcel.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaExcel.getDate()).padStart(2, '0');
      return `${año}-${mes}-${dia}`;
    }
  }

  // Extraer números de la fecha (acepta cualquier separador: /, -, espacio, punto, etc.)
  const numeros = fechaLimpia.match(/\d+/g);
  if (!numeros || numeros.length < 3) {
    // Intentar parsear como fecha estándar de JavaScript
    const fecha = new Date(fechaLimpia);
    if (!isNaN(fecha.getTime()) && fecha.getFullYear() >= 1900 && fecha.getFullYear() <= 2100) {
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${año}-${mes}-${dia}`;
    }
    return null;
  }

  // Normalizar números (agregar ceros a la izquierda si es necesario)
  const num1 = parseInt(numeros[0] || '0', 10);
  const num2 = parseInt(numeros[1] || '0', 10);
  const num3 = parseInt(numeros[2] || '0', 10);

  // Determinar qué número es el año (el que tiene 4 dígitos o está en rango 1900-2100)
  let año: number | undefined;
  let mes: number | undefined;
  let dia: number | undefined;

  // Caso 1: El tercer número es el año (4 dígitos o >= 1900)
  if ((numeros[2]?.length === 4) || (num3 >= 1900 && num3 <= 2100)) {
    año = num3;
    // Determinar si es DD/MM o MM/DD basándose en los valores
    if (num1 > 12 && num2 <= 12) {
      // DD/MM/YYYY
      dia = num1;
      mes = num2;
    } else if (num1 <= 12 && num2 > 12) {
      // MM/DD/YYYY
      mes = num1;
      dia = num2;
    } else if (num1 <= 12 && num2 <= 12) {
      // Ambos podrían ser mes/día, asumimos DD/MM/YYYY (formato más común en español)
      dia = num1;
      mes = num2;
    } else {
      // Ambos > 12, no es válido
      return null;
    }
  }
  // Caso 2: El primer número es el año (YYYY/MM/DD o YYYY-MM-DD)
  else if ((numeros[0]?.length === 4) || (num1 >= 1900 && num1 <= 2100)) {
    año = num1;
    mes = num2;
    dia = num3;
  }
  // Caso 3: El segundo número es el año (poco común pero posible)
  else if ((numeros[1]?.length === 4) || (num2 >= 1900 && num2 <= 2100)) {
    año = num2;
    // Asumimos DD/YYYY/MM o MM/YYYY/DD
    if (num1 > 12) {
      dia = num1;
      mes = num3;
    } else {
      mes = num1;
      dia = num3;
    }
  }
  // Caso 4: Todos tienen 2 dígitos o menos, intentar detectar por contexto
  else {
    // Intentar diferentes combinaciones y validar
    const combinaciones: Array<[number, number, number]> = [
      [num1, num2, num3], // DD/MM/YY
      [num3, num2, num1], // YY/MM/DD
      [num2, num1, num3], // MM/DD/YY
    ];

    for (const [a, b, c] of combinaciones) {
      // Si c parece un año (>= 50 asumimos 1900s, < 50 asumimos 2000s)
      let añoCandidato: number;
      if (c < 100) {
        añoCandidato = c >= 50 ? 1900 + c : 2000 + c;
      } else {
        añoCandidato = c;
      }

      if (añoCandidato >= 1900 && añoCandidato <= 2100) {
        // Validar mes y día
        if (a >= 1 && a <= 12 && b >= 1 && b <= 31) {
          // Verificar si es una fecha válida
          const fechaTest = new Date(añoCandidato, a - 1, b);
          if (
            fechaTest.getFullYear() === añoCandidato &&
            fechaTest.getMonth() === a - 1 &&
            fechaTest.getDate() === b
          ) {
            año = añoCandidato;
            mes = a;
            dia = b;
            break;
          }
        } else if (b >= 1 && b <= 12 && a >= 1 && a <= 31) {
          // MM/DD/YY
          const fechaTest = new Date(añoCandidato, b - 1, a);
          if (
            fechaTest.getFullYear() === añoCandidato &&
            fechaTest.getMonth() === b - 1 &&
            fechaTest.getDate() === a
          ) {
            año = añoCandidato;
            mes = b;
            dia = a;
            break;
          }
        }
      }
    }

    // Si no se encontró una combinación válida, intentar parsear como fecha estándar
    if (año === undefined || mes === undefined || dia === undefined) {
      const fecha = new Date(fechaLimpia);
      if (!isNaN(fecha.getTime()) && fecha.getFullYear() >= 1900 && fecha.getFullYear() <= 2100) {
        año = fecha.getFullYear();
        mes = fecha.getMonth() + 1;
        dia = fecha.getDate();
      } else {
        return null;
      }
    }
  }

  // Validar que los valores sean correctos
  if (año === undefined || mes === undefined || dia === undefined) return null;
  if (año < 1900 || año > 2100) return null;
  if (mes < 1 || mes > 12) return null;
  if (dia < 1 || dia > 31) return null;

  // Crear fecha y validar que sea válida (ej: 31/02/2020 no es válido)
  const fechaFinal = new Date(año, mes - 1, dia);
  if (
    fechaFinal.getFullYear() !== año ||
    fechaFinal.getMonth() !== mes - 1 ||
    fechaFinal.getDate() !== dia
  ) {
    return null;
  }

  return `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}


/**
 * Genera una plantilla Excel descargable con columnas, ejemplos, dropdowns y validación
 */
export async function generarPlantillaExcel(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Trabajadores');

  // Definir columnas
  worksheet.columns = [
    { header: 'Primer Apellido', key: 'primerApellido', width: 18 },
    { header: 'Segundo Apellido', key: 'segundoApellido', width: 18 },
    { header: 'Nombre(s)', key: 'nombre', width: 18 },
    { header: 'Fecha de Nacimiento', key: 'fechaNacimiento', width: 20 },
    { header: 'Sexo', key: 'sexo', width: 12 },
    { header: 'Escolaridad', key: 'escolaridad', width: 15 },
    { header: 'Puesto', key: 'puesto', width: 18 },
    { header: 'Fecha de Ingreso', key: 'fechaIngreso', width: 18 },
    { header: 'Teléfono', key: 'telefono', width: 15 },
    { header: 'Estado Civil', key: 'estadoCivil', width: 15 },
    { header: 'CURP', key: 'curp', width: 20 },
  ];

  // Estilo para el header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Agregar datos de ejemplo
  const datosEjemplo = [
    {
      primerApellido: 'García',
      segundoApellido: 'López',
      nombre: 'Juan',
      fechaNacimiento: '15/01/1990',
      sexo: 'Masculino',
      escolaridad: 'Licenciatura',
      puesto: 'Operador',
      fechaIngreso: '01/03/2020',
      telefono: '6641234567',
      estadoCivil: 'Casado/a',
      curp: 'GALJ900115HDFRZN01',
    },
    {
      primerApellido: 'Martínez',
      segundoApellido: '',
      nombre: 'María',
      fechaNacimiento: '20/05/1995',
      sexo: 'Femenino',
      escolaridad: 'Preparatoria',
      puesto: 'Supervisor',
      fechaIngreso: '15/06/2019',
      telefono: '',
      estadoCivil: 'Soltero/a',
      curp: '',
    },
  ];

  datosEjemplo.forEach((dato) => {
    worksheet.addRow(dato);
  });

  // Aplicar validación de datos (dropdowns) y formato
  // Crear una hoja oculta con las opciones para los dropdowns
  const opcionesSheet = workbook.addWorksheet('Opciones', { state: 'hidden' });
  opcionesSheet.getCell('A1').value = 'Sexos';
  SEXOS.forEach((sexo, idx) => {
    opcionesSheet.getCell(`A${idx + 2}`).value = sexo;
  });
  opcionesSheet.getCell('B1').value = 'Escolaridades';
  NIVELES_ESCOLARIDAD.forEach((escolaridad, idx) => {
    opcionesSheet.getCell(`B${idx + 2}`).value = escolaridad;
  });
  opcionesSheet.getCell('C1').value = 'EstadosCiviles';
  ESTADOS_CIVILES.forEach((estado, idx) => {
    opcionesSheet.getCell(`C${idx + 2}`).value = estado;
  });

  // Aplicar validación de datos usando referencias a la hoja oculta
  // Validación para Sexo (columna E, índice 5)
  for (let row = 2; row <= worksheet.rowCount; row++) {
    worksheet.getCell(`E${row}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`Opciones!$A$2:$A$${SEXOS.length + 1}`],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Valor inválido',
      error: `Debe ser uno de: ${SEXOS.join(', ')}`,
    };
  }

  // Validación para Escolaridad (columna F, índice 6)
  for (let row = 2; row <= worksheet.rowCount; row++) {
    worksheet.getCell(`F${row}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`Opciones!$B$2:$B$${NIVELES_ESCOLARIDAD.length + 1}`],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Valor inválido',
      error: `Debe ser uno de: ${NIVELES_ESCOLARIDAD.join(', ')}`,
    };
  }

  // Validación para Estado Civil (columna J, índice 10)
  for (let row = 2; row <= worksheet.rowCount; row++) {
    worksheet.getCell(`J${row}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`Opciones!$C$2:$C$${ESTADOS_CIVILES.length + 1}`],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Valor inválido',
      error: `Debe ser uno de: ${ESTADOS_CIVILES.join(', ')}`,
    };
  }

  // Formato de fecha para Fecha de Nacimiento (columna D, índice 4)
  worksheet.getColumn(4).numFmt = 'dd/mm/yyyy';
  worksheet.getColumn(4).eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    if (rowNumber > 1) {
      // Convertir el valor de ejemplo a número de Excel
      const fechaStr = cell.value as string;
      if (fechaStr && typeof fechaStr === 'string') {
        const fechaParsed = parsearFecha(fechaStr);
        if (fechaParsed) {
          const fecha = new Date(fechaParsed);
          cell.value = fecha;
        }
      }
    }
  });

  // Formato de fecha para Fecha de Ingreso (columna H, índice 8)
  worksheet.getColumn(8).numFmt = 'dd/mm/yyyy';
  worksheet.getColumn(8).eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    if (rowNumber > 1) {
      const fechaStr = cell.value as string;
      if (fechaStr && typeof fechaStr === 'string' && fechaStr.trim() !== '') {
        const fechaParsed = parsearFecha(fechaStr);
        if (fechaParsed) {
          const fecha = new Date(fechaParsed);
          cell.value = fecha;
        }
      }
    }
  });

  // Generar buffer y descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla-trabajadores.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Lee y valida un archivo Excel con normalización
 */
export function leerArchivoExcel(
  file: File,
): Promise<{
  trabajadores: TrabajadorExcelRow[];
  errores: ExcelValidationError[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('El archivo Excel no contiene hojas');
        }
        const firstSheet = workbook.Sheets[firstSheetName];
        if (!firstSheet) {
          throw new Error('No se pudo leer la hoja del archivo Excel');
        }
        const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

        const trabajadores: TrabajadorExcelRow[] = [];
        const errores: ExcelValidationError[] = [];

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // +2 porque la fila 1 es el header y el índice empieza en 0
          const erroresFila: ExcelValidationError[] = [];

          // Mapear nombres de columnas en español a propiedades
          const primerApellido = String(row['Primer Apellido'] || '').trim();
          const segundoApellido = String(row['Segundo Apellido'] || '').trim();
          const nombre = String(row['Nombre(s)'] || '').trim();
          const fechaNacimientoRaw = String(row['Fecha de Nacimiento'] || '').trim();
          const sexoRaw = String(row['Sexo'] || '').trim();
          const escolaridadRaw = String(row['Escolaridad'] || '').trim();
          const puesto = String(row['Puesto'] || '').trim();
          const fechaIngresoRaw = String(row['Fecha de Ingreso'] || '').trim();
          const telefono = String(row['Teléfono'] || '').trim();
          const estadoCivilRaw = String(row['Estado Civil'] || '').trim();
          const curp = String(row['CURP'] || '').trim();

          // Normalizar valores
          const sexo = normalizarValor(sexoRaw, NORMALIZACION_SEXO);
          const escolaridad = normalizarValor(escolaridadRaw, NORMALIZACION_ESCOLARIDAD);
          const estadoCivil = normalizarValor(estadoCivilRaw, NORMALIZACION_ESTADO_CIVIL);

          // Parsear fechas
          const fechaNacimiento = parsearFecha(fechaNacimientoRaw);
          const fechaIngreso = fechaIngresoRaw ? parsearFecha(fechaIngresoRaw) : null;

          // Validar campos requeridos
          if (!primerApellido) {
            erroresFila.push({
              row: rowNumber,
              field: 'Primer Apellido',
              message: 'El primer apellido es requerido',
            });
          }

          if (!nombre) {
            erroresFila.push({
              row: rowNumber,
              field: 'Nombre(s)',
              message: 'El nombre es requerido',
            });
          }

          if (!fechaNacimiento) {
            erroresFila.push({
              row: rowNumber,
              field: 'Fecha de Nacimiento',
              message: 'La fecha de nacimiento es requerida y debe tener formato DD/MM/YYYY o YYYY-MM-DD',
            });
          }

          if (!sexo || !SEXOS.includes(sexo)) {
            erroresFila.push({
              row: rowNumber,
              field: 'Sexo',
              message: `El sexo debe ser uno de: ${SEXOS.join(', ')}`,
            });
          }

          if (!escolaridad || !NIVELES_ESCOLARIDAD.includes(escolaridad)) {
            erroresFila.push({
              row: rowNumber,
              field: 'Escolaridad',
              message: `La escolaridad debe ser una de: ${NIVELES_ESCOLARIDAD.join(', ')}`,
            });
          }

          if (!puesto) {
            erroresFila.push({
              row: rowNumber,
              field: 'Puesto',
              message: 'El puesto es requerido',
            });
          }

          if (fechaIngresoRaw && !fechaIngreso) {
            erroresFila.push({
              row: rowNumber,
              field: 'Fecha de Ingreso',
              message: 'Formato de fecha inválido (use DD/MM/YYYY o YYYY-MM-DD)',
            });
          }

          if (telefono && telefono.trim() !== '') {
            const telefonoRegex = /^\+?[0-9]\d{3,14}$/;
            if (!telefonoRegex.test(telefono)) {
              erroresFila.push({
                row: rowNumber,
                field: 'Teléfono',
                message: 'Formato de teléfono inválido',
              });
            }
          }

          if (!estadoCivil || !ESTADOS_CIVILES.includes(estadoCivil)) {
            erroresFila.push({
              row: rowNumber,
              field: 'Estado Civil',
              message: `El estado civil debe ser uno de: ${ESTADOS_CIVILES.join(', ')}`,
            });
          }

          if (curp && curp.trim() !== '') {
            const curpRegex = /^[A-Za-z0-9\s\-_.\/#]{4,30}$/;
            if (!curpRegex.test(curp)) {
              erroresFila.push({
                row: rowNumber,
                field: 'CURP',
                message: 'Formato de CURP inválido',
              });
            }
          }

          if (erroresFila.length === 0) {
            trabajadores.push({
              primerApellido,
              segundoApellido: segundoApellido || undefined,
              nombre,
              fechaNacimiento: fechaNacimiento!,
              sexo,
              escolaridad,
              puesto,
              fechaIngreso: fechaIngreso || undefined,
              telefono: telefono || undefined,
              estadoCivil,
              curp: curp || undefined,
            });
          } else {
            errores.push(...erroresFila);
          }
        });

        resolve({ trabajadores, errores });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsArrayBuffer(file);
  });
}
