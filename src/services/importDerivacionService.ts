/**
 * 📥 Servicio de Importación de Derivación Individual
 *
 * Importa y valida archivos CSV de derivación individual del SCE
 * con las 45 columnas exactas esperadas por el sistema.
 *
 * Replica la lógica de importación de la macro Excel.
 */

import type { DerivacionData } from '../types';
import * as XLSX from 'xlsx';

/**
 * Estructura de encabezados esperados (45 columnas A-AS)
 * Basado en el análisis del código VBA Módulo4
 */
const COLUMNAS_OBLIGATORIAS = [
  'Número Fiscal de Factura',
  'Potencia',
  'Código de contrato externo - interfaz',
  'Secuencial de factura',
  'Tipo de factura',
  'Estado de la factura',
  'Fecha desde',
  'Fecha hasta',
  'Importe Factura',
  'Fuente de la factura',
  'Tipo de Fuente',
  'Descripción Tipo de fuente',
  'Tipo de Fuente Anterior',
  'Descripción Tipo de fuente Anterior',
  'Tipo de punto de medida',
  'Consumo P1/punta',
  'Consumo P2/llano',
  'Consumo P3/valle',
  'Consumo P4/supervalle',
  'Consumo P5',
  'Consumo P6',
  'Consumo Reactiva1',
  'Consumo Reactiva2',
  'Consumo Reactiva3',
  'Consumo Reactiva4',
  'Consumo Reactiva5',
  'Consumo Reactiva6',
  'Consumo cargo-abono P1/punta',
  'Consumo cargo-abono P2/llano',
  'Consumo cargo-abono P3/valle',
  'Consumo cargo/abono P4',
  'Consumo cargo/abono P5',
  'Consumo cargo/abono P6',
  'Consumo pérdidas P1/punta',
  'Consumo pérdidas P2/llano',
  'Consumo pérdidas P3/valle',
  'Consumo pérdidas P4',
  'Consumo pérdidas P5',
  'Consumo pérdidas P6',
  'Maxímetro P1/Punta',
  'Maxímetro P2/Llano',
  'Maxímetro P3/Valle',
  'Maxímetro P4',
  'Maxímetro P5',
  'Maxímetro P6',
  'Origen',
] as const;

const COLUMNAS_OPCIONALES = [
  'Contrato',
  'Maxímetro',
  'Consumo Activa',
  'Promedio Activa',
  'Consumo Reactiva',
  'Promedio Reactiva',
  'Energía Total Reconstruida',
  'A + B + C',
  'AB - A',
  'AB - C',
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'P6',
  'Días',
  'Consumo promedio ciclo',
  'Promedio ER',
] as const;

const COLUMNAS_PERMITIDAS = [...COLUMNAS_OBLIGATORIAS, ...COLUMNAS_OPCIONALES] as const;

type ColumnaPermitida = (typeof COLUMNAS_PERMITIDAS)[number];

const ALIAS_COLUMNAS: Record<string, ColumnaPermitida> = {
  'Código de Empresa Distribuidora': 'Potencia',
  'Codigo de Empresa Distribuidora': 'Potencia',
  'Secuencial factura': 'Secuencial de factura',
  'Consumo Activo': 'Consumo Activa',
  'Promedio Activo': 'Promedio Activa',
  'Energia Total Reconstruida': 'Energía Total Reconstruida',
  'AB-A': 'AB - A',
  'AB-C': 'AB - C',
  'Código de contrato externo': 'Código de contrato externo - interfaz',
  'Codigo de contrato externo': 'Código de contrato externo - interfaz',
  'Codigo de contrato externo - interfaz': 'Código de contrato externo - interfaz',
};

const COLUMNAS_CRITICAS: ColumnaPermitida[] = [
  'Número Fiscal de Factura',
  'Código de contrato externo - interfaz',
  'Estado de la factura',
  'Fecha desde',
];

const limpiarClave = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\s_-]+/g, ' ')
    .trim()
    .toLowerCase();

const MAPA_CLAVES_PERMITIDAS = new Map<string, ColumnaPermitida>();
(COLUMNAS_PERMITIDAS as readonly ColumnaPermitida[]).forEach((columna) => {
  MAPA_CLAVES_PERMITIDAS.set(limpiarClave(columna), columna);
});
Object.entries(ALIAS_COLUMNAS).forEach(([alias, destino]) => {
  MAPA_CLAVES_PERMITIDAS.set(limpiarClave(alias), destino);
});

const normalizarEncabezado = (encabezado: string): ColumnaPermitida | null => {
  const limpio = encabezado?.trim();
  if (!limpio) {
    return null;
  }

  const clave = limpiarClave(limpio);
  return MAPA_CLAVES_PERMITIDAS.get(clave) ?? null;
};

/**
 * Resultado de la importación con validación detallada
 */
