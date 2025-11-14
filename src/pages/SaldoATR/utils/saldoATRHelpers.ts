/**
 * Funciones auxiliares para SaldoATR
 * Extraídas del componente principal para mejorar mantenibilidad
 */
import type { DerivacionData, SaldoATRColumna, SaldoATRRow } from '../../../types';
import { COLUMN_LETTERS, DEFAULT_HEADERS } from './index';

/**
 * Palabras clave para detectar facturas anuladas
 */
export const PALABRAS_CLAVE_ANULACION = [
  'ANULADA',
  'ANULADOR',
  'COMPLEMENTARIA',
  'SUSTITUIDA',
  'SUSTITUYENTE',
] as const;

/**
 * Columnas a revisar para detectar anulaciones
 */
export const COLUMNAS_REVISION_ANULACION: readonly SaldoATRColumna[] = ['E', 'F', 'K', 'L'];

/**
 * Máximo de facturas a mostrar en el detalle de anulación
 */
export const MAX_FACTURAS_DETALLE = 5;

/**
 * Obtiene un identificador legible de una fila de Saldo ATR
 * @param fila - Fila de datos de Saldo ATR
 * @returns Identificador en formato "Factura XXX", "Secuencial XXX", etc.
 */
export const obtenerIdentificadorSaldoAtr = (fila: SaldoATRRow): string => {
  const numeroFiscal = fila['A']?.trim();
  if (numeroFiscal) {
    return `Factura ${numeroFiscal}`;
  }

  const secuencial = fila['D']?.trim();
  if (secuencial) {
    return `Secuencial ${secuencial}`;
  }

  const contrato = fila['C']?.trim();
  if (contrato) {
    return `Contrato ${contrato}`;
  }

  return 'Registro sin identificador';
};

/**
 * Convierte una fecha en formato dd/mm/yyyy a timestamp Unix
 * @param valor - Fecha en formato "dd/mm/yyyy"
 * @returns Timestamp Unix o Number.MAX_SAFE_INTEGER si inválido
 */
export const obtenerTimestampDesdeFecha = (valor: string): number => {
  if (!valor) {
    return Number.MAX_SAFE_INTEGER;
  }

  const partes = valor.split('/');
  if (partes.length !== 3) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [dia, mes, anio] = partes.map((fragmento) => Number(fragmento));
  if (Number.isNaN(dia) || Number.isNaN(mes) || Number.isNaN(anio)) {
    return Number.MAX_SAFE_INTEGER;
  }

  const fecha = new Date(anio, mes - 1, dia);
  const timestamp = fecha.getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
};

/**
 * Convierte registros de Saldo ATR a formato DerivacionData
 * @param registros - Array de filas de Saldo ATR
 * @param headers - Headers de las columnas
 * @returns Objeto con registros convertidos y columnas
 */
export const convertirSaldoAtrADerivacion = (
  registros: SaldoATRRow[],
  headers: string[]
): { registros: DerivacionData[]; columnas: string[] } => {
  const fallbackHeaders = COLUMN_LETTERS.map((columna) => DEFAULT_HEADERS[columna] ?? '');
  const normalizarNombreColumna = (nombre: string): string => {
    if (!nombre) return '';
    const limpio = nombre.trim();
    if (limpio.toLowerCase() === 'código de empresa distribuidora') {
      return 'Potencia';
    }
    return limpio;
  };

  const nombresColumnas = (
    headers.length === COLUMN_LETTERS.length && headers.some((nombre) => nombre)
      ? headers
      : fallbackHeaders
  ).map(normalizarNombreColumna);

  const registrosDerivacion = registros
    .map((fila) => {
      const registro: Record<string, string | number> = {};

      COLUMN_LETTERS.forEach((columna, indice) => {
        const nombreCampo = nombresColumnas[indice];
        if (nombreCampo) {
          registro[nombreCampo] = fila[columna] ?? '';
        }
      });

      return registro as unknown as DerivacionData;
    })
    .filter((registro) => {
      const fecha = ((registro['Fecha desde'] as string) || '').trim();
      return fecha.length > 0;
    });

  return {
    registros: registrosDerivacion,
    columnas: nombresColumnas,
  };
};
