/**
 * Utilidades de parsing para Saldo ATR
 */

import type { SaldoATRRow } from '../../../types';
import { COLUMN_LETTERS, COLUMNS_TO_EMPTY } from './constants';

/**
 * Crea una fila vacía con todas las columnas A..AT inicializadas
 */
export const crearFilaVacia = (): SaldoATRRow => {
  const row = {} as Record<string, string>;
  COLUMN_LETTERS.forEach((col) => {
    row[col] = '';
  });
  return row as SaldoATRRow;
};

/**
 * Parsea el CSV "Interfaz Saldo ATR" base (46 columnas A..AT) para cargar la plantilla inicial.
 */
export function parseInterfazBaseCSV(raw: string): { headers: string[]; rows: SaldoATRRow[] } {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0 && !l.startsWith('#'));
  if (lines.length === 0) return { headers: [], rows: [] };

  const headerLine = lines[0];
  const headerParts = headerLine.split(';').map((h) => h.trim());

  if (headerParts.length !== 46) {
    throw new Error(`Se esperaban 46 columnas en base, se recibieron ${headerParts.length}`);
  }

  const parsedRows: SaldoATRRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(';');
    while (parts.length < 46) parts.push('');

    const row = crearFilaVacia();
    COLUMN_LETTERS.forEach((colLetter, idx) => {
      if (!COLUMNS_TO_EMPTY.has(colLetter)) {
        (row as Record<string, string>)[colLetter] = (parts[idx] ?? '').trim();
      }
    });
    parsedRows.push(row);
  }
  return { headers: headerParts, rows: parsedRows };
}

/**
 * Parsea el CSV "Saldo ATR.csv" (14 columnas A-N) y mapea a las columnas destino.
 * Mapeo de datos:
 * - CSV[8] Código factura → Destino A (Número Fiscal de Factura)
 * - CSV[7] Potencia (kW) → Destino B (Potencia)
 * - CSV[1] Contrato ATR → Destino C (Código de contrato externo)
 * - CSV[2] Fecha desde → Destino G (Fecha desde)
 * - CSV[3] Fecha hasta → Destino H (Fecha hasta)
 * - CSV[4] Consumo total activa → Destino I (Importe Factura)
 * - CSV[5] Fuente agregada → Destino J (Fuente de la factura)
 * - CSV[6] Estado medida → Destino K (Estado medida)
 * - CSV[9] Tipo de factura → Destino L (Tipo de factura)
 * - CSV[4] Consumo total activa → Destino P (Consumo P1/punta)
 */
export function parseSaldoATRImport(raw: string): SaldoATRRow[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) throw new Error('El archivo está vacío');

  const headerLine = lines[0];
  const headerParts = headerLine.split(';').map((h) => h.trim().replace(/^"|"$/g, ''));

  if (headerParts.length !== 14) {
    throw new Error(
      `El archivo no coincide con el formato esperado de Saldo ATR.csv. Se esperaban 14 columnas, se recibieron ${headerParts.length}.`
    );
  }

  const mappedRows: SaldoATRRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(';').map((p) => p.trim().replace(/^"|"$/g, ''));

    while (parts.length < 14) parts.push('');

    const row = crearFilaVacia();
    const rowRecord = row as Record<string, string>;

    rowRecord['A'] = parts[8] || '';
    rowRecord['B'] = parts[7] || '';
    rowRecord['C'] = parts[1] || '';
    rowRecord['G'] = parts[2] || '';
    rowRecord['H'] = parts[3] || '';
    rowRecord['I'] = parts[4] || '';
    rowRecord['J'] = parts[5] || '';
    rowRecord['K'] = parts[6] || '';
    rowRecord['L'] = parts[9] || '';
    rowRecord['P'] = parts[4] || '';

    mappedRows.push(row);
  }

  return mappedRows;
}