export interface ResultadoImportacionDerivacion {
  exito: boolean;
  registrosImportados: number;
  registrosRechazados: number;
  errores: ErrorImportacion[];
  advertencias: string[];
  datos: DerivacionData[];
  vistaPrevia: DerivacionData[];
}

/**
 * Error de importación con contexto
 */
export interface ErrorImportacion {
  fila: number;
  columna?: string;
  mensaje: string;
  valorProblematico?: string;
}

/**
 * Importa archivo CSV/Excel de derivación individual
 *
 * @param archivo - File object del input
 * @returns Resultado de importación con errores detallados
 */
export const importarArchivoDerivacion = async (
  archivo: File
): Promise<ResultadoImportacionDerivacion> => {
  const errores: ErrorImportacion[] = [];
  const advertencias: string[] = [];
  const datos: DerivacionData[] = [];

  try {
    // Leer archivo (soporta .csv, .xlsx, .xls)
    const buffer = await archivo.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    // Tomar primera hoja
    const primeraHoja = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[primeraHoja];

    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      dateNF: 'dd/mm/yyyy',
    }) as string[][];

    if (jsonData.length === 0) {
      errores.push({
        fila: 0,
        mensaje: 'El archivo está vacío',
      });
      return crearResultadoVacio(errores, advertencias);
    }

    // Validar encabezados
    const encabezadosArchivo = jsonData[0];
    const validacionEncabezados = validarEncabezados(encabezadosArchivo);

    if (validacionEncabezados.mensaje) {
      errores.push({
        fila: 1,
        mensaje: validacionEncabezados.mensaje,
      });

      if (validacionEncabezados.faltanCriticos) {
        return crearResultadoVacio(errores, advertencias);
      }

      if (validacionEncabezados.columnasFaltantes.length > 0) {
        advertencias.push(
          `Columnas obligatorias faltantes: ${validacionEncabezados.columnasFaltantes
            .slice(0, 5)
            .join(', ')}${
            validacionEncabezados.columnasFaltantes.length > 5
              ? ` y ${validacionEncabezados.columnasFaltantes.length - 5} más`
              : ''
          }`
        );
      }

      if (validacionEncabezados.columnasExtras.length > 0) {
        advertencias.push(
          `Columnas no reconocidas: ${validacionEncabezados.columnasExtras.slice(0, 5).join(', ')}${
            validacionEncabezados.columnasExtras.length > 5
              ? ` y ${validacionEncabezados.columnasExtras.length - 5} más`
              : ''
          }`
        );
      }
    }

    // Procesar filas de datos (desde fila 2)
    for (let i = 1; i < jsonData.length; i++) {
      const fila = jsonData[i];
      const numeroFila = i + 1;

      try {
        const registro = parsearFilaDerivacion(encabezadosArchivo, fila);

        // Validar registro
        const erroresValidacion = validarRegistroDerivacion(registro, numeroFila);

        if (erroresValidacion.length > 0) {
          errores.push(...erroresValidacion);
          // Continuar procesando (registro rechazado pero no para ejecución)
        } else {
          datos.push(registro);
        }
      } catch (error) {
        errores.push({
          fila: numeroFila,
          mensaje: `Error al procesar fila: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        });
      }
    }

    // Generar vista previa (primeras 10 filas)
    const vistaPrevia = datos.slice(0, 10);

    return {
      exito: datos.length > 0,
      registrosImportados: datos.length,
      registrosRechazados: jsonData.length - 1 - datos.length,
      errores,
      advertencias,
      datos,
      vistaPrevia,
    };
  } catch (error) {
    errores.push({
      fila: 0,
      mensaje: `Error fatal al leer archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    });
    return crearResultadoVacio(errores, advertencias);
  }
};

/**
 * Valida que los encabezados del archivo coincidan con los esperados
 */
interface ResultadoValidacionEncabezados {
  mensaje: string | null;
  faltanCriticos: boolean;
  columnasFaltantes: ColumnaPermitida[];
  columnasExtras: string[];
}

const validarEncabezados = (encabezados: string[]): ResultadoValidacionEncabezados => {
  const columnasNormalizadas = encabezados.map(normalizarEncabezado);

  const columnasFaltantes = COLUMNAS_OBLIGATORIAS.filter(
    (columna) => !columnasNormalizadas.includes(columna)
  );

  const columnasExtras = encabezados.filter((columna) => normalizarEncabezado(columna) === null);

  const mensajes: string[] = [];

  if (columnasFaltantes.length > 0) {
    mensajes.push(
      `Columnas faltantes: ${columnasFaltantes
        .slice(0, 5)
        .join(', ')}${columnasFaltantes.length > 5 ? '…' : ''}`
    );
  }

  if (columnasExtras.length > 0) {
    mensajes.push(
      `Columnas no reconocidas: ${columnasExtras
        .slice(0, 5)
        .join(', ')}${columnasExtras.length > 5 ? '…' : ''}`
    );
  }

  const faltanCriticos = columnasFaltantes.some((columna) => COLUMNAS_CRITICAS.includes(columna));

  return {
    mensaje: mensajes.length > 0 ? mensajes.join(' | ') : null,
    faltanCriticos,
    columnasFaltantes,
    columnasExtras,
  };
};

