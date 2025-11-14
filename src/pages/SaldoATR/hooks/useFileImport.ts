/**
 * Hook para manejar la importación de archivos Saldo ATR
 */

import { useState, useCallback } from 'react';
import type { SaldoATRRow } from '../../../types';
import { parseSaldoATRImport, crearFilaVacia } from '../utils';

interface UseFileImportReturn {
  handleFileImport: (file: File, currentRows: SaldoATRRow[]) => Promise<SaldoATRRow[]>;
  error: string | null;
  success: string | null;
}

export const useFileImport = (): UseFileImportReturn => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mergeImportedData = useCallback(
    (currentRows: SaldoATRRow[], importedRows: SaldoATRRow[]): SaldoATRRow[] => {
      const updatedRows = [...currentRows];

      importedRows.forEach((importedRow, idx) => {
        const importedRecord = importedRow as Record<string, string>;

        if (idx < updatedRows.length) {
          const currentRow = updatedRows[idx];
          const merged = { ...currentRow } as Record<string, string>;

          ['A', 'B', 'C', 'G', 'H', 'I', 'J', 'K', 'L', 'P'].forEach((col) => {
            merged[col] = importedRecord[col] || '';
          });

          updatedRows[idx] = merged as SaldoATRRow;
        } else {
          const plantilla = updatedRows[0] || crearFilaVacia();
          const newRow = { ...plantilla } as Record<string, string>;

          ['A', 'B', 'C', 'G', 'H', 'I', 'J', 'K', 'L', 'P'].forEach((col) => {
            newRow[col] = importedRecord[col] || '';
          });

          updatedRows.push(newRow as SaldoATRRow);
        }
      });

      return updatedRows;
    },
    []
  );

  const handleFileImport = useCallback(
    async (file: File, currentRows: SaldoATRRow[]): Promise<SaldoATRRow[]> => {
      if (!file.name.endsWith('.csv')) {
        setError('Solo se aceptan archivos con extensión .csv');
        throw new Error('Solo se aceptan archivos con extensión .csv');
      }

      setError(null);
      setSuccess(null);

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const raw = ev.target?.result as string | null;
            if (!raw) throw new Error('Archivo vacío');

            const importedRows = parseSaldoATRImport(raw);
            const updatedRows = mergeImportedData(currentRows, importedRows);

            setSuccess(
              `✅ Datos del archivo Saldo ATR cargados correctamente. ${importedRows.length} registros procesados.`
            );
            setTimeout(() => setSuccess(null), 5000);

            resolve(updatedRows);
          } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'Error al procesar el archivo';
            setError(errorMsg);
            setTimeout(() => setError(null), 5000);
            reject(e);
          }
        };

        reader.onerror = () => {
          const errorMsg = 'Error al leer el archivo';
          setError(errorMsg);
          setTimeout(() => setError(null), 5000);
          reject(new Error(errorMsg));
        };

        reader.readAsText(file, 'UTF-8');
      });
    },
    [mergeImportedData]
  );

  return {
    handleFileImport,
    error,
    success,
  };
};
