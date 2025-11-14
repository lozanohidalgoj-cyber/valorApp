/**
 * Hook para cargar la base de datos de Saldo ATR desde archivo CSV
 */

import { useState, useEffect } from 'react';
import type { SaldoATRRow } from '../../../types';
import { parseInterfazBaseCSV, COLUMN_LETTERS, DEFAULT_HEADERS } from '../utils';

interface UseSaldoATRBaseReturn {
  rows: SaldoATRRow[];
  headers: string[];
  loading: boolean;
  error: string | null;
}

export const useSaldoATRBase = (): UseSaldoATRBaseReturn => {
  const [rows, setRows] = useState<SaldoATRRow[]>([]);
  const [headers, setHeaders] = useState<string[]>(() =>
    COLUMN_LETTERS.map((c) => DEFAULT_HEADERS[c] ?? `Columna ${c}`)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarBase = async () => {
      try {
        const resp = await fetch('/saldoATR_base.csv', { cache: 'no-store' });
        if (!resp.ok) throw new Error('No se pudo cargar la base de Saldo ATR');

        const text = await resp.text();
        const { headers: h, rows: r } = parseInterfazBaseCSV(text);

        setHeaders(h);
        setRows(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar la base de Saldo ATR');
      } finally {
        setLoading(false);
      }
    };
    cargarBase();
  }, []);

  return {
    rows,
    headers,
    loading,
    error,
  };
};