/**
 * Parsea una fila del CSV a objeto DerivacionData
 */
const parsearFilaDerivacion = (encabezados: string[], valores: string[]): DerivacionData => {
  const registro: Partial<DerivacionData> = {};

  const registroMutable = registro as Record<string, string>;
  encabezados.forEach((encabezado, index) => {
    const columna = normalizarEncabezado(encabezado);
    if (!columna) {
      return;
    }

    const valor = valores[index] ?? '';
    registroMutable[columna] = valor;
  });

  return registro as DerivacionData;
};

/**
 * Valida un registro de derivación
 */
const validarRegistroDerivacion = (
  registro: DerivacionData,
  numeroFila: number
): ErrorImportacion[] => {
  const errores: ErrorImportacion[] = [];

  // Validar fecha obligatoria
  if (!registro['Fecha desde']) {
    errores.push({
      fila: numeroFila,
      columna: 'Fecha desde',
      mensaje: 'Fecha desde es obligatoria',
    });
  } else if (!validarFormatoFecha(registro['Fecha desde'])) {
    errores.push({
      fila: numeroFila,
      columna: 'Fecha desde',
      mensaje: 'Formato de fecha inválido (esperado DD/MM/YYYY)',
      valorProblematico: registro['Fecha desde'],
    });
  }

  // Validar estado de factura
  if (!registro['Estado de la factura']) {
    errores.push({
      fila: numeroFila,
      columna: 'Estado de la factura',
      mensaje: 'Estado de factura es obligatorio',
    });
  }

  // Validar consumos numéricos
  const camposConsumo = ['Consumo P1/punta', 'Consumo P2/llano', 'Consumo P3/valle'] as const;

  camposConsumo.forEach((campo) => {
    const valor = registro[campo];
    if (valor && valor !== '-' && isNaN(convertirANumero(valor))) {
      errores.push({
        fila: numeroFila,
        columna: campo,
        mensaje: 'Valor numérico inválido',
        valorProblematico: String(valor),
      });
    }
  });

  return errores;
};

/**
 * Valida formato de fecha DD/MM/YYYY
 */
const validarFormatoFecha = (fecha: string): boolean => {
  if (!fecha) return false;

  // Formato DD/MM/YYYY
  const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = fecha.match(regex);

  if (!match) return false;

  const [, dia, mes, año] = match.map(Number);

  // Validar rangos
  if (mes < 1 || mes > 12) return false;
  if (dia < 1 || dia > 31) return false;
  if (año < 1900 || año > 2100) return false;

  return true;
};

/**
 * Convierte string con formato español a número
 * Ejemplo: "1.234,56" -> 1234.56
 */
const convertirANumero = (valor: string | number): number => {
  if (typeof valor === 'number') return valor;
  if (!valor || valor === '-') return 0;

  // Reemplazar formato español: 1.234,56 -> 1234.56
  const numeroStr = String(valor)
    .replace(/\./g, '') // Eliminar separador de miles
    .replace(',', '.'); // Reemplazar coma decimal por punto

  const numero = parseFloat(numeroStr);

  return isNaN(numero) ? 0 : numero;
};

/**
 * Crea resultado vacío con errores
 */
const crearResultadoVacio = (
  errores: ErrorImportacion[],
  advertencias: string[]
): ResultadoImportacionDerivacion => {
  return {
    exito: false,
    registrosImportados: 0,
    registrosRechazados: 0,
    errores,
    advertencias,
    datos: [],
    vistaPrevia: [],
  };
};

/**
 * Formatea errores para mostrar al usuario
 */
export const formatearErroresImportacion = (errores: ErrorImportacion[]): string => {
  if (errores.length === 0) return '';

  const erroresPorFila = errores.slice(0, 5); // Mostrar solo primeros 5
  const mensajes = erroresPorFila.map((e) => {
    let mensaje = `Fila ${e.fila}`;
    if (e.columna) mensaje += ` - ${e.columna}`;
    mensaje += `: ${e.mensaje}`;
    if (e.valorProblematico) mensaje += ` (valor: "${e.valorProblematico}")`;
    return mensaje;
  });

  if (errores.length > 5) {
    mensajes.push(`... y ${errores.length - 5} errores más`);
  }

  return mensajes.join('\n');
};

export { COLUMNAS_OBLIGATORIAS, COLUMNAS_OPCIONALES, COLUMNAS_PERMITIDAS };
